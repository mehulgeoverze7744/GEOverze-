import { legalConfig } from "../legal-config";
import type { LegalSection } from "../types";

export const privacySections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    blocks: [
      {
        kind: "p",
        text: "GVRZE is a geography learning service. Depending on what is open in the product, it includes quizzes, a library, community spaces, profiles, credits and rewards, membership plans, and a store for merchandise.",
      },
      {
        kind: "p",
        text: "This policy explains how information is handled when you visit the site, create an account, play, use the library or community, or look at the store. It applies to visitors, registered users, quiz participants, and people who browse or attempt to buy physical merchandise. Paid subscriptions and paid store checkout are not connected to a payment provider in the current build, so this policy does not describe a live card payment as if one were already taking place.",
      },
      {
        kind: "p",
        text: "It is a working draft for review. It is not a certification, and it does not appoint a privacy officer.",
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    blocks: [
      {
        kind: "p",
        text: "What is collected depends on what you use. The current account flow can collect a first name, last name, username, email address, password, and country when you register. Authentication is handled by Supabase. Email and password sign-in is implemented. Google and Apple buttons are shown but are not connected. Password reset and email verification routes exist.",
      },
      {
        kind: "p",
        text: "If you use the learning features, the service can store quiz activity needed to run a round, including attempts, scores, progress, achievements, and credits. An age step asks whether you are 18 or older and stores that answer as an adult or minor bracket. It does not ask for a date of birth. Library use can include views, likes, and bookmarks. Community features can include posts and related profile activity you choose to submit.",
      },
      {
        kind: "p",
        text: "Membership plans are listed from the product catalogue. A billing screen can show a membership record when one exists. Paid checkout is not connected, and GVRZE does not collect or store full payment-card numbers. If a payment provider is connected later, card details should be handled by that provider, not typed into GVRZE's own database.",
      },
      {
        kind: "p",
        text: "The store shows physical merchandise, including T-shirts, hoodies, caps, mugs, stickers, and globes, and it has cart and checkout screens. Merchandise checkout is not live. A local preview can assemble an order on the device, including a delivery method, but that preview is not a courier booking and does not mean a payment was taken. When a real order is accepted, the details needed to fulfil it — such as a delivery address and contact number — would be collected for that order.",
      },
      {
        kind: "list",
        items: [
          "Support messages sent to the published email address.",
          "The on-site contact form and newsletter field do not deliver messages today. A newsletter checkbox appears at signup but is not sent to the account record.",
          "Technical data needed to run the site, such as the browser session kept by the authentication client in local storage, and preferences stored in your browser.",
          "An optional analytics preference exists in settings and defaults to off. No third-party analytics product is connected in this build.",
        ],
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    blocks: [
      {
        kind: "p",
        text: "Information is used to create and secure accounts, operate quizzes and scoring, show progress, run the library and community features you use, apply the age bracket to prize-based modes, and show the plan and credit rules published in the product.",
      },
      {
        kind: "p",
        text: "It is also used to investigate abuse, cheating, or fraud, to keep the service secure, to respond to support requests that actually reach us, and to meet legal duties. Personalisation is limited to what the product already does, such as progress, preferences, and content tied to your account. We do not describe a separate advertising profile.",
      },
      {
        kind: "p",
        text: "Order details would be used to fulfil a physical order only once a real paid order exists. Credits and rewards are used to operate those programmes under the rules shown in the product. Credits are not treated as cash.",
      },
    ],
  },
  {
    id: "sharing",
    title: "Sharing and service providers",
    blocks: [
      {
        kind: "p",
        text: "Account and application data is processed through Supabase, which provides authentication and the database used by this service. Infrastructure that hosts the website may also process technical data needed to deliver pages.",
      },
      {
        kind: "p",
        text: "No payment processor is connected. The codebase names Stripe and Razorpay only as possible future billing seams, with no live price identifiers. No shipping carrier, analytics vendor, or email-marketing platform is connected. Support email uses the address published on the contact page. If a provider is added later, this page should name it only after it is actually in use.",
      },
      {
        kind: "p",
        text: "We may disclose information if the law requires it, or if it is necessary to investigate abuse, protect users, or establish or defend a legal claim. We do not sell personal information.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    blocks: [
      {
        kind: "p",
        text: "Sign-in state is kept by the Supabase client in browser local storage, not by a separate cookie banner. Some display preferences are also stored in the browser so they survive a refresh. These are functional. They are required for an account session and for the preferences you set.",
      },
      {
        kind: "p",
        text: "Optional analytics is a local setting and is off unless you turn it on. Turning it on does not, by itself, start a third-party analytics tool, because none is connected. There is no separate advertising cookie.",
      },
      {
        kind: "p",
        text: "You can clear site data in your browser. Clearing it will sign you out and remove locally stored preferences. Browser controls vary by browser.",
      },
    ],
  },
  {
    id: "retention-security",
    title: "Data retention and security",
    blocks: [
      {
        kind: "p",
        text: "Account, gameplay, library, and community records are kept while they are needed to operate the feature, to secure the service, and to meet legal or accounting duties. There is no published self-serve retention schedule with a fixed number of days.",
      },
      {
        kind: "p",
        text: "Access to the database is restricted by the application's authentication and row-level rules. No method of storage is perfectly secure. We do not promise that unauthorised access can never happen.",
      },
    ],
  },
  {
    id: "rights",
    title: "Your rights and account deletion",
    blocks: [
      {
        kind: "p",
        text: `You can ask to access, correct, or delete personal information, or to raise another privacy right that applies to you, by emailing ${legalConfig.privacyEmail}. The contact form on the website does not deliver those requests.`,
      },
      {
        kind: "p",
        text: "There is no in-product account-deletion button. A deletion request is handled from the support email. Some records may be kept where the law, accounting, fraud prevention, security, or an unresolved dispute requires it. Deleting an account does not automatically undo content that other people have already lawfully received, such as a community post that was public.",
      },
      {
        kind: "p",
        text: "You can also correct profile details that the product lets you edit, and you can withhold optional information that a screen does not require.",
      },
    ],
  },
  {
    id: "children",
    title: "Children's privacy",
    blocks: [
      {
        kind: "p",
        text: "During signup, GVRZE asks whether you are 18 or older. Prize-based competitive modes are limited to people who confirm they are 18 or older. Answering that you are under 18 does not close educational quizzes, progress, or the library. The product does not set a separate minimum age below 18 for creating an account, and this page does not invent one.",
      },
      {
        kind: "p",
        text: "The age step stores a bracket, not a full date of birth. If a parent or guardian believes an account should be restricted or removed, they can write to the support email. Where the law requires deletion or restriction, that request will be handled accordingly. This is not a statement that the service has been certified for children.",
      },
    ],
  },
  {
    id: "international",
    title: "International processing",
    blocks: [
      {
        kind: "p",
        text: "Supabase and the infrastructure that serves the website may process information in the regions where those services are hosted. Those regions can be outside your own. Where the law requires a particular safeguard for a transfer, that safeguard has to be in place before the transfer is relied on. This draft does not name a transfer mechanism that has not been confirmed.",
      },
    ],
  },
  {
    id: "updates-contact",
    title: "Updates and contact",
    blocks: [
      {
        kind: "p",
        text: `Material changes will be posted on this page with a new “last updated” date. Continued use after that date is subject to the updated draft and to any consent the law requires. Privacy questions can be sent to ${legalConfig.privacyEmail}.`,
      },
    ],
  },
];
