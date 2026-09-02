import { getRouteApi } from "@tanstack/react-router";

import { EmptyState, GeoButton, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { ArticleUnavailableScreen } from "./ArticleUnavailableScreen";
import { ArticleMapBlock } from "./ArticleMapBlock";
import { LibraryCard } from "./LibraryCard";
import { LibraryMediaImage } from "./LibraryMediaImage";
import { LibraryTierBadge } from "./LibraryTierBadge";
import { articleHeadings, relatedArticles } from "../data/articles";
import { categoryLabel, difficultyLabel } from "../data/taxonomy";
import { useArticleBySlug } from "../hooks/useArticleBySlug";
import { useArticleReadingProgress } from "../hooks/useArticleReadingProgress";
import { useRecordArticleView } from "../hooks/useRecordArticleView";
import { useCreatorByHandle } from "../hooks/usePublishedCreators";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { getResourceAccessState } from "../lib/access-tier";

const routeApi = getRouteApi("/geolibrary/article/$slug");

/** Reading surface for a single library entry. */
export function ArticleScreen() {
  const { slug } = routeApi.useParams();
  const { pageState, article, loading, error } = useArticleBySlug(slug);
  const { tier, signedIn, authReady } = useLibrarySubscriptionTier();
  const { creator } = useCreatorByHandle(article?.creator ?? "");
  const { articles: catalogue } = usePublishedArticles();
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const likes = useLibraryStore((s) => s.likes);
  const progress = useLibraryStore((s) => s.progress);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const markComplete = useLibraryStore((s) => s.markComplete);
  const completed = useLibraryStore((s) => s.completed.includes(slug));

  const readyArticle = pageState?.status === "ready" ? pageState.article : undefined;
  const contentAccess =
    readyArticle && !loading && authReady
      ? getResourceAccessState(readyArticle.minAccessTier, tier, signedIn)
      : null;
  const canRecordView =
    Boolean(readyArticle?.resourceId) && contentAccess?.kind === "open" && !error && signedIn;

  useRecordArticleView(readyArticle?.resourceId, canRecordView);
  const { contentRef } = useArticleReadingProgress(slug, Boolean(article) && !completed);

  if (loading || !authReady) {
    return (
      <SectionContainer>
        <p className="text-sm text-foreground/50">Loading entry…</p>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer>
        <EmptyState title="Could not load this entry" description={error} />
      </SectionContainer>
    );
  }

  if (!pageState || pageState.status === "not_found") {
    return <ArticleUnavailableScreen kind="not_found" slug={slug} />;
  }

  if (pageState.status === "restricted") {
    const kind = !signedIn ? "sign_in_required" : "tier_restricted";
    return (
      <ArticleUnavailableScreen
        kind={kind}
        slug={slug}
        requiredTier={pageState.requiredTier}
        title={pageState.title}
      />
    );
  }

  if (!article) {
    return <ArticleUnavailableScreen kind="not_found" slug={slug} />;
  }

  const accessState = getResourceAccessState(article.minAccessTier, tier, signedIn);
  if (accessState.kind === "sign_in_required") {
    return (
      <ArticleUnavailableScreen
        kind="sign_in_required"
        slug={slug}
        requiredTier={accessState.requiredTier}
        title={article.title}
      />
    );
  }
  if (accessState.kind === "tier_insufficient") {
    return (
      <ArticleUnavailableScreen
        kind="tier_restricted"
        slug={slug}
        requiredTier={accessState.requiredTier}
        title={article.title}
      />
    );
  }

  const author = creator;
  const headings = articleHeadings(article);
  const readPercent = progress[slug] ?? 0;

  return (
    <SectionContainer>
      <article className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
            {categoryLabel(article.category)} · {difficultyLabel(article.difficulty)} ·{" "}
            {article.minutes} min
          </p>
          {article.minAccessTier ? (
            <LibraryTierBadge tier={article.minAccessTier} accessState={accessState} />
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground/60">{article.dek}</p>
        <p className="mt-4 text-xs text-foreground/50">
          {author ? `${author.name} · ${author.role}` : "GEOverze editorial"}
        </p>

        {readPercent > 0 ? (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.18em] text-foreground/45">
              <span>Reading progress</span>
              <span>{completed ? "Completed" : `${readPercent}%`}</span>
            </div>
            <div
              className="mt-2 h-1 overflow-hidden rounded-full bg-[oklch(0.2_0.008_60/0.7)]"
              role="progressbar"
              aria-valuenow={readPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Article reading progress"
            >
              <span className="block h-full bg-bronze/70" style={{ width: `${readPercent}%` }} />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <GeoButton type="button" variant="ghost" onClick={() => toggleBookmark(article.slug)}>
            {bookmarks.includes(article.slug) ? "Saved" : "Save"}
          </GeoButton>
          <GeoButton type="button" variant="ghost" onClick={() => toggleLike(article.slug)}>
            {likes.includes(article.slug) ? "Liked" : "Like"}
          </GeoButton>
          <GeoButton type="button" onClick={() => markComplete(article.slug)}>
            {completed ? "Marked as read" : "Mark as read"}
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

        <div ref={contentRef} className="mt-10 space-y-6">
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
              case "list": {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag
                    key={index}
                    className={
                      block.ordered
                        ? "ml-5 list-decimal space-y-2 text-[0.95rem] text-foreground/70"
                        : "ml-5 list-disc space-y-2 text-[0.95rem] text-foreground/70"
                    }
                  >
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ListTag>
                );
              }
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
              case "image":
                return (
                  <figure
                    key={index}
                    className="glass-panel surface-gradient overflow-hidden rounded-2xl"
                  >
                    <LibraryMediaImage
                      storagePath={block.storagePath}
                      fallbackArt={block.art}
                      alt={block.caption}
                      ratio="wide"
                    />
                    {block.caption ? (
                      <figcaption className="px-5 pb-5 pt-3 text-xs text-foreground/50">
                        {block.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              case "map":
                return (
                  <ArticleMapBlock key={index} region={block.region} caption={block.caption} />
                );
              default:
                return (
                  <figure key={index} className="glass-panel surface-gradient rounded-2xl p-5">
                    <figcaption className="text-xs text-foreground/50">
                      {"caption" in block ? block.caption : ""}
                    </figcaption>
                  </figure>
                );
            }
          })}
        </div>
      </article>

      <section className="mb-8 mt-16">
        <h2 className="text-lg font-light tracking-tight text-foreground">Related reading</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedArticles(article, 3, catalogue).map((related) => (
            <LibraryCard
              key={related.slug}
              article={related}
              saved={bookmarks.includes(related.slug)}
              onToggleBookmark={toggleBookmark}
              progress={progress[related.slug] ?? 0}
              accessState={getResourceAccessState(related.minAccessTier, tier, signedIn)}
            />
          ))}
        </div>
      </section>
    </SectionContainer>
  );
}
