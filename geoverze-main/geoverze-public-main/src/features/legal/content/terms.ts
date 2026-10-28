import { legalConfig } from "../legal-config";
import type { LegalSection } from "../types";

export const termsSections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    blocks: [
      {
        kind: "p",
        text: "These terms are a working draft for using GVRZE. Creating an account asks you to accept the Terms of Service and the Privacy Policy. Browsing the public site is also subject to the parts of these terms that can lawfully apply to a visitor. If a term cannot be enforced against you, the rest still applies where the law allows that.",
      },
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and accounts",
    blocks: [
      {
        kind: "p",
        text: "Registration asks for a name, username, email address, password, and country. You must give information that is accurate and keep it up to date where the product lets you edit it. You are responsible for the password and for activity under your account.",
      },
      {
        kind: "p",
        text: `If you think someone else has used your account, change your password from the reset flow if you still can, and email ${legalConfig.supportEmail}. Prize-based competitive modes are limited to people who confirm they are 18 or older. People who answer that they are under 18 can keep using the educational parts of the service. The product does not publish a lower minimum age.`,
      },
      {
        kind: "p",
        text: "GVRZE may suspend or close an account for fraud, cheating, harassment, or another serious breach, subject to applicable law and to any notice or review the law requires. There is no separate in-product appeals desk. You can write to the support email.",
      },
    ],
  },
  {
    id: "services",
    title: "Platform services",
    blocks: [
      {
        kind: "p",
        text: "The service that is actually open includes geography quizzes and Solo play, PvP, and Multiplayer, Draw & Guess, GEOsus, and emoji-style quiz sets where those areas are available in the product. It also includes the GVRZE Library, profiles, achievements and in-mode scores, community spaces, the GEOstore catalogue, and the membership plans shown on the pricing page.",
      },
      {
        kind: "p",
        text: "Practice, daily challenges, weekly challenges, and tournaments are marked coming soon and are not offered as live modes. The standalone leaderboard link is marked coming soon. Paid checkout for memberships and for merchandise is not connected. Those screens describe the intended product. They are not a statement that a charge or a shipment is already available.",
      },
      {
        kind: "p",
        text: "Credits and rewards exist inside the product and follow the rules published for your activity and plan. They are described in the credits section below.",
      },
    ],
  },
  {
    id: "fair-play",
    title: "Gameplay and fair use",
    blocks: [
      {
        kind: "p",
        text: "You must not cheat, use bots or exploits, collude to distort a result, harass other people, manipulate a ranking, access an account or system you are not allowed to use, or abuse credits or rewards.",
      },
      {
        kind: "p",
        text: "GVRZE may review suspicious activity and take a proportionate step under these terms and applicable law, including removing a result or restricting an account. A review is not a promise that every result will be audited.",
      },
    ],
  },
  {
    id: "subscriptions",
    title: "Subscriptions and payments",
    blocks: [
      {
        kind: "p",
        text: "The catalogue shows Explorer as a free plan, and Basic, Pro, and Advance as paid tiers with monthly and annual prices and credit grants. Those prices and limits come from the catalogue shown in the product. Explorer can be used without a paid checkout. Basic, Pro, and Advance are not billable in the current build. Starting a paid plan shows a notice that checkout is not active.",
      },
      {
        kind: "p",
        text: "Because paid billing is not connected, these terms do not claim that a plan renews automatically, that a card is charged, or that a cancellation button changes a live subscription. The billing screen can display a membership record when one exists, and actions that would change billing say they are not connected.",
      },
      {
        kind: "p",
        text: "When paid checkout is connected, the price, interval, and any tax or fee will be shown before you pay. Cancelling a future renewal, once that control exists, does not by itself refund a period that has already been paid, except where the Refund and Replacement Policy or applicable law requires it. No payment-card number is collected by GVRZE today.",
      },
    ],
  },
  {
    id: "credits",
    title: "Credits, rewards, and redemptions",
    blocks: [
      {
        kind: "p",
        text: "Credits are units inside GVRZE. They are not cash, not a bank balance, and not something you can transfer or withdraw unless a published rule expressly says so. No such cash-out rule is published.",
      },
      {
        kind: "p",
        text: "The pricing copy currently describes credits as belonging to the account. For Explorer, Basic, and Pro, credits earned in a calendar month stay available through the following calendar month. Advance is described with a two-calendar-month window. The catalogue also stores a rollover length per plan. If those two sources ever differ, the rule shown for your plan in the product is the one that applies, and this page should be updated. Paid tiers are described as earning credits faster. That description is not a live billing promise.",
      },
      {
        kind: "p",
        text: "Reward artwork, including monthly reward displays, does not promise a specific item, a cash return, or that a redemption will be in stock. Eligibility and availability follow the rules published for that programme. A change to a future rule will not be used to erase a right you have already earned where the law protects that right.",
      },
    ],
  },
  {
    id: "store",
    title: "GEOstore purchases",
    blocks: [
      {
        kind: "p",
        text: "The store lists physical merchandise and digital-style items. You can browse, and the interface includes a cart and a checkout preview. A preview is not an accepted paid order. When a paid physical order is actually accepted, the product description, the amount shown before payment, the Shipping Policy, and the Refund and Replacement Policy apply, together with statutory consumer rights.",
      },
      {
        kind: "p",
        text: "Change-of-mind returns are not offered. Defective, damaged, incorrect, misdescribed, or undelivered goods keep the remedies in the Refund and Replacement Policy and under applicable law.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    blocks: [
      {
        kind: "p",
        text: "The GVRZE name, interface, original copy, original designs, and original software are owned by the operator of the service or used under licence. Geographic facts are not claimed as property. You may not copy the product for commercial use, misuse the name or marks, or reverse engineer the software where the law prohibits that.",
      },
      {
        kind: "p",
        text: "You keep the rights you already have in content you submit, such as a community post. You give GVRZE permission to host, display, and store that content so the feature you used can operate. That permission is limited to running the service. It is not a sale of your content.",
      },
    ],
  },
  {
    id: "conduct",
    title: "Community conduct",
    blocks: [
      {
        kind: "p",
        text: "Where community features are open, you must not harass, spam, impersonate another person, or post content that is abusive or unlawful. GVRZE may remove content or restrict an account that breaks this rule. There is no separate public moderation policy beyond these terms.",
      },
    ],
  },
  {
    id: "changes-to-service",
    title: "Availability and changes",
    blocks: [
      {
        kind: "p",
        text: "Features can be updated, paused for maintenance, or discontinued. A paid feature that is later withdrawn will be handled in line with the contract that applied to that purchase and with applicable law. Coming-soon items can stay unavailable.",
      },
    ],
  },
  {
    id: "suspension",
    title: "Suspension and termination",
    blocks: [
      {
        kind: "p",
        text: "You can stop using GVRZE at any time. You can ask for account deletion by email. There is no self-serve deletion control. GVRZE may restrict or end access for a serious breach, fraud, or abuse. Where the law requires notice or a chance to respond, that step will be followed. Some records may be kept for the reasons in the Privacy Policy.",
      },
    ],
  },
  {
    id: "liability",
    title: "Disclaimers and liability",
    blocks: [
      {
        kind: "p",
        text: "The Disclaimer is part of how the educational content, availability, merchandise images, and rewards should be read. Liability that applicable law does not allow to be excluded is not excluded. Consumer remedies for defective or misdescribed goods are not waived.",
      },
    ],
  },
  {
    id: "law",
    title: "Governing law and disputes",
    blocks: [
      {
        kind: "p",
        text: `These terms are proposed to be governed by the laws of ${legalConfig.governingLaw}, subject to legal review before they are treated as final. This draft does not name an exclusive city or court, and it does not remove a consumer forum, remedy, or jurisdiction that applicable law gives you.`,
      },
    ],
  },
  {
    id: "changes-to-terms",
    title: "Changes to these terms",
    blocks: [
      {
        kind: "p",
        text: "Material changes will be posted on this page with a new last-updated date. The updated draft applies from that date, except where the law requires advance notice or a fresh acceptance. A change does not rewrite a completed order.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        kind: "p",
        text: `Questions about these terms can be sent to ${legalConfig.supportEmail}. ${legalConfig.entityName ? `Contracting entity: ${legalConfig.entityName}.` : "A contracting entity name is not confirmed on this page."} ${legalConfig.address ? `Address: ${legalConfig.address}.` : "A business address is not confirmed on this page."}`,
      },
    ],
  },
];
