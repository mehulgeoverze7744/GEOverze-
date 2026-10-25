import { Library } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";

import { collectionCardImageSrc } from "../data/collection-card-images";
import type { Collection } from "../data/collections";
import { libraryResponsiveProps } from "../lib/library-image-delivery";
import { LibraryMediaImage } from "./LibraryMediaImage";

/** Shared collection card cover: static art when mapped, otherwise library media fallback. */
export function CollectionCardCover({ collection }: { collection: Collection }) {
  const imageSrc = collectionCardImageSrc(collection.slug);

  if (imageSrc) {
    const responsive = libraryResponsiveProps(imageSrc, "card");
    return (
      <CoverArt
        art={collection.art}
        imageSrc={responsive?.src ?? imageSrc}
        imageAlt=""
        ratio="video"
        fit="cover"
        overlay="subtle"
        {...(responsive ? { responsive } : {})}
      />
    );
  }

  return (
    <LibraryMediaImage storagePath={collection.art} fallbackArt={collection.art} icon={Library} />
  );
}
