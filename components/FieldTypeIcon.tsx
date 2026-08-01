import type { FieldType } from "@/lib/fieldTypes";

// Deliberately hand-rolled rather than pulling in an icon library — this
// codebase has stayed dependency-light throughout, and six small icons
// don't earn a new package.
export function FieldTypeIcon({ type, className }: { type: FieldType; className?: string }) {
  const common = { className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (type) {
    case "TEXT":
      return (
        <svg {...common}>
          <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "LONG_TEXT":
      return (
        <svg {...common}>
          <path
            d="M3 3.5h10M3 6.5h10M3 9.5h10M3 12.5h6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "LINK":
      return (
        <svg {...common}>
          <path
            d="M6.5 9.5l3-3M5.8 6.6L7 5.4a2.1 2.1 0 013 3l-1.2 1.2M10.2 9.4L9 10.6a2.1 2.1 0 01-3-3l1.2-1.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "PHONE":
      return (
        <svg {...common}>
          <path
            d="M4.5 3h2l1 3-1.5 1.2a7 7 0 003.8 3.8L11 9.5l3 1v2c0 .8-.7 1.4-1.5 1.3A11 11 0 013.2 4.5C3.1 3.7 3.7 3 4.5 3z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "WHATSAPP":
      return (
        <svg {...common}>
          <path
            d="M8 3.2a4.8 4.8 0 00-4.1 7.3L3.2 13l2.6-.7A4.8 4.8 0 108 3.2z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M6.2 6.6c.1-.4.5-.4.7-.2l.6.7c.1.2.1.4 0 .6l-.3.4c.3.6.9 1.1 1.5 1.4l.4-.3c.2-.1.4-.1.6 0l.7.6c.2.2.2.5-.1.7-.9.6-2.1.3-3-.4-.9-.7-1.5-1.9-1.1-2.9z"
            fill="currentColor"
          />
        </svg>
      );
    case "EMAIL":
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 5l5 3.5L13 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
