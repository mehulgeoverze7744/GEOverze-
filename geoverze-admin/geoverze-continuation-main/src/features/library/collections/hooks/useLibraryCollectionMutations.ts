import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  archiveLibraryCollection,
  createLibraryCollection,
  deleteLibraryCollection,
  publishLibraryCollection,
  submitLibraryCollectionForReview,
  toggleCollectionFeatured,
  unpublishLibraryCollection,
  updateLibraryCollection,
} from "../data/collection-mutations";
import { libraryCollectionDetailQueryKey } from "./useLibraryCollectionDetail";
import { libraryCollectionsQueryKey } from "./useLibraryCollections";
import type { LibraryCollection } from "../types";

export function useLibraryCollectionMutations() {
  const queryClient = useQueryClient();

  const invalidate = async (id?: string) => {
    await queryClient.invalidateQueries({ queryKey: libraryCollectionsQueryKey });
    if (id) {
      await queryClient.invalidateQueries({ queryKey: libraryCollectionDetailQueryKey(id) });
    }
  };

  const create = useMutation({
    mutationFn: (collection: LibraryCollection) => createLibraryCollection(collection),
    onSuccess: async (created) => {
      await invalidate(created.id);
      toast.success(`“${created.title}” created as a draft.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: (collection: LibraryCollection) => updateLibraryCollection(collection),
    onSuccess: async (_data, collection) => {
      await invalidate(collection.id);
      toast.success("Collection saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishLibraryCollection(id),
    onSuccess: async (_data, id) => {
      await invalidate(id);
      toast.success("Collection published.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => unpublishLibraryCollection(id),
    onSuccess: async (_data, id) => {
      await invalidate(id);
      toast.success("Collection unpublished.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submitForReview = useMutation({
    mutationFn: (id: string) => submitLibraryCollectionForReview(id),
    onSuccess: async (_data, id) => {
      await invalidate(id);
      toast.success("Collection sent for review.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => archiveLibraryCollection(id),
    onSuccess: async (_data, id) => {
      await invalidate(id);
      toast.success("Collection archived.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteLibraryCollection(id),
    onSuccess: async () => {
      await invalidate();
      toast.success("Collection deleted.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const feature = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleCollectionFeatured(id, featured),
    onSuccess: async (_data, { id }) => {
      await invalidate(id);
      toast.success("Featured state updated.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    create,
    update,
    publish,
    unpublish,
    submitForReview,
    archive,
    remove,
    feature,
  };
}
