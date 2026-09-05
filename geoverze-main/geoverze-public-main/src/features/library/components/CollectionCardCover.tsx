import { Library } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";

import { collectionCardImageSrc } from "../data/collection-card-images";
import type { Collection } from "../data/collections";
import { LibraryMediaImage } from "./LibraryMediaImage";

/** Shared collection card cover: static art when mapped, otherwise library media fallback. */
export function CollectionCardCover({ collection }: { collection: Collection }) {
  const imageSrc = collectionCardImageSrc(collection.slug);

  if (imageSrc) {
    return (
      <CoverArt
        art={collection.art}
        imageSrc={imageSrc}
        imageAlt=""
        ratio="video"
        fit="cover"
        overlay="subtle"
      />
    );
  }

  return (
    <LibraryMediaImage storagePath={collection.art} fallbackArt={collection.art} icon={Library} />
  );
}
