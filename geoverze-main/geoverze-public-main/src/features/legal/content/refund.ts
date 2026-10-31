import { legalConfig } from "../legal-config";
import type { LegalSection } from "../types";

export const refundSections: LegalSection[] = [
  {
    id: "general-rule",
    title: "General rule",
    blocks: [
      {
        kind: "p",
        text: "Gstore products are not eligible for a return or refund only because you changed your mind, dislike the item, or ordered the wrong size, colour, or variant. That rule is subject to applicable consumer law. It does not let GVRZE refuse a remedy that the law requires.",
      },
    ],
  },
  {
    id: "eligible-cases",
    title: "When a remedy can be requested",
    blocks: [
      {
        kind: "p",
        text: "Contact support if any of the following happens on an order that was actually accepted and supplied:",
      },
      {
        kind: "list",
        items: [
          "The product arrives physically damaged.",
          "The product has a manufacturing defect.",
          "The product is materially different from the description you ordered.",
          "You received a different product from the one you ordered.",
          "The product was not delivered, where a refund or another remedy is required by law.",
        ],
      },
    ],
  },
  {
    id: "reporting",
    title: "Reporting a problem",
    blocks: [
      {
        kind: "p",
        text: `Please write to ${legalConfig.supportEmail} within ${legalConfig.defectReportWindow}. That window is proposed and still needs business confirmation. It is a request so visible problems can be checked quickly. It does not remove a right you have if a defect could not reasonably have been seen immediately, or if the law gives you a longer period.`,
      },
      {
        kind: "p",
        text: "Include the order information you were given, a short description of the problem, and photographs or video that show the issue. Keep the packaging where you reasonably can. The website contact form does not deliver this report.",
      },
    ],
  },
  {
    id: "resolution",
    title: "How a report is resolved",
    blocks: [
      {
        kind: "p",
        text: "A report is reviewed against the order and the evidence you send. Nothing on this page is an automatic refund or an automatic replacement before that review.",
      },
      {
        kind: "p",
        text: "Where the issue is confirmed, and depending on the facts and applicable law, the resolution can be a replacement of the affected product, a refund, or another lawful resolution you and GVRZE agree. Statutory rights, including rights under Indian consumer law where they apply, remain available.",
      },
    ],
  },
  {
    id: "return-shipping",
    title: "Return shipping",
    blocks: [
      {
        kind: "p",
        text: "For a verified defective, damaged, or incorrect product, GVRZE will arrange the return or reimburse reasonable return shipping where that is appropriate under the agreed resolution and applicable law. You should not have to pay the return cost of a verified seller-side error where the law puts that cost on the seller.",
      },
      {
        kind: "p",
        text: "Do not send a product back before support confirms the next step, unless the law requires you to do something sooner. An unannounced return can be difficult to match to an order.",
      },
    ],
  },
  {
    id: "refund-processing",
    title: "Refund processing",
    blocks: [
      {
        kind: "p",
        text: "An approved refund is generally sent back through the original payment method when that method supports it. Paid checkout is not connected today, so there is no live refund rail to describe beyond that intention. The time a bank or payment provider takes is outside a fixed promise on this page. No refund deadline in a set number of days is stated here.",
      },
      {
        kind: "p",
        text: "Shipping charges and other fees on a verified defective, damaged, incorrect, or undelivered order are handled according to the circumstances and applicable law. They are not automatically kept, and they are not automatically refunded in every case.",
      },
    ],
  },
  {
    id: "non-returnable",
    title: "Change of mind",
    blocks: [
      {
        kind: "p",
        text: "A change of mind, a preference about fit or colour, or an order for the wrong variant is not a return reason under this policy. That does not apply to goods that are defective, damaged, incorrect, materially misdescribed, or otherwise returnable because the law says so.",
      },
    ],
  },
  {
    id: "digital",
    title: "Digital access, subscriptions, and credits",
    blocks: [
      {
        kind: "p",
        text: "Quiz access, library content, subscription time, and credits follow the service terms and applicable law. This policy does not promise a refund of unused subscription time, unused credits, or digital content. It also does not say that every digital purchase is non-refundable where the law requires a remedy.",
      },
      {
        kind: "p",
        text: "Paid plan checkout is not connected, so a membership is not currently being billed. If you are charged in error, charged twice, or charged without authorisation once billing exists, email support with the details you have. Credits are gameplay or promotional units inside GVRZE. They are not cash and are not withdrawn as money.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact and disputes",
    blocks: [
      {
        kind: "p",
        text: `Send a claim to ${legalConfig.supportEmail} with your order or account details and what you are asking for. If a claim is not resolved, you can still use the dispute routes that applicable law gives you, including consumer remedies that cannot be waived. This policy does not choose an exclusive court.`,
      },
    ],
  },
];
