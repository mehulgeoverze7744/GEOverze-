import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_THEME_LEGACY_KEY,
  ADMIN_THEME_NEXT_KEY,
  GVRZE_PERSIST_NAMES,
  QUIZ_RESULT_LEGACY_KEY,
  QUIZ_RESULT_NEXT_KEY,
  createBrandStateStorage,
  isUsablePersistedValue,
  readMigratingValue,
  toGvrzePersistKey,
  toLegacyPersistKey,
  writePrimaryValue,
} from "./persist-key-migration.ts";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    dump: () => Object.fromEntries(data),
  };
}

describe("persist key mapping", () => {
  it("maps confirmed geoverze.* keys to gvrze.*", () => {
    assert.equal(toGvrzePersistKey("geoverze.cart"), GVRZE_PERSIST_NAMES.cart);
    assert.equal(toGvrzePersistKey("geoverze.library.v1.anon"), "gvrze.library.v1.anon");
    assert.equal(toGvrzePersistKey("geoverze.store.v2.user-1"), "gvrze.store.v2.user-1");
    assert.equal(toGvrzePersistKey(ADMIN_THEME_LEGACY_KEY), ADMIN_THEME_NEXT_KEY);
    assert.equal(toGvrzePersistKey(QUIZ_RESULT_LEGACY_KEY), QUIZ_RESULT_NEXT_KEY);
  });

  it("does not invent mappings for unrelated keys", () => {
    assert.equal(toGvrzePersistKey("sb-example-auth-token"), "sb-example-auth-token");
    assert.equal(toLegacyPersistKey("theme"), null);
  });
});

describe("readMigratingValue", () => {
  it("migrates valid legacy data when the new key is absent", () => {
    const storage = memoryStorage({
      "geoverze.cart": JSON.stringify({ state: { lines: [{ id: "tee" }], saved: [] }, version: 2 }),
    });
    const raw = readMigratingValue(storage, "gvrze.cart");
    assert.ok(raw);
    assert.equal(JSON.parse(raw).state.lines[0].id, "tee");
    assert.equal(storage.getItem("gvrze.cart"), raw);
    assert.equal(storage.getItem("geoverze.cart"), raw);
  });

  it("prefers existing new-key data over legacy", () => {
    const storage = memoryStorage({
      "gvrze.bookmarks": JSON.stringify({ state: { ids: ["new"] } }),
      "geoverze.bookmarks": JSON.stringify({ state: { ids: ["old"] } }),
    });
    const raw = readMigratingValue(storage, "gvrze.bookmarks");
    assert.deepEqual(JSON.parse(raw!).state.ids, ["new"]);
    assert.equal(JSON.parse(storage.getItem("geoverze.bookmarks")!).state.ids[0], "old");
  });

  it("treats empty and placeholder legacy values as missing", () => {
    const storage = memoryStorage({
      "geoverze.preferences": "   ",
    });
    assert.equal(readMigratingValue(storage, "gvrze.preferences"), null);
    assert.equal(storage.getItem("gvrze.preferences"), null);

    storage.setItem("geoverze.preferences", "null");
    assert.equal(readMigratingValue(storage, "gvrze.preferences"), null);
  });

  it("does not crash when storage throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    assert.equal(readMigratingValue(broken, "gvrze.profile"), null);
  });

  it("does not copy legacy over a malformed primary key", () => {
    const storage = memoryStorage({
      "gvrze.cart": "{not-json",
      "geoverze.cart": JSON.stringify({ state: { lines: [{ id: "legacy" }] } }),
    });
    assert.equal(readMigratingValue(storage, "gvrze.cart"), null);
    assert.equal(storage.getItem("gvrze.cart"), "{not-json");
  });

  it("is idempotent: a second read does not overwrite newer primary data", () => {
    const storage = memoryStorage({
      "geoverze.onboarding": JSON.stringify({ state: { step: 2, completed: false } }),
    });
    readMigratingValue(storage, "gvrze.onboarding");
    writePrimaryValue(
      storage,
      "gvrze.onboarding",
      JSON.stringify({ state: { step: 4, completed: true } }),
    );
    const second = readMigratingValue(storage, "gvrze.onboarding");
    assert.equal(JSON.parse(second!).state.step, 4);
    assert.equal(JSON.parse(storage.getItem("geoverze.onboarding")!).state.step, 2);
  });
});

describe("createBrandStateStorage", () => {
  it("hydrates cart-shaped state from legacy then writes only the new key", () => {
    const backend = memoryStorage({
      "geoverze.cart": JSON.stringify({
        state: { lines: [{ id: "mug", quantity: 1 }], saved: [] },
      }),
    });
    const storage = createBrandStateStorage(backend);
    const first = storage.getItem("gvrze.cart");
    assert.ok(first);
    storage.setItem(
      "gvrze.cart",
      JSON.stringify({ state: { lines: [{ id: "mug", quantity: 2 }], saved: [] } }),
    );
    assert.equal(JSON.parse(backend.getItem("gvrze.cart")!).state.lines[0].quantity, 2);
    assert.equal(JSON.parse(backend.getItem("geoverze.cart")!).state.lines[0].quantity, 1);
    storage.removeItem("gvrze.cart");
    assert.equal(backend.getItem("gvrze.cart"), null);
    assert.ok(backend.getItem("geoverze.cart"));
  });

  it("rejects unusable values", () => {
    assert.equal(isUsablePersistedValue(null), false);
    assert.equal(isUsablePersistedValue(""), false);
    assert.equal(isUsablePersistedValue("undefined"), false);
    assert.equal(isUsablePersistedValue('{"state":{}}'), true);
  });
});
