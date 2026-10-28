import { legalConfig } from "../legal-config";
import type { LegalSection } from "../types";

const processing = legalConfig.processingTime
  ? `Current processing estimate: ${legalConfig.processingTime}.`
  : "An order-processing time has not been confirmed. No number of days is promised on this page.";

const delivery = legalConfig.deliveryEstimate
  ? `Current delivery estimate: ${legalConfig.deliveryEstimate}.`
  : "A delivery range has not been confirmed. This page does not state a delivery guarantee.";

export const shippingSections: LegalSection[] = [
  {
    id: "scope",
    title: "Scope",
    blocks: [
      {
        kind: "p",
        text: "This policy is for physical products offered in GEOstore, including merchandise shown in the catalogue such as T-shirts, hoodies, caps, mugs, stickers, and globes.",
      },
      {
        kind: "p",
        text: "Quiz access, library content, membership plans, credits, and other digital features are not physically shipped. Merchandise checkout is not connected to a payment provider or a courier in the current build. A checkout preview on your device is not confirmation that an order will be packed or shipped.",
      },
    ],
  },
  {
    id: "processing",
    title: "Order processing",
    blocks: [
      {
        kind: "p",
        text: "A physical order is processed only after payment has succeeded and the order is accepted. Processing time is the time after that acceptance and before the parcel is handed to a carrier. Transit time starts after that handoff and is separate.",
      },
      {
        kind: "p",
        text: processing,
      },
    ],
  },
  {
    id: "locations",
    title: "Shipping locations",
    blocks: [
      {
        kind: "p",
        text: "Serviceable locations will be confirmed at checkout when checkout can actually accept an order. This policy does not promise delivery to every part of India, and it does not promise international shipping. A preview label in the unfinished checkout is not a coverage commitment.",
      },
    ],
  },
  {
    id: "charges",
    title: "Shipping charges",
    blocks: [
      {
        kind: "p",
        text: "Any shipping charge, tax, or other fee that applies to an order will be shown before you pay. This page does not set a flat fee, a free-shipping threshold, or a tax rate. Figures that appear only inside an unfinished local preview are not prices.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Estimated delivery",
    blocks: [
      {
        kind: "p",
        text: delivery,
      },
      {
        kind: "p",
        text: "When an estimate is published, it can still change because of the destination, the carrier, weather, public holidays, customs where a cross-border shipment is actually offered, or other events outside a normal handover. An estimate is not a guaranteed delivery date.",
      },
    ],
  },
  {
    id: "tracking",
    title: "Order tracking",
    blocks: [
      {
        kind: "p",
        text: "Tracking will be shared when the fulfilment process actually provides a tracking reference. The current store preview can display a locally generated reference. That reference is not a live carrier tracking number.",
      },
      {
        kind: "p",
        text: `If a real shipment is late or has no tracking, write to ${legalConfig.supportEmail} with the order details you were given. The website contact form does not deliver that message.`,
      },
    ],
  },
  {
    id: "addresses",
    title: "Incorrect addresses and failed deliveries",
    blocks: [
      {
        kind: "p",
        text: "You are responsible for the delivery details you submit. If those details are incomplete or wrong, the carrier may be unable to deliver.",
      },
      {
        kind: "p",
        text: "If you notice a mistake before the order is handed to a carrier, contact support as soon as you can and we will say whether a correction is still possible. After handoff, a correction depends on the carrier. A failed attempt or a return to sender can require a new shipment. Any extra charge will be told to you before it is taken, and only where the law allows it. A seller-side addressing error is not treated as your cost where the law puts that cost on the seller.",
      },
    ],
  },
  {
    id: "damaged",
    title: "Damaged shipments",
    blocks: [
      {
        kind: "p",
        text: "If packaging or the product is visibly damaged in transit, photograph the outer packaging, the product, and any label you can read. Report it under the Refund and Replacement Policy. Keep the packaging where you reasonably can.",
      },
    ],
  },
  {
    id: "lost",
    title: "Lost or delayed shipments",
    blocks: [
      {
        kind: "p",
        text: `If a shipment that was actually dispatched looks lost or unreasonably delayed, email ${legalConfig.supportEmail} with the order information you have. GVRZE will check the fulfilment record and the carrier information that exists for that order, then tell you what remedy is available under the Refund and Replacement Policy and applicable law.`,
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        kind: "p",
        text: `Shipping questions go to ${legalConfig.supportEmail}. ${legalConfig.supportPhone ? `Telephone: ${legalConfig.supportPhone}.` : "No support telephone number is published."}`,
      },
    ],
  },
];
