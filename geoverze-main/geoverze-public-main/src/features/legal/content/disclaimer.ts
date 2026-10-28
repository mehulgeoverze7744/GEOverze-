import type { LegalSection } from "../types";

export const disclaimerSections: LegalSection[] = [
  {
    id: "educational-purpose",
    title: "Educational purpose",
    blocks: [
      {
        kind: "p",
        text: "GVRZE provides geography quizzes, library material, and related information for general learning and exploration. It is not a formal school, an accredited course, or professional advice about travel, law, or borders.",
      },
    ],
  },
  {
    id: "accuracy",
    title: "Accuracy of content",
    blocks: [
      {
        kind: "p",
        text: "GVRZE aims to keep quizzes, articles, maps, and reference material useful and accurate. It cannot promise that every item is complete, current, or free of error. Political boundaries, place names, and statistics change.",
      },
      {
        kind: "p",
        text: "Check important facts with an authoritative source before you rely on them for a decision that matters. A mistake in educational content is not excused when a product you bought is materially different from its own description. That situation is covered by the Refund and Replacement Policy.",
      },
    ],
  },
  {
    id: "results",
    title: "Quiz results and rankings",
    blocks: [
      {
        kind: "p",
        text: "Scores, streaks, achievements, and any ranking shown inside a game reflect activity under that mode's rules. They are not a qualification, a prediction of academic results, or proof of real-world expertise. A ranking can change when the mode's rules or the underlying data change. The standalone leaderboard destination is marked as not yet available in the site navigation.",
      },
    ],
  },
  {
    id: "availability",
    title: "Availability and technical issues",
    blocks: [
      {
        kind: "p",
        text: "Uninterrupted access is not guaranteed. Maintenance, outages, connectivity problems, defects, and interruptions in a service GVRZE relies on — including authentication and database hosting — can limit or stop parts of the product.",
      },
    ],
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    blocks: [
      {
        kind: "p",
        text: "Accounts and stored application data use Supabase. Other sites or tools linked from GVRZE have their own terms and privacy practices. A link is not an endorsement of that third party's information. Google and Apple sign-in buttons are visible but are not connected.",
      },
    ],
  },
  {
    id: "merchandise",
    title: "Merchandise images",
    blocks: [
      {
        kind: "p",
        text: "Photographs, colours, and mockups of GEOstore products are illustrative. Small differences in colour or finish can occur between a screen and a physical item. That does not excuse a product that is materially different from the description, size, or variant you ordered.",
      },
    ],
  },
  {
    id: "rewards",
    title: "Rewards and credits",
    blocks: [
      {
        kind: "p",
        text: "Credits, reward displays, and eligibility follow the rules published for the relevant activity or plan. A credit is not cash, is not a stored-value balance you can withdraw, and is not a promise of a particular prize. Monthly reward artwork on the site is not a guarantee that a named reward will be issued to you.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      {
        kind: "p",
        text: "To the extent the law allows, GVRZE is not liable for loss that was not a foreseeable result of a failure of the service, or for decisions you make solely from educational content. Nothing here excludes liability that applicable law does not allow to be excluded or limited. That includes liability that Indian consumer law, or another mandatory rule, keeps in place. This disclaimer does not limit the remedies in the Refund and Replacement Policy where those remedies apply.",
      },
    ],
  },
];
