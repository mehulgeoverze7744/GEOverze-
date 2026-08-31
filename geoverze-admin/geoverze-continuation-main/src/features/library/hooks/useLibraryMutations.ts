import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { LibraryResource } from "@/features/library/types";
import {
  archiveLibraryResource,
  createLibraryResource,
  deleteLibraryResource,
  duplicateLibraryResource,
  publishLibraryResource,
  submitLibraryResourceForReview,
  toggleLibraryFeatured,
  unpublishLibraryResource,
  updateLibraryResource,
} from "@/features/library/data/library-mutations";
import { libraryResourceDetailQueryKey } from "@/features/library/hooks/useLibraryResourceDetail";
import { libraryResourcesQueryKey } from "@/features/library/hooks/useLibraryResources";

function invalidateCatalogue(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: libraryResourcesQueryKey });
}

function invalidateDetail(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  return queryClient.invalidateQueries({ queryKey: libraryResourceDetailQueryKey(id) });
}

export function useLibraryMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (resource: LibraryResource) => createLibraryResource(resource),
    onSuccess: async (created) => {
      await invalidateCatalogue(queryClient);
      toast.success(`“${created.title}” created as a draft.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: (resource: LibraryResource) => updateLibraryResource(resource),
    onSuccess: async (_data, resource) => {
      await Promise.all([
        invalidateCatalogue(queryClient),
        invalidateDetail(queryClient, resource.id),
      ]);
      toast.success("Resource saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishLibraryResource(id),
    onSuccess: async (_data, id) => {
      await Promise.all([invalidateCatalogue(queryClient), invalidateDetail(queryClient, id)]);
      toast.success("Resource published.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => unpublishLibraryResource(id),
    onSuccess: async (_data, id) => {
      await Promise.all([invalidateCatalogue(queryClient), invalidateDetail(queryClient, id)]);
      toast.success("Resource unpublished.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submitForReview = useMutation({
    mutationFn: (id: string) => submitLibraryResourceForReview(id),
    onSuccess: async (_data, id) => {
      await Promise.all([invalidateCatalogue(queryClient), invalidateDetail(queryClient, id)]);
      toast.success("Resource sent for review.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => archiveLibraryResource(id),
    onSuccess: async (_data, id) => {
      await Promise.all([invalidateCatalogue(queryClient), invalidateDetail(queryClient, id)]);
      toast.success("Resource archived.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteLibraryResource(id),
    onSuccess: async () => {
      await invalidateCatalogue(queryClient);
      toast.success("Resource deleted.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => duplicateLibraryResource(id),
    onSuccess: async () => {
      await invalidateCatalogue(queryClient);
      toast.success("Resource duplicated as a draft.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const feature = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleLibraryFeatured(id, featured),
    onSuccess: async (_data, { id }) => {
      await Promise.all([invalidateCatalogue(queryClient), invalidateDetail(queryClient, id)]);
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
    duplicate,
    feature,
  };
}
