// Builds a standards-compliant .vcf so "Save Contact" works identically
// on iOS and Android without any native app — the browser just hands the
// file to the OS's native contact-add sheet.

import { FieldType } from "./fieldTypes";

type VCardField = { key?: string | null; type: FieldType; label: string; value: string };

type VCardInput = {
  name: string;
  photoUrl?: string | null;
  website?: string | null; // bond.app/username/slug, used as the primary URL field
  fields: VCardField[];
};

export function buildVCard(input: VCardInput): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");
  lines.push(`FN:${escapeVCard(input.name)}`);

  const headline = input.fields.find((f) => f.key === "headline" && f.value)?.value;
  if (headline) lines.push(`TITLE:${escapeVCard(headline)}`);

  const phone = input.fields.find((f) => f.type === "PHONE" && f.value)?.value;
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);

  const email = input.fields.find((f) => f.type === "EMAIL" && f.value)?.value;
  if (email) lines.push(`EMAIL:${escapeVCard(email)}`);

  if (input.website) lines.push(`URL:${escapeVCard(input.website)}`);
  for (const link of input.fields.filter((f) => f.type === "LINK" && f.value)) {
    lines.push(`URL:${escapeVCard(link.value)}`);
  }

  // WhatsApp has no dedicated vCard field, and freeform text fields (Skills,
  // Achievements, "favorite food," anything custom) have no field at all —
  // both survive import as a single labeled NOTE instead of being dropped.
  const noteParts: string[] = [];
  const about = input.fields.find((f) => f.key === "about" && f.value)?.value;
  if (about) noteParts.push(`About: ${about}`);
  const whatsapp = input.fields.find((f) => f.type === "WHATSAPP" && f.value)?.value;
  if (whatsapp) noteParts.push(`WhatsApp: ${whatsapp}`);
  for (const text of input.fields.filter(
    (f) => (f.type === "TEXT" || f.type === "LONG_TEXT") && f.key !== "headline" && f.key !== "about" && f.value
  )) {
    noteParts.push(`${text.label}: ${text.value}`);
  }
  if (noteParts.length) lines.push(`NOTE:${escapeVCard(noteParts.join(" | "))}`);

  if (input.photoUrl) lines.push(`PHOTO;VALUE=URI:${input.photoUrl}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
