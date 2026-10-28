import { legalConfig } from "./legal-config";

export function legalHead(title: string, description: string, path: string) {
  const pageTitle = `${title} — ${legalConfig.serviceName}`;
  const url = `${legalConfig.siteUrl}${path}`;
  return {
    meta: [
      { title: pageTitle },
      { name: "description", content: description },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
