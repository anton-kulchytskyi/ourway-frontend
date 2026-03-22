import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OurWay — Family Task Manager",
    short_name: "OurWay",
    description: "Family tasks, Kanban board and gamification for kids",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f59e0b",
    theme_color: "#f59e0b",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
