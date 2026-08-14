import { getRouteApi } from "@tanstack/react-router";

import { EmptyState, GeoButton, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { articleBySlug, articleHeadings, relatedArticles } from "../data/articles";
import { creatorByHandle } from "../data/creators";
import { categoryLabel, difficultyLabel } from "../data/taxonomy";

const routeApi = getRouteApi("/geolibrary/article/$slug");

/** Reading surface for a single library entry. */
export function ArticleScreen() {
  const { slug } = routeApi.useParams();
  const article = articleBySlug(slug);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const likes = useLibraryStore((s) => s.likes);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const markComplete = useLibraryStore((s) => s.markComplete);

  if (!article) {
    return (
      <SectionContainer>
        <EmptyState
          title="Entry not found"
          description="That library entry has moved or never existed. Try browsing the library instead."
        />
      </SectionContainer>
    );
  }

  const author = creatorByHandle(article.creator);
  const headings = articleHeadings(article);

  return (
    <SectionContainer>
      <article className="mx-auto max-w-3xl">
        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
          {categoryLabel(article.category)} · {difficultyLabel(article.difficulty)} ·{" "}
          {article.minutes} min
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground/60">{article.dek}</p>
        <p className="mt-4 text-xs text-foreground/50">
          {author ? `${author.name} · ${author.role}` : "GEOverze editorial"}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <GeoButton type="button" variant="ghost" onClick={() => toggleBookmark(article.slug)}>
            {bookmarks.includes(article.slug) ? "Saved" : "Save"}
          </GeoButton>
          <GeoButton type="button" variant="ghost" onClick={() => toggleLike(article.slug)}>
            {likes.includes(article.slug) ? "Liked" : "Like"}
          </GeoButton>
          <GeoButton type="button" onClick={() => markComplete(article.slug)}>
            Mark as read
          </GeoButton>
        </div>

        {headings.length > 0 ? (
          <nav
            aria-label="On this page"
            className="glass-panel surface-gradient mt-10 rounded-2xl p-5"
          >
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">
              On this page
            </p>
            <ul className="mt-3 space-y-2 text-sm text-foreground/60">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a className="hover:text-bronze-glow" href={`#${heading.id}`}>
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="mt-10 space-y-6">
          {article.blocks.map((block, index) => {
            switch (block.kind) {
              case "heading":
                return (
                  <h2
                    key={block.id}
                    id={block.id}
                    className="pt-4 text-xl font-light tracking-tight text-foreground"
                  >
                    {block.text}
                  </h2>
                );
              case "paragraph":
                return (
                  <p key={index} className="text-[0.95rem] leading-relaxed text-foreground/70">
                    {block.text}
                  </p>
                );
              case "list":
                return (
                  <ul
                    key={index}
                    className="ml-5 list-disc space-y-2 text-[0.95rem] text-foreground/70"
                  >
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              case "quote":
                return (
                  <blockquote
                    key={index}
                    className="border-l-2 border-bronze/50 pl-5 text-[0.95rem] italic text-foreground/65"
                  >
                    {block.text}
                    {block.attribution ? (
                      <footer className="mt-2 text-xs not-italic text-foreground/50">
                        {block.attribution}
                      </footer>
                    ) : null}
                  </blockquote>
                );
              case "facts":
                return (
                  <div key={index} className="glass-panel surface-gradient rounded-2xl p-5">
                    <p className="text-sm text-bronze/90">{block.title}</p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      {block.facts.map((fact) => (
                        <div key={fact.label}>
                          <dt className="text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">
                            {fact.label}
                          </dt>
                          <dd className="mt-1 text-sm text-foreground/75">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              case "didYouKnow":
                return (
                  <aside
                    key={index}
                    className="glass-panel surface-gradient rounded-2xl p-5 text-sm text-foreground/70"
                  >
                    <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
                      Did you know
                    </p>
                    <p className="mt-2">{block.text}</p>
                  </aside>
                );
              default:
                return (
                  <figure key={index} className="glass-panel surface-gradient rounded-2xl p-5">
                    <figcaption className="text-xs text-foreground/50">{block.caption}</figcaption>
                  </figure>
                );
            }
          })}
        </div>
      </article>

      <section className="mb-8 mt-16">
        <h2 className="text-lg font-light tracking-tight text-foreground">Related reading</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedArticles(article, 3).map((related) => (
            <LibraryCard
              key={related.slug}
              article={related}
              saved={bookmarks.includes(related.slug)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      </section>
    </SectionContainer>
  );
}
