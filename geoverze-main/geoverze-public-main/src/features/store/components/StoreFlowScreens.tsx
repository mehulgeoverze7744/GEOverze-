import { Link } from "@tanstack/react-router";
import { Coins, Gift, Package, ShoppingBag, Sparkles } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import { useCartStore } from "@/stores/cartStore";

import { CartLineRow } from "./CartLineRow";
import { OrderCard } from "./OrderCard";
import { BundleCard } from "./BundleCard";
import { ProductCard } from "./ProductCard";
import { productBySlug } from "../data/products";
import { SEED_ORDERS } from "../data/orders";
import { BUNDLES, DEALS } from "../data/offers";
import { useCreditPurchase } from "../hooks/useCreditPurchase";
import { isProductOwned, useEntitlements } from "../hooks/useEntitlements";
import { useStoreCatalogue } from "../hooks/useStoreCatalogue";
import { money } from "../lib/format";
import { computeTotals, lineCredits, lineMoney } from "../lib/purchase";
import { useStoreActions } from "../lib/useStoreActions";
import { useStoreCredits, useStoreCreditsState } from "../lib/useStoreCredits";
import { toast } from "sonner";

function crumbs(label: string) {
  return [{ label: "GEOstore", to: "/geostore" as const }, { label }];
}

/** Basket + saved for later. */
export function CartScreen() {
  const lines = useCartStore((s) => s.lines);
  const saved = useCartStore((s) => s.saved);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCart = useCartStore((s) => s.moveToCart);
  const removeSaved = useCartStore((s) => s.removeSaved);
  const balance = useStoreCredits();
  const totals = computeTotals(lines, {
    shipping: "standard",
    creditsToApply: 0,
    balance: balance ?? 0,
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Your cart"
        description="Review your picks before checkout."
        breadcrumb={crumbs("Cart")}
      />
      <SectionContainer size="wide">
        {lines.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Explore the collection and add something worth carrying."
            action={
              <GeoButton asChild variant="solid">
                <Link to="/geostore/browse">Browse the catalogue</Link>
              </GeoButton>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              {lines.map((line) => (
                <CartLineRow
                  key={line.id}
                  line={line}
                  onQuantity={setQuantity}
                  onRemove={remove}
                  onSave={saveForLater}
                />
              ))}
            </div>
            <AnimatedSection className="h-fit rounded-2xl border border-bronze/15 bg-charcoal/50 p-6">
              <h2 className="text-sm uppercase tracking-[0.2em] text-foreground/50">Summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-foreground/60">
                  <dt>Subtotal</dt>
                  <dd>{money(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <dt>Shipping</dt>
                  <dd>{totals.shipping === 0 ? "Free" : money(totals.shipping)}</dd>
                </div>
                {totals.creditsDue > 0 ? (
                  <div className="flex justify-between text-bronze">
                    <dt>Credits</dt>
                    <dd className="inline-flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5" /> {totals.creditsDue}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-bronze/10 pt-3 text-base text-foreground">
                  <dt>Total</dt>
                  <dd>{money(totals.total)}</dd>
                </div>
              </dl>
              <GeoButton asChild variant="solid" className="mt-6 w-full">
                <Link to="/geostore/checkout">Checkout</Link>
              </GeoButton>
            </AnimatedSection>
          </div>
        )}

        {saved.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm uppercase tracking-[0.2em] text-foreground/50">
              Saved for later
            </h2>
            <div className="mt-5 space-y-4">
              {saved.map((line) => (
                <CartLineRow
                  key={line.id}
                  line={line}
                  variant="saved"
                  onRemove={removeSaved}
                  onMoveToCart={moveToCart}
                />
              ))}
            </div>
          </section>
        ) : null}
      </SectionContainer>
    </PageShell>
  );
}

/** Placeholder checkout — demo merch flow only; credit rewards bypass this screen. */
export function CheckoutScreen() {
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const balance = useStoreCredits();
  const totals = computeTotals(lines, {
    shipping: "standard",
    creditsToApply: 0,
    balance: balance ?? 0,
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Checkout"
        description="A demonstration flow — no card is charged and no credits leave your balance permanently."
        breadcrumb={crumbs("Checkout")}
      />
      <SectionContainer>
        {lines.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Nothing to check out"
            action={
              <GeoButton asChild variant="solid">
                <Link to="/geostore/browse">Find something first</Link>
              </GeoButton>
            }
          />
        ) : (
          <AnimatedSection className="rounded-2xl border border-bronze/15 bg-charcoal/50 p-8">
            <ul className="space-y-3 text-sm text-foreground/65">
              {lines.map((line) => (
                <li key={line.id} className="flex justify-between">
                  <span>
                    {line.name} × {line.quantity}
                  </span>
                  <span>
                    {line.unitAmount === null ? `${lineCredits(line)} cr` : money(lineMoney(line))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between border-t border-bronze/10 pt-6">
              <p className="text-base text-foreground">
                {money(totals.total)}
                {totals.creditsDue > 0 ? ` + ${totals.creditsDue} credits` : ""}
              </p>
              <GeoButton
                variant="solid"
                onClick={() => {
                  clear();
                  toast.message("Demo checkout complete", {
                    description:
                      "Physical and hybrid items are not connected to production payments yet.",
                  });
                }}
              >
                Place order
              </GeoButton>
            </div>
          </AnimatedSection>
        )}
      </SectionContainer>
    </PageShell>
  );
}

/** Order history (demo seed data — production orders deferred). */
export function OrdersScreen() {
  const orders = SEED_ORDERS;
  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Your orders"
        description="Every claim and purchase you've made."
        breadcrumb={crumbs("Orders")}
      />
      <SectionContainer size="wide">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Your first claim will appear here."
          />
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </SectionContainer>
    </PageShell>
  );
}

/** Credit-only rewards shelf — production-backed purchase flow. */
export function RewardsScreen() {
  const { balance, signedIn, authReady } = useStoreCreditsState();
  const { wishlistToggle, wishlist } = useStoreActions();
  const { rewardProducts, loading: catalogueLoading, error: catalogueError } = useStoreCatalogue();
  const entitlements = useEntitlements();
  const { purchase, isPurchasing } = useCreditPurchase();

  const balanceLabel = !authReady
    ? "…"
    : signedIn
      ? String(balance ?? 0)
      : "Sign in to view balance";

  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Redeem with credits"
        description={
          signedIn
            ? `You have ${balanceLabel} credits to spend on the rewards below.`
            : "Sign in to view your balance and claim digital rewards."
        }
        breadcrumb={crumbs("Rewards")}
      />
      <SectionContainer size="wide">
        {catalogueLoading ? (
          <EmptyState icon={Gift} title="Loading rewards…" />
        ) : catalogueError ? (
          <EmptyState icon={Gift} title="Could not load rewards" description={catalogueError} />
        ) : rewardProducts.length === 0 ? (
          <EmptyState icon={Gift} title="No rewards available" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rewardProducts.map((product) => {
              const owned = isProductOwned(entitlements, product.slug);
              const affordable =
                balance !== null && product.credits !== null && product.credits <= balance;

              return (
                <ProductCard
                  key={product.slug}
                  product={product}
                  saved={wishlist.includes(product.slug)}
                  owned={owned}
                  affordable={affordable}
                  purchasing={isPurchasing(product.slug)}
                  onToggleWishlist={wishlistToggle}
                  onAdd={() => {
                    if (!product.purchasable || !product.serverProductId) return;
                    void purchase({
                      slug: product.slug,
                      name: product.name,
                      serverProductId: product.serverProductId,
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </SectionContainer>
    </PageShell>
  );
}

/** Bundles and deals. */
export function OffersScreen() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Bundles & deals"
        description="Curated sets at a better price."
        breadcrumb={crumbs("Offers")}
      />
      <SectionContainer size="wide">
        <div className="grid gap-6 lg:grid-cols-2">
          {BUNDLES.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
        {DEALS.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm uppercase tracking-[0.2em] text-foreground/50">Running deals</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {DEALS.map((deal) => (
                <li
                  key={deal.id}
                  className="rounded-2xl border border-bronze/12 bg-charcoal/45 p-5"
                >
                  <p className="inline-flex items-center gap-2 text-sm text-bronze">
                    <Sparkles className="h-3.5 w-3.5" /> {deal.title}
                  </p>
                  <p className="mt-2 text-xs text-foreground/55">{deal.blurb}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </SectionContainer>
    </PageShell>
  );
}

/** Saved items. */
export function WishlistScreen() {
  const balance = useStoreCredits();
  const { addProduct, wishlistToggle, wishlist } = useStoreActions();
  const entitlements = useEntitlements();
  const items = wishlist.map(productBySlug).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Your wishlist"
        description="Everything you've saved for later."
        breadcrumb={crumbs("Wishlist")}
      />
      <SectionContainer size="wide">
        {items.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="Nothing saved yet"
            description="Tap the heart on any item to keep it here."
            action={
              <GeoButton asChild variant="solid">
                <Link to="/geostore/browse">Browse the catalogue</Link>
              </GeoButton>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                saved
                owned={isProductOwned(entitlements, product.slug)}
                affordable={
                  balance !== null && product.credits !== null && product.credits <= balance
                }
                onToggleWishlist={wishlistToggle}
                onAdd={(p) => addProduct(p)}
              />
            ))}
          </div>
        )}
      </SectionContainer>
    </PageShell>
  );
}
