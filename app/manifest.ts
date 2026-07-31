import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bond — The future of human connections",
    short_name: "Bond",
    description: "Tap. Save. Remember. Turn an introduction into a relationship.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0F11",
    theme_color: "#0E0F11",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
