import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { PendingConfirm } from "@/components/shared/confirm-dialog";
import type { LibraryResource, LibraryStatus } from "@/features/library/types";
import { catalogDaysAgo } from "@/lib/catalog";
import { notReady } from "@/lib/placeholder";

/**
 * GEOlibrary mutations. Local state only — each handler is the single swap
 * point for a Lovable Cloud call once the backend is connected.
 */
export function useLibraryActions(initial: LibraryResource[]) {
  const [resources, setResources] = useState(initial);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const patch = useCallback((ids: string[], changes: Partial<LibraryResource>) => {
    const set = new Set(ids);
    setResources((prev) =>
      prev.map((item) =>
        set.has(item.id) ? { ...item, ...changes, updatedAt: catalogDaysAgo(0, 12) } : item,
      ),
    );
  }, []);

  const setStatus = useCallback(
    (ids: string[], status: LibraryStatus) => {
      patch(ids, { status });
      toast.success(
        ids.length === 1 ? `Resource ${status}.` : `${ids.length} resources ${status}.`,
      );
    },
    [patch],
  );

  const publish = useCallback((ids: string[]) => setStatus(ids, "published"), [setStatus]);
  const unpublish = useCallback((ids: string[]) => setStatus(ids, "draft"), [setStatus]);
  const submitForReview = useCallback((ids: string[]) => setStatus(ids, "pending"), [setStatus]);

  const toggleFeatured = useCallback((id: string) => {
    setResources((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)),
    );
    toast.success("Featured state updated.");
  }, []);

  const save = useCallback((resource: LibraryResource) => {
    setResources((prev) => {
      const exists = prev.some((entry) => entry.id === resource.id);
      if (!exists) return [{ ...resource }, ...prev];
      return prev.map((entry) => (entry.id === resource.id ? { ...resource } : entry));
    });
    toast.success("Resource saved.");
  }, []);

  const duplicate = useCallback((resource: LibraryResource) => {
    const copy: LibraryResource = {
      ...resource,
      id: `RES-${Math.floor(Math.random() * 9000) + 9000}`,
      title: `${resource.title} (copy)`,
      slug: `${resource.slug}-copy`,
      status: "draft",
      featured: false,
      views: 0,
      bookmarks: 0,
      updatedAt: catalogDaysAgo(0, 12),
    };
    setResources((prev) => [copy, ...prev]);
    toast.success("Resource duplicated as a draft.");
  }, []);

  const remove = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setResources((prev) => prev.filter((item) => !set.has(item.id)));
    toast.success(ids.length === 1 ? "Resource deleted." : `${ids.length} resources deleted.`);
  }, []);

  const requestDelete = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Delete this resource?" : `Delete ${ids.length} resources?`,
        description:
          "The resource is removed from GEOlibrary. Analytics history is retained. This cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: () => remove(ids),
      }),
    [remove],
  );

  const requestArchive = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Archive this resource?" : `Archive ${ids.length} resources?`,
        description: "Archived resources stay visible to admins but are hidden from readers.",
        confirmLabel: "Archive",
        onConfirm: () => setStatus(ids, "archived"),
      }),
    [setStatus],
  );

  const placeholder = notReady;

  return useMemo(
    () => ({
      resources,
      confirm,
      setConfirm,
      save,
      duplicate,
      publish,
      unpublish,
      submitForReview,
      toggleFeatured,
      requestArchive,
      requestDelete,
      placeholder,
    }),
    [
      resources,
      confirm,
      save,
      duplicate,
      publish,
      unpublish,
      submitForReview,
      toggleFeatured,
      requestArchive,
      requestDelete,
      placeholder,
    ],
  );
}
