import { fetchEntitlements, fetchStoreProducts, upsertStoreProduct } from "@/features/commerce/api";
import type { Reward, RewardClaim } from "@/features/rewards/types";

function rewardType(fulfillment: string): Reward["type"] {
  return fulfillment === "physical" ? "Store" : "Digital";
}

export async function fetchMappedRewards(): Promise<{ rewards: Reward[]; claims: RewardClaim[] }> {
  const [products, entitlements] = await Promise.all([fetchStoreProducts(), fetchEntitlements()]);
  const claimCounts = new Map<string, number>();
  for (const row of entitlements) {
    const key = row.product_id ?? row.product_slug;
    claimCounts.set(key, (claimCounts.get(key) ?? 0) + 1);
  }

  const rewards: Reward[] = products.map((row) => {
    const metadata = (row.metadata ?? {}) as {
      eligibility?: Reward["eligibility"];
      expires_at?: string;
      status?: Reward["status"];
    };
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: rewardType(row.fulfillment_type),
      eligibility: metadata.eligibility ?? "All players",
      creditsRequired: row.credit_price,
      stock: 0,
      unlimited: true,
      status: row.active
        ? "active"
        : metadata.status === "draft" || metadata.status === "paused"
          ? metadata.status
          : "archived",
      availableFrom: row.created_at,
      expiresAt: metadata.expires_at ?? "",
      claims: claimCounts.get(row.id) ?? claimCounts.get(row.slug) ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  const productNames = new Map(products.map((row) => [row.id, row.name]));
  const claims: RewardClaim[] = entitlements.map((row) => ({
    id: row.id,
    rewardId: row.product_id ?? row.product_slug,
    rewardName: productNames.get(row.product_id ?? "") ?? row.product_slug,
    user: row.user_id,
    credits: 0,
    status: "fulfilled",
    claimedAt: row.granted_at,
  }));

  return { rewards, claims };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function saveMappedReward(reward: Reward) {
  await upsertStoreProduct({
    ...(isUuid(reward.id) ? { id: reward.id } : {}),
    slug: reward.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name: reward.name,
    description: reward.description,
    credit_price: reward.creditsRequired,
    active: reward.status === "active",
    fulfillment_type: reward.type === "Store" ? "physical" : "digital",
    metadata: {
      eligibility: reward.eligibility,
      expires_at: reward.expiresAt || null,
      status: reward.status,
      source: "admin-rewards",
    },
  });
}

export async function setRewardStatus(ids: string[], status: Reward["status"]) {
  const { rewards } = await fetchMappedRewards();
  for (const id of ids) {
    const current = rewards.find((item) => item.id === id);
    if (current) await saveMappedReward({ ...current, status });
  }
}
