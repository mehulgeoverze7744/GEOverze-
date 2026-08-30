export type FaqItem = { id: string; question: string; answer: string };

export const pricingFaq: FaqItem[] = [
  {
    id: "how",
    question: "How do subscriptions work?",
    answer:
      "Membership is a recurring plan billed monthly or annually. Annual plans cost the equivalent of ten months. Nothing is billable today — GEOverze is in development and every plan below describes intent, not a live checkout.",
  },
  {
    id: "refund",
    question: "What is the refund policy?",
    answer:
      "When billing goes live, a first payment can be refunded in full within fourteen days, and annual plans are refunded pro rata for unused months. This is a placeholder policy and will be restated in the terms before any charge is possible.",
  },
  {
    id: "upgrade",
    question: "Can I upgrade mid-cycle?",
    answer:
      "Yes. Upgrades apply immediately and the remainder of your current cycle is credited against the new plan, so you only pay the difference.",
  },
  {
    id: "downgrade",
    question: "What happens if I downgrade or cancel?",
    answer:
      "You keep the higher tier until the end of the paid period, then move down automatically. Nothing you earned is deleted — credits, levels, streak history and bookmarks stay on your account.",
  },
  {
    id: "credits",
    question: "Do credits expire or carry over?",
    answer:
      "Credits belong to your account, not your plan. On Free, Basic, and Pro, credits earned in a calendar month stay available through the following calendar month. Advance extends that window to two calendar months. Paid tiers simply earn them faster.",
  },
  {
    id: "creator",
    question: "Who is eligible for the Creator Studio?",
    answer:
      "Advance members get Studio access and can submit quizzes and articles for review. Pro members can preview the Studio read-only. Verification is a lightweight review of your first submission.",
  },
  {
    id: "payments",
    question: "Which payment methods will be supported?",
    answer:
      "Cards, UPI, net banking, wallets and international cards are planned at launch, with more providers to follow. The interface is already built; the processing is not connected.",
  },
];
