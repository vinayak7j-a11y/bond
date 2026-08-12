// Run locally, NOT part of the Next.js app: npx tsx scripts/generate-tags.ts <count>
//
// Generates <count> unique, high-entropy codes, inserts them as unclaimed
// Tag rows, and writes a CSV of code -> full URL for a manufacturer to
// encode onto physical NFC chips / print as QR codes.
//
// CRITICAL: these URLs get baked into physical, unchangeable hardware.
// Do NOT run this against a temporary/preview domain (a Vercel preview
// URL, a *.vercel.app subdomain) unless you are 100% certain that's the
// domain you want permanently associated with real manufactured stock.
// If the domain changes later, every tag already printed becomes dead —
// there is no fixing that after the fact. Set TAG_DOMAIN explicitly.
import { PrismaClient } from "@prisma/client";
import { randomInt } from "crypto";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();

// No 0/O, 1/I/l — these get misread off a printed card or a manufacturing
// proof sheet by an actual human at some point in this process.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8; // 32^8 ≈ 1.1 trillion combinations — unguessable at any real batch size

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

async function main() {
  const count = Number(process.argv[2] ?? 0);
  if (!Number.isFinite(count) || count <= 0) {
    console.error("Usage: npx tsx scripts/generate-tags.ts <count>");
    process.exit(1);
  }

  const domain = process.env.TAG_DOMAIN;
  if (!domain) {
    console.error(
      "ERROR: set TAG_DOMAIN before generating tags for real manufacturing.\n" +
        "  Example: TAG_DOMAIN=https://bond.app npx tsx scripts/generate-tags.ts 100\n\n" +
        "This is deliberately NOT defaulted to anything — a wrong domain baked\n" +
        "into physical hardware can't be fixed after the fact. Only point this\n" +
        "at your final production domain, never a *.vercel.app preview URL."
    );
    process.exit(1);
  }

  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let code = generateCode();
    while (codes.includes(code)) code = generateCode();
    codes.push(code);
  }

  const inserted = await prisma.tag.createMany({ data: codes.map((code) => ({ code })), skipDuplicates: true });
  if (inserted.count !== codes.length) {
    console.warn(
      `WARNING: requested ${codes.length} codes but only ${inserted.count} were inserted — ` +
        `a generated code must have collided with one already in the database. The CSV below ` +
        `lists all ${codes.length} anyway; double-check before sending it to a manufacturer.`
    );
  }

  const rows = ["code,url", ...codes.map((c) => `${c},${domain}/t/${c}`)];
  const filename = `tags-${Date.now()}.csv`;
  writeFileSync(filename, rows.join("\n"));

  console.log(`Generated ${count} unclaimed tags against ${domain}`);
  console.log(`Saved to ${filename} — send this to your manufacturer.`);
  console.log(`Each row's "url" column is what gets encoded onto that unit's NFC chip / QR code.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
