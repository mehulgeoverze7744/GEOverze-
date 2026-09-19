import {
  Church,
  Crown,
  Handshake,
  Landmark,
  MapPin,
  Mountain,
  type LucideIcon,
} from "lucide-react";

import type { ArticleBlock } from "@/features/library/data/articles";

import { ArticleExternalImage } from "./ArticleExternalImage";
import { LibraryMediaImage } from "./LibraryMediaImage";

const SURVIVAL_ICONS: Record<string, LucideIcon> = {
  Geography: Mountain,
  Diplomacy: Handshake,
  "Dynastic continuity": Crown,
  Dynasties: Crown,
  "Religious importance": Church,
  Religion: Church,
  "Strategic location": MapPin,
  "Political institutions": Landmark,
  Institutions: Landmark,
};

const CALLOUT_LABELS: Record<Extract<ArticleBlock, { kind: "callout" }>["variant"], string> = {
  "key-idea": "Key idea",
  "did-you-know": "Did you know",
  "geography-note": "Geography note",
  "history-note": "History note",
  "by-the-numbers": "By the numbers",
};

export function renderAtlasParchmentBlock(block: ArticleBlock, index: number) {
  switch (block.kind) {
    case "heading":
      return (
        <h2 key={block.id} id={block.id}>
          {block.text}
        </h2>
      );
    case "paragraph":
      return <p key={index}>{block.text}</p>;
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag key={index}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case "quote":
      return (
        <blockquote key={index}>
          {block.text}
          {block.attribution ? (
            <footer className="mt-2 not-italic">— {block.attribution}</footer>
          ) : null}
        </blockquote>
      );
    case "callout":
      return (
        <aside key={index} className="article-paper-callout article-atlas-parchment__paper-callout">
          <p className="article-paper-callout__label article-atlas-parchment__callout-label">
            {CALLOUT_LABELS[block.variant]}
          </p>
          <p className="article-paper-callout__text article-atlas-parchment__callout-text">
            {block.text}
          </p>
        </aside>
      );
    case "facts":
      if (block.layout === "survival-cards") {
        return (
          <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
            <p className="article-atlas-parchment__card-title">{block.title}</p>
            <div className="article-atlas-parchment__survival-grid">
              {block.facts.map((fact) => {
                const Icon = SURVIVAL_ICONS[fact.label] ?? Landmark;
                return (
                  <div key={fact.label} className="article-atlas-parchment__survival-card">
                    <h3>
                      <Icon aria-hidden size={16} strokeWidth={1.75} />
                      {fact.label}
                    </h3>
                    <p>{fact.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          <p className="article-atlas-parchment__card-title">{block.title}</p>
          <dl className="grid gap-1 sm:grid-cols-2">
            {block.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "stateGlance":
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          {block.title ? (
            <p className="article-atlas-parchment__card-title">{block.title}</p>
          ) : null}
          <div className="article-atlas-parchment__glance-grid">
            {block.states.map((state) => (
              <div key={state.name} className="article-atlas-parchment__glance-card">
                <h3 className="article-atlas-parchment__glance-name">{state.name}</h3>
                <dl>
                  {state.fields.map((field) => (
                    <div key={field.label}>
                      <dt>{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      );
    case "sizeComparison": {
      const max = Math.max(...block.items.map((i) => i.areaKm2), 1);
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          {block.title ? (
            <p className="article-atlas-parchment__card-title">{block.title}</p>
          ) : null}
          <ul className="article-atlas-parchment__size-bars">
            {block.items.map((item) => (
              <li key={item.label}>
                <span className="article-atlas-parchment__size-label">{item.label}</span>
                <span className="article-atlas-parchment__size-track">
                  <span
                    className="article-atlas-parchment__size-fill"
                    style={{ width: `${(item.areaKm2 / max) * 100}%` }}
                  />
                </span>
                <span className="article-atlas-parchment__size-value">{item.areaKm2} km²</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "timeline":
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          {block.title ? (
            <p className="article-atlas-parchment__card-title">{block.title}</p>
          ) : null}
          <ol className="article-atlas-parchment__timeline">
            {block.events.map((event) => (
              <li key={`${event.date}-${event.text.slice(0, 24)}`}>
                <span className="article-atlas-parchment__timeline-date">{event.date}</span>
                <span className="article-atlas-parchment__timeline-text">{event.text}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "geoDiagram":
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          {block.title ? (
            <p className="article-atlas-parchment__card-title">{block.title}</p>
          ) : null}
          <div className="article-atlas-parchment__geo-diagram">
            <div className="article-atlas-parchment__geo-stack">
              {block.nodes.map((node, nodeIndex) => (
                <div key={node} className="article-atlas-parchment__geo-stack-row">
                  <span>{node}</span>
                  {nodeIndex < block.nodes.length - 1 ? (
                    <span className="article-atlas-parchment__geo-stack-arrow" aria-hidden>
                      ↓
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "dualCompare":
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          <p className="article-atlas-parchment__card-title">{block.title}</p>
          <div className="article-atlas-parchment__dual-grid">
            <div className="article-atlas-parchment__dual-col">
              <h3>{block.leftTitle}</h3>
              <ul>
                {block.leftItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="article-atlas-parchment__dual-col">
              <h3>{block.rightTitle}</h3>
              <ul>
                {block.rightItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    case "profileStrip":
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          {block.title ? (
            <p className="article-atlas-parchment__card-title">{block.title}</p>
          ) : null}
          <div className="article-atlas-parchment__profile-grid">
            {block.profiles.map((profile) => (
              <div key={profile.name} className="article-atlas-parchment__profile-card">
                <p className="article-atlas-parchment__profile-theme">{profile.theme}</p>
                <h3>{profile.name}</h3>
                <p>{profile.text}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "crossLinks":
      return (
        <nav key={index} className="article-atlas-parchment__cross-links">
          {block.title ? (
            <p className="article-atlas-parchment__card-title">{block.title}</p>
          ) : null}
          <ul>
            {block.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
                {link.description ? <span>{link.description}</span> : null}
              </li>
            ))}
          </ul>
        </nav>
      );
    case "table":
      return (
        <div key={index} className="article-paper-card article-atlas-parchment__paper-card">
          {block.title ? (
            <p className="article-atlas-parchment__card-title">{block.title}</p>
          ) : null}
          <div className="article-atlas-parchment__table-wrap">
            <table className="article-atlas-parchment__table">
              <thead>
                <tr>
                  {block.columns.map((col) => (
                    <th key={col} scope="col">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "didYouKnow":
      return (
        <aside
          key={index}
          className="article-paper-callout article-atlas-parchment__paper-callout article-atlas-parchment__did-you-know"
        >
          <p className="article-paper-callout__label article-atlas-parchment__callout-label">
            Did you know?
          </p>
          {block.items?.length ? (
            <ul>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : block.text ? (
            <p className="article-paper-callout__text article-atlas-parchment__callout-text">
              {block.text}
            </p>
          ) : null}
        </aside>
      );
    case "image":
      return (
        <figure key={index} className="article-atlas-parchment__figure">
          {block.externalSrc ? (
            <ArticleExternalImage
              src={block.externalSrc}
              alt={block.caption}
              fallbackArt={block.art}
              staticFallbackSrc="/assets/geolibrary/collections/countries-of-europe.jpg"
              ratio="video"
            />
          ) : (
            <LibraryMediaImage
              storagePath={block.storagePath}
              fallbackArt={block.art}
              alt={block.caption}
              ratio="video"
            />
          )}
          {block.caption || block.credit ? (
            <figcaption>
              {block.caption}
              {block.credit ? (
                <span className="article-atlas-parchment__hero-credit">{block.credit}</span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      );
    case "map":
      return null;
    default:
      return null;
  }
}
