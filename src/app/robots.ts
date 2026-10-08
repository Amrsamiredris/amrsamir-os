import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/keystatic", "/api/", "/for/", "/dashboard"] },
    sitemap: "https://amrsamir.me/sitemap.xml",
  };
}
