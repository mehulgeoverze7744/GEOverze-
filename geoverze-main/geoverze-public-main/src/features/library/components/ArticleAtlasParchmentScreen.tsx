import type { RefObject } from "react";

import { SectionContainer } from "@/components/shared";
import { getResourceAccessState, type LibraryAccessTier } from "@/features/library/lib/access-tier";
import type { Article } from "@/features/library/data/articles";
import { relatedArticles } from "@/features/library/data/articles";
import { getArticleReaderPresentation } from "@/features/library/lib/article-themes";

import { renderAtlasParchmentBlock } from "./atlas-parchment-block-render";
import { ArticleExternalImage } from "./ArticleExternalImage";
import { LibraryCard } from "./LibraryCard";
import "../styles/article-atlas-parchment.css";

type ArticleAtlasParchmentScreenProps = {
  article: Article;
  slug: string;
  headings: { id: string; text: string }[];
  readPercent: number;
  completed: boolean;
  bookmarks: string[];
  likes: string[];
  progress: Record<string, number>;
  toggleBookmark: (slug: string) => void;
  toggleLike: (slug: string) => void;
  markComplete: (slug: string) => void;
  contentRef: RefObject<HTMLDivElement | null>;
  catalogue: readonly Article[];
  signedIn: boolean;
  subscriptionTier: LibraryAccessTier | null;
};

export function ArticleAtlasParchmentScreen({
  article,
  slug,
  headings,
  readPercent,
  completed,
  bookmarks,
  likes,
  progress,
  toggleBookmark,
  toggleLike,
  markComplete,
  contentRef,
  catalogue,
  signedIn,
  subscriptionTier,
}: ArticleAtlasParchmentScreenProps) {
  const presentation = getArticleReaderPresentation(article);

  const saved = bookmarks.includes(slug);
  const liked = likes.includes(slug);
  const progressLabel = completed ? "Completed" : `${readPercent}%`;

  return (
    <>
      <section
        className="article-atlas-parchment__article-shell article-parchment"
        aria-label={presentation.displayTitle}
      >
        <div className="article-atlas-parchment__paper-slab" aria-hidden />
        <div className="article-atlas-parchment__article-main">
          <div className="article-atlas-parchment__inner">
            <article>
              <h1 className="article-atlas-parchment__title">{presentation.displayTitle}</h1>
              <p className="article-atlas-parchment__dek">{presentation.displayDek}</p>
              <p className="article-atlas-parchment__author">{presentation.authorLine}</p>
              <div className="article-atlas-parchment__tags">
                {presentation.topicTags.map((tag) => (
                  <span key={tag} className="article-atlas-parchment__tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="article-atlas-parchment__progress-label">Reading progress</span>
                  <span className="article-atlas-parchment__progress-label">{progressLabel}</span>
                </div>
                <div
                  className="article-atlas-parchment__progress-track"
                  role="progressbar"
                  aria-valuenow={readPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Article reading progress"
                >
                  <span
                    className="article-atlas-parchment__progress-fill"
                    style={{ width: `${completed ? 100 : readPercent}%` }}
                  />
                </div>
              </div>

              <div className="article-atlas-parchment__actions">
                <button
                  type="button"
                  className={`article-atlas-parchment__action${saved ? " article-atlas-parchment__action--active" : ""}`}
                  onClick={() => toggleBookmark(article.slug)}
                >
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  className={`article-atlas-parchment__action${liked ? " article-atlas-parchment__action--active" : ""}`}
                  onClick={() => toggleLike(article.slug)}
                >
                  {liked ? "Liked" : "Like"}
                </button>
                <button
                  type="button"
                  className={`article-atlas-parchment__action${completed ? " article-atlas-parchment__action--active" : ""}`}
                  onClick={() => markComplete(article.slug)}
                >
                  {completed ? "Marked as read" : "Mark as read"}
                </button>
              </div>

              <figure className="article-atlas-parchment__hero">
                <ArticleExternalImage
                  src={presentation.heroImage.src}
                  alt={presentation.heroImage.alt}
                  fallbackArt="article-microstates-map"
                  staticFallbackSrc="/assets/geolibrary/collections/countries-of-europe.jpg"
                  ratio="video"
                />
                <figcaption>
                  {presentation.heroImage.caption}
                  <span className="article-atlas-parchment__hero-credit">
                    {presentation.heroImage.credit}
                  </span>
                </figcaption>
              </figure>

              {headings.length > 0 ? (
                <nav aria-label="On this page" className="article-atlas-parchment__toc">
                  <p className="article-atlas-parchment__toc-title">On this page</p>
                  <ul className="article-atlas-parchment__toc-list">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a href={`#${heading.id}`}>{heading.text}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}

              <div ref={contentRef} className="article-atlas-parchment__body">
                {article.blocks.map((block, index) => renderAtlasParchmentBlock(block, index))}
              </div>
            </article>
          </div>
        </div>
        <img
          className="article-atlas-parchment__paper-end"
          src="/assets/geolibrary/europe-microstates-paper-mountains.png"
          alt=""
          decoding="async"
          width={487}
          height={197}
        />
      </section>

      <SectionContainer className="mb-8 mt-8 pb-12 md:mt-10">
        <h2 className="text-lg font-light tracking-tight text-foreground">Related reading</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedArticles(article, 3, catalogue).map((related) => (
            <LibraryCard
              key={related.slug}
              article={related}
              saved={bookmarks.includes(related.slug)}
              onToggleBookmark={toggleBookmark}
              progress={progress[related.slug] ?? 0}
              accessState={getResourceAccessState(
                related.minAccessTier,
                subscriptionTier,
                signedIn,
              )}
            />
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
