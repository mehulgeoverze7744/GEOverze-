import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type AdminRealtimeStatus = "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED" | string;

type ChannelEntry = {
  channel: RealtimeChannel;
  /** ownerId → invalidation callback */
  owners: Map<string, () => void>;
  status: AdminRealtimeStatus | null;
  handlersRegistered: boolean;
  subscribed: boolean;
};

export type AdminRealtimeRegistry = {
  subscribe: (table: string, ownerId: string, onChange: () => void) => () => void;
  /** Test-only introspection */
  peek: (table: string) => {
    ownerCount: number;
    status: AdminRealtimeStatus | null;
    handlersRegistered: boolean;
    subscribed: boolean;
  } | null;
};

function topicForTable(table: string): string {
  return `admin:${table}`;
}

export function createAdminRealtimeRegistry(client: SupabaseClient): AdminRealtimeRegistry {
  const channels = new Map<string, ChannelEntry>();

  function getOrCreate(table: string): ChannelEntry {
    const topic = topicForTable(table);
    const existing = channels.get(topic);
    if (existing) return existing;

    const channel = client.channel(topic);
    const entry: ChannelEntry = {
      channel,
      owners: new Map(),
      status: null,
      handlersRegistered: false,
      subscribed: false,
    };
    channels.set(topic, entry);
    return entry;
  }

  function ensureHandlersRegistered(table: string, entry: ChannelEntry): void {
    if (entry.handlersRegistered) return;

    entry.channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
      for (const listener of entry.owners.values()) {
        try {
          listener();
        } catch (error) {
          console.error(`[admin:realtime] listener failed (${topicForTable(table)})`, error);
        }
      }
    });
    entry.handlersRegistered = true;
  }

  function ensureSubscribed(table: string, entry: ChannelEntry): void {
    if (entry.subscribed) return;

    ensureHandlersRegistered(table, entry);

    entry.channel.subscribe((status, err) => {
      entry.status = status;
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error(`[admin:realtime] ${topicForTable(table)}: ${status}`, err ?? "");
      }
    });
    entry.subscribed = true;
  }

  function subscribe(table: string, ownerId: string, onChange: () => void): () => void {
    const topic = topicForTable(table);
    const entry = getOrCreate(table);
    ensureSubscribed(table, entry);
    entry.owners.set(ownerId, onChange);

    return () => {
      const current = channels.get(topic);
      if (!current) return;

      current.owners.delete(ownerId);
      if (current.owners.size > 0) return;

      void client.removeChannel(current.channel);
      channels.delete(topic);
    };
  }

  function peek(table: string) {
    const topic = topicForTable(table);
    const entry = channels.get(topic);
    if (!entry) return null;
    return {
      ownerCount: entry.owners.size,
      status: entry.status,
      handlersRegistered: entry.handlersRegistered,
      subscribed: entry.subscribed,
    };
  }

  return { subscribe, peek };
}
