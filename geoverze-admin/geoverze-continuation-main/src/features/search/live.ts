import { fetchQuizzes } from "@/features/quizzes/data/fetchQuizzes";
import { fetchLibraryResources } from "@/features/library/data/fetchLibraryResources";
import { fetchAllQuizQuestions } from "@/features/questions/data/fetchAllQuizQuestions";
import { fetchMappedGstoreOrders } from "@/features/store/live";
import { fetchUsers } from "@/features/users/api";
import { fetchContentReports, fetchLibraryCreators } from "@/features/ops/api";
export type LiveSearchResult = {
  id: string;
  type: "users" | "creators" | "quizzes" | "questions" | "articles" | "orders" | "reports";
  title: string;
  subtitle: string;
  url: string;
};

export async function fetchSearchIndex(): Promise<LiveSearchResult[]> {
  const [users, quizzes, questions, library, orders, reports, creators] = await Promise.all([
    fetchUsers(),
    fetchQuizzes(),
    fetchAllQuizQuestions(),
    fetchLibraryResources(),
    fetchMappedGstoreOrders(),
    fetchContentReports(),
    fetchLibraryCreators(),
  ]);

  return [
    ...users.slice(0, 80).map((row) => ({
      id: row.id,
      type: "users" as const,
      title: row.displayName,
      subtitle: `${row.email} · ${row.role}`,
      url: "/users",
    })),
    ...creators.slice(0, 40).map((row) => ({
      id: row.handle,
      type: "creators" as const,
      title: row.display_name,
      subtitle: `@${row.handle}`,
      url: "/library/creators",
    })),
    ...quizzes.slice(0, 40).map((row) => ({
      id: row.id,
      type: "quizzes" as const,
      title: row.title,
      subtitle: `${row.category} · ${row.creator}`,
      url: "/quizzes",
    })),
    ...questions.slice(0, 40).map((row) => ({
      id: row.id,
      type: "questions" as const,
      title: row.prompt,
      subtitle: `${row.type} · ${row.quizTitle}`,
      url: "/questions",
    })),
    ...library.slice(0, 40).map((row) => ({
      id: row.id,
      type: "articles" as const,
      title: row.title,
      subtitle: row.authorHandle ?? "",
      url: "/library",
    })),
    ...orders.slice(0, 40).map((row) => ({
      id: row.id,
      type: "orders" as const,
      title: row.id,
      subtitle: `${row.customer} · ${row.status}`,
      url: "/store/orders",
    })),
    ...reports.slice(0, 40).map((row) => ({
      id: row.id,
      type: "reports" as const,
      title: row.reason,
      subtitle: `${row.target_type} · ${row.severity}`,
      url: "/reports",
    })),
  ];
}
