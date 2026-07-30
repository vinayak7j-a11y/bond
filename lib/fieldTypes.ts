export type FieldType = "TEXT" | "LONG_TEXT" | "LINK" | "PHONE" | "WHATSAPP" | "EMAIL";

export type FieldDraft = {
  id?: string; // present for existing fields, absent for newly added ones
  key?: string | null;
  type: FieldType;
  label: string;
  value: string;
  order: number;
};

export const FIELD_TYPE_META: Record<FieldType, { name: string; placeholder: string }> = {
  TEXT: { name: "Short text", placeholder: "e.g. Skills, Favorite food, anything short" },
  LONG_TEXT: { name: "Paragraph", placeholder: "e.g. About, Achievements, a longer note" },
  LINK: { name: "Link", placeholder: "e.g. Resume, Portfolio, LinkedIn, Instagram — any URL" },
  PHONE: { name: "Phone (Call button)", placeholder: "Phone number" },
  WHATSAPP: { name: "WhatsApp (button)", placeholder: "WhatsApp number" },
  EMAIL: { name: "Email (button)", placeholder: "Email address" },
};

export const FIELD_TYPES = Object.keys(FIELD_TYPE_META) as FieldType[];

// Contact-type fields render as the quick-action button row on a profile,
// same visual slot the old hardcoded whatsapp/phone/email columns used.
export const ACTION_TYPES: FieldType[] = ["PHONE", "WHATSAPP", "EMAIL"];
