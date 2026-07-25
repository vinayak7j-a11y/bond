// Builds a standards-compliant .vcf so "Save Contact" works identically
// on iOS and Android without any native app — the browser just hands the
// file to the OS's native contact-add sheet.

type VCardInput = {
  name: string;
  headline?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null; // bond.app/username, used as the URL field
  photoUrl?: string | null;
};

export function buildVCard(input: VCardInput): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");
  lines.push(`FN:${escapeVCard(input.name)}`);
  if (input.headline) lines.push(`TITLE:${escapeVCard(input.headline)}`);
  if (input.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(input.phone)}`);
  if (input.email) lines.push(`EMAIL:${escapeVCard(input.email)}`);
  if (input.website) lines.push(`URL:${escapeVCard(input.website)}`);
  // WhatsApp has no dedicated vCard field; stored as a labeled note so it
  // survives import instead of silently getting dropped.
  if (input.whatsapp) lines.push(`NOTE:WhatsApp: ${escapeVCard(input.whatsapp)}`);
  if (input.photoUrl) lines.push(`PHOTO;VALUE=URI:${input.photoUrl}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
