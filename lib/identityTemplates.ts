import { FieldDraft } from "./fieldTypes";

export type Template = {
  id: string;
  name: string;
  description: string;
  fields: Omit<FieldDraft, "id">[];
};

// Every template is just a pre-filled starting set of Fields (empty values,
// owner fills them in) — nothing here is special-cased beyond the two
// layout keys ("headline", "about"). Delete, rename, retype, or add to any
// of them freely; "Blank" exists for people who'd rather start from zero.
export const TEMPLATES: Template[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Headline, about, resume, and the usual work links.",
    fields: [
      { key: "headline", type: "TEXT", label: "Headline", value: "", order: 0 },
      { key: "about", type: "LONG_TEXT", label: "About", value: "", order: 1 },
      { type: "EMAIL", label: "Email", value: "", order: 2 },
      { type: "PHONE", label: "Phone", value: "", order: 3 },
      { type: "LINK", label: "LinkedIn", value: "", order: 4 },
      { type: "LINK", label: "Resume", value: "", order: 5 },
      { type: "LINK", label: "Portfolio", value: "", order: 6 },
      { type: "TEXT", label: "Skills", value: "", order: 7 },
      { type: "LONG_TEXT", label: "Key achievements", value: "", order: 8 },
    ],
  },
  {
    id: "just-contact",
    name: "Just Contact",
    description: "The bare minimum — a fast way to trade numbers.",
    fields: [
      { type: "PHONE", label: "Phone", value: "", order: 0 },
      { type: "WHATSAPP", label: "WhatsApp", value: "", order: 1 },
      { type: "EMAIL", label: "Email", value: "", order: 2 },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    description: "About, socials, and room for whatever feels like you.",
    fields: [
      { key: "about", type: "LONG_TEXT", label: "About", value: "", order: 0 },
      { type: "WHATSAPP", label: "WhatsApp", value: "", order: 1 },
      { type: "LINK", label: "Instagram", value: "", order: 2 },
      { type: "TEXT", label: "Something fun about me", value: "", order: 3 },
    ],
  },
  {
    id: "blank",
    name: "Blank",
    description: "Start from nothing and build it yourself.",
    fields: [],
  },
];
