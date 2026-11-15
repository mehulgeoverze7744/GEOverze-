import { useQuery } from "@tanstack/react-query";

import { adminKeys } from "@/lib/admin/keys";
import { useAdminRealtime } from "@/lib/admin/realtime";

import { fetchDashboardMetrics, fetchGrowthSeries } from "./api";

export function useDashboard() {
  const metrics = useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: fetchDashboardMetrics,
  });
  const growth = useQuery({
    queryKey: adminKeys.growth,
    queryFn: fetchGrowthSeries,
  });

  useAdminRealtime("gstore_orders", [adminKeys.dashboard, adminKeys.growth]);
  useAdminRealtime("content_reports", [adminKeys.dashboard]);
  useAdminRealtime("support_tickets", [adminKeys.dashboard]);
  useAdminRealtime("user_subscriptions", [adminKeys.dashboard]);

  return {
    metrics: metrics.data,
    growth: growth.data,
    loading: metrics.isLoading || growth.isLoading,
    error:
      metrics.error instanceof Error
        ? metrics.error.message
        : growth.error instanceof Error
          ? growth.error.message
          : null,
    refetch: () => {
      void metrics.refetch();
      void growth.refetch();
    },
  };
}
