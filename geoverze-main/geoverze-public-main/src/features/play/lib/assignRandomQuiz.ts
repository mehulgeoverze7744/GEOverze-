import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database, Json } from "@/lib/supabase/database.types";

export const ASSIGNMENT_DIFFICULTIES = [
  "Adaptive",
  "Easy",
  "Medium",
  "Hard",
  "Expert",
] as const;

export type AssignmentDifficulty = (typeof ASSIGNMENT_DIFFICULTIES)[number];
export type AssignedQuizDifficulty = Exclude<AssignmentDifficulty, "Adaptive">;

const AssignSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  difficulty: z.enum(ASSIGNMENT_DIFFICULTIES),
});

export type AssignRandomQuizInput = z.infer<typeof AssignSchema>;

export type AssignRandomQuizResult =
  | {
      ok: true;
      quizId: string;
      categoryId: string;
      difficulty: AssignedQuizDifficulty;
    }
  | {
      ok: false;
      code: "invalid_category" | "invalid_difficulty" | "unknown_category" | "none_eligible" | "unavailable";
    };

type RpcPayload = {
  ok?: boolean;
  quiz_id?: string;
  category_id?: string;
  difficulty?: string;
  code?: string;
};

function asRecord(value: Json | null): RpcPayload {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as RpcPayload;
  }
  return {};
}

function parseDifficulty(value: string | undefined): AssignedQuizDifficulty | null {
  if (value === "Easy" || value === "Medium" || value === "Hard" || value === "Expert") {
    return value;
  }
  return null;
}

function mapRpc(payload: RpcPayload): AssignRandomQuizResult {
  if (payload.ok === true && typeof payload.quiz_id === "string" && payload.quiz_id.length > 0) {
    const difficulty = parseDifficulty(payload.difficulty);
    if (!difficulty) {
      return { ok: false, code: "unavailable" };
    }
    return {
      ok: true,
      quizId: payload.quiz_id,
      categoryId: typeof payload.category_id === "string" ? payload.category_id : "",
      difficulty,
    };
  }

  if (
    payload.code === "invalid_category" ||
    payload.code === "invalid_difficulty" ||
    payload.code === "unknown_category" ||
    payload.code === "none_eligible"
  ) {
    return { ok: false, code: payload.code };
  }

  return { ok: false, code: "unavailable" };
}

function serverClient() {
  const url = process.env["VITE_SUPABASE_URL"];
  const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured.");
  }
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Server-side random assignment. Never picks from a client-loaded card list. */
export const assignRandomQuizFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => AssignSchema.parse(raw))
  .handler(async ({ data }): Promise<AssignRandomQuizResult> => {
    const sb = serverClient();
    const { data: rpcData, error } = await sb.rpc("assign_random_quiz", {
      p_category_id: data.category,
      p_difficulty: data.difficulty,
    });

    if (error) {
      console.error("assign_random_quiz failed", error.message);
      return { ok: false, code: "unavailable" };
    }

    return mapRpc(asRecord(rpcData));
  });
