import { describe, expect, it, vi } from "vitest";

import { createAdminRealtimeRegistry } from "./realtime-manager";

type MockHandler = {
  event: string;
  filter: unknown;
  callback: () => void;
};

function createMockSupabase() {
  const channelStore = new Map<string, ReturnType<typeof createMockChannel>>();

  function createMockChannel(name: string) {
    let subscribed = false;
    const handlers: MockHandler[] = [];

    const channel = {
      name,
      on(event: string, filter: unknown, callback: () => void) {
        if (subscribed) {
          throw new Error(`cannot add '${event}' callbacks for ${name} after 'subscribe()'.`);
        }
        handlers.push({ event, filter, callback });
        return channel;
      },
      subscribe(statusCallback?: (status: string, err?: Error) => void) {
        if (handlers.length === 0) {
          throw new Error("subscribe() called before any handlers were registered");
        }
        subscribed = true;
        statusCallback?.("SUBSCRIBED");
        return channel;
      },
      get handlers() {
        return handlers;
      },
      get subscribed() {
        return subscribed;
      },
    };
    return channel;
  }

  return {
    channel(name: string) {
      if (!channelStore.has(name)) {
        channelStore.set(name, createMockChannel(name));
      }
      return channelStore.get(name)!;
    },
    removeChannel: vi.fn((ch: { name: string }) => {
      channelStore.delete(ch.name);
    }),
    channels: channelStore,
  };
}

describe("createAdminRealtimeRegistry", () => {
  it("registers handlers before subscribe()", () => {
    const client = createMockSupabase();
    const registry = createAdminRealtimeRegistry(client as never);
    registry.subscribe("content_reports", "owner-a", () => {});

    const channel = client.channels.get("admin:content_reports");
    expect(channel?.handlers).toHaveLength(1);
    expect(channel?.subscribed).toBe(true);
  });

  it("does not call on() after subscribe when a second owner joins", () => {
    const client = createMockSupabase();
    const registry = createAdminRealtimeRegistry(client as never);
    const unsubA = registry.subscribe("content_reports", "owner-a", () => {});
    expect(() => registry.subscribe("content_reports", "owner-b", () => {})).not.toThrow();

    const peek = registry.peek("content_reports");
    expect(peek?.ownerCount).toBe(2);
    expect(peek?.handlersRegistered).toBe(true);
    expect(peek?.subscribed).toBe(true);

    unsubA();
    expect(registry.peek("content_reports")?.ownerCount).toBe(1);
  });

  it("removes the channel when the last owner unsubscribes", () => {
    const client = createMockSupabase();
    const registry = createAdminRealtimeRegistry(client as never);
    const unsub = registry.subscribe("support_tickets", "owner-a", () => {});
    expect(client.channels.has("admin:support_tickets")).toBe(true);

    unsub();
    expect(client.removeChannel).toHaveBeenCalled();
    expect(registry.peek("support_tickets")).toBeNull();
  });

  it("invokes all owner listeners on postgres change", () => {
    const client = createMockSupabase();
    const registry = createAdminRealtimeRegistry(client as never);
    const a = vi.fn();
    const b = vi.fn();
    registry.subscribe("gstore_orders", "owner-a", a);
    registry.subscribe("gstore_orders", "owner-b", b);

    const channel = client.channels.get("admin:gstore_orders");
    channel?.handlers[0]?.callback();
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it("survives strict-mode style remount for the same owner", () => {
    const client = createMockSupabase();
    const registry = createAdminRealtimeRegistry(client as never);
    const unsub = registry.subscribe("content_reports", "owner-a", () => {});
    unsub();
    expect(() => registry.subscribe("content_reports", "owner-a", () => {})).not.toThrow();
    expect(registry.peek("content_reports")?.subscribed).toBe(true);
  });

  it("supports independent channels per table", () => {
    const client = createMockSupabase();
    const registry = createAdminRealtimeRegistry(client as never);
    registry.subscribe("content_reports", "a", () => {});
    registry.subscribe("support_tickets", "b", () => {});
    expect(client.channels.size).toBe(2);
  });
});
