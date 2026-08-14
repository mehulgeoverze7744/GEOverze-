import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { PendingConfirm } from "@/components/shared/confirm-dialog";
import type {
  Coupon,
  OrderStatus,
  ProductStatus,
  RedemptionItem,
  StoreOrder,
  StoreProduct,
} from "@/features/store/types";
import { catalogDaysAgo } from "@/lib/catalog";
import { notReady } from "@/lib/placeholder";

/**
 * GEOstore mutations (products, orders, coupons, redemptions). Local state
 * only — every handler is a single swap point for a backend call later.
 */
export function useStoreActions(
  initialProducts: StoreProduct[],
  initialOrders: StoreOrder[],
  initialCoupons: Coupon[],
  initialRedemptions: RedemptionItem[],
) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [redemptions, setRedemptions] = useState(initialRedemptions);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const patchProducts = useCallback((ids: string[], changes: Partial<StoreProduct>) => {
    const set = new Set(ids);
    setProducts((prev) =>
      prev.map((item) =>
        set.has(item.id) ? { ...item, ...changes, updatedAt: catalogDaysAgo(0, 12) } : item,
      ),
    );
  }, []);

  const setProductStatus = useCallback(
    (ids: string[], status: ProductStatus) => {
      patchProducts(ids, { status, available: status === "published" });
      toast.success(ids.length === 1 ? `Product ${status}.` : `${ids.length} products ${status}.`);
    },
    [patchProducts],
  );

  const publishProducts = useCallback(
    (ids: string[]) => setProductStatus(ids, "published"),
    [setProductStatus],
  );
  const unpublishProducts = useCallback(
    (ids: string[]) => setProductStatus(ids, "draft"),
    [setProductStatus],
  );

  const toggleFeatured = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)),
    );
    toast.success("Featured state updated.");
  }, []);

  const adjustStock = useCallback(
    (id: string, stock: number) => {
      const safe = Math.max(0, Math.round(stock));
      patchProducts([id], {
        stock: safe,
        stockStatus: safe === 0 ? "Out of stock" : safe < 15 ? "Low stock" : "In stock",
      });
      toast.success("Inventory updated.");
    },
    [patchProducts],
  );

  const saveProduct = useCallback((product: StoreProduct) => {
    setProducts((prev) => {
      const exists = prev.some((entry) => entry.id === product.id);
      if (!exists) return [{ ...product }, ...prev];
      return prev.map((entry) => (entry.id === product.id ? { ...product } : entry));
    });
    toast.success("Product saved.");
  }, []);

  const removeProducts = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setProducts((prev) => prev.filter((item) => !set.has(item.id)));
    toast.success(ids.length === 1 ? "Product deleted." : `${ids.length} products deleted.`);
  }, []);

  const requestDeleteProducts = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Delete this product?" : `Delete ${ids.length} products?`,
        description: "The product is removed from the storefront. This cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: () => removeProducts(ids),
      }),
    [removeProducts],
  );

  const requestArchiveProducts = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Archive this product?" : `Archive ${ids.length} products?`,
        description: "Archived products stay in reporting but are hidden from the storefront.",
        confirmLabel: "Archive",
        onConfirm: () => setProductStatus(ids, "archived"),
      }),
    [setProductStatus],
  );

  const setOrderStatus = useCallback((ids: string[], status: OrderStatus) => {
    const set = new Set(ids);
    setOrders((prev) =>
      prev.map((order) =>
        set.has(order.id)
          ? {
              ...order,
              status,
              updatedAt: catalogDaysAgo(0, 12),
              timeline: [
                ...order.timeline,
                {
                  id: `evt-${status}-${order.timeline.length}`,
                  actor: "Admin",
                  action: `marked as ${status}`,
                  target: "the order",
                  time: catalogDaysAgo(0, 12),
                },
              ],
            }
          : order,
      ),
    );
    toast.success(ids.length === 1 ? `Order ${status}.` : `${ids.length} orders ${status}.`);
  }, []);

  const requestRefund = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Refund this order?" : `Refund ${ids.length} orders?`,
        description: "The customer is refunded in full and the order is marked as refunded.",
        confirmLabel: "Refund",
        destructive: true,
        onConfirm: () => setOrderStatus(ids, "refunded"),
      }),
    [setOrderStatus],
  );

  const requestCancel = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Cancel this order?" : `Cancel ${ids.length} orders?`,
        description: "Cancelled orders release reserved inventory and stop fulfilment.",
        confirmLabel: "Cancel order",
        destructive: true,
        onConfirm: () => setOrderStatus(ids, "cancelled"),
      }),
    [setOrderStatus],
  );

  const saveCoupon = useCallback((coupon: Coupon) => {
    setCoupons((prev) => {
      const exists = prev.some((entry) => entry.id === coupon.id);
      if (!exists) return [{ ...coupon }, ...prev];
      return prev.map((entry) => (entry.id === coupon.id ? { ...coupon } : entry));
    });
    toast.success("Coupon saved.");
  }, []);

  const toggleCoupon = useCallback((id: string) => {
    setCoupons((prev) =>
      prev.map((coupon) => (coupon.id === id ? { ...coupon, active: !coupon.active } : coupon)),
    );
    toast.success("Coupon status updated.");
  }, []);

  const removeCoupons = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setCoupons((prev) => prev.filter((coupon) => !set.has(coupon.id)));
    toast.success(ids.length === 1 ? "Coupon deleted." : `${ids.length} coupons deleted.`);
  }, []);

  const requestDeleteCoupons = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Delete this coupon?" : `Delete ${ids.length} coupons?`,
        description: "Existing orders keep their discount. New checkouts can no longer use it.",
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: () => removeCoupons(ids),
      }),
    [removeCoupons],
  );

  const toggleRedemption = useCallback((id: string) => {
    setRedemptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              available: !item.available,
              status: item.available ? "archived" : "available",
            }
          : item,
      ),
    );
    toast.success("Redemption availability updated.");
  }, []);

  const approveRedemption = useCallback((id: string) => {
    setRedemptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "redeemed",
              redemptions: item.redemptions + 1,
              stock: Math.max(0, item.stock - 1),
              lastRedeemedAt: catalogDaysAgo(0, 12),
            }
          : item,
      ),
    );
    toast.success("Redemption approved.");
  }, []);

  const placeholder = notReady;

  return useMemo(
    () => ({
      products,
      orders,
      coupons,
      redemptions,
      confirm,
      setConfirm,
      saveProduct,
      publishProducts,
      unpublishProducts,
      toggleFeatured,
      adjustStock,
      requestArchiveProducts,
      requestDeleteProducts,
      setOrderStatus,
      requestRefund,
      requestCancel,
      saveCoupon,
      toggleCoupon,
      requestDeleteCoupons,
      toggleRedemption,
      approveRedemption,
      placeholder,
    }),
    [
      products,
      orders,
      coupons,
      redemptions,
      confirm,
      saveProduct,
      publishProducts,
      unpublishProducts,
      toggleFeatured,
      adjustStock,
      requestArchiveProducts,
      requestDeleteProducts,
      setOrderStatus,
      requestRefund,
      requestCancel,
      saveCoupon,
      toggleCoupon,
      requestDeleteCoupons,
      toggleRedemption,
      approveRedemption,
      placeholder,
    ],
  );
}
