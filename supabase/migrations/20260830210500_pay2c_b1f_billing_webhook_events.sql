-- =============================================================================
-- PAY-2c B.1f — billing_webhook_events (webhook idempotency + audit)
-- =============================================================================

create table if not exists public.billing_webhook_events (
  id                         uuid        primary key default gen_random_uuid(),
  provider                   text        not null,
  provider_event_id          text        not null,
  event_type                 text        not null,
  normalized_event_type      text,
  provider_subscription_id   text,
  provider_payment_id        text,
  provider_customer_id       text,
  provider_event_created_at  timestamptz,
  payload                    jsonb       not null,
  payload_sha256             text        not null,
  processing_status          text        not null default 'received',
  processing_error           text,
  received_at                timestamptz not null default now(),
  processed_at               timestamptz,
  attempt_count              integer     not null default 0,
  subscription_id            uuid        references public.user_subscriptions (id) on delete set null,
  metadata                   jsonb       not null default '{}'::jsonb,
  constraint billing_webhook_events_provider_allowed check (
    provider in ('razorpay', 'stripe')
  ),
  constraint billing_webhook_events_processing_status_allowed check (
    processing_status in ('received', 'processing', 'processed', 'ignored', 'failed')
  ),
  constraint billing_webhook_events_provider_event_id_nonempty check (
    btrim(provider_event_id) <> ''
  ),
  constraint billing_webhook_events_payload_sha256_nonempty check (
    btrim(payload_sha256) <> ''
  ),
  constraint billing_webhook_events_attempt_count_non_negative check (
    attempt_count >= 0
  )
);

comment on table public.billing_webhook_events is
  'Webhook idempotency and raw payload audit. Service-role only; no client access.';

create unique index if not exists billing_webhook_events_provider_event_unique_idx
  on public.billing_webhook_events (provider, provider_event_id);

create index if not exists billing_webhook_events_subscription_event_time_idx
  on public.billing_webhook_events (
    provider,
    provider_subscription_id,
    provider_event_created_at desc nulls last
  );

create index if not exists billing_webhook_events_processing_status_received_idx
  on public.billing_webhook_events (processing_status, received_at)
  where processing_status in ('received', 'failed');

create index if not exists billing_webhook_events_subscription_id_idx
  on public.billing_webhook_events (subscription_id)
  where subscription_id is not null;
