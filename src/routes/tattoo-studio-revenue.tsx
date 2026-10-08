import { createFileRoute } from "@tanstack/react-router";
import { StudioTopicPage, topicHead, type StudioTopic } from "@/components/studio-topic-page";

const topic: StudioTopic = {
  canonical: "https://getinksights.co.uk/tattoo-studio-revenue",
  title: "Tattoo Studio Revenue: Find and Fix Revenue Leakage | INKSIGHTS",
  description: "Learn how to diagnose tattoo studio revenue using clients, transaction value, purchase frequency, capacity, conversion and retention.",
  eyebrow: "Tattoo studio revenue guide · UK",
  updated: "2026-10-08",
  intro: <>Revenue problems are rarely caused by one number. A studio can have strong demand but weak conversion, a busy diary but low average value, or healthy sales with poor repeat behaviour. INKSIGHTS treats revenue as the output of a measurable operating system.</>,
  sections: [
    { title: "Revenue starts with booked, delivered work", body: <>Separate demand from realised revenue. Enquiries are not bookings, bookings are not attendance, and booked hours are not necessarily productive hours. Establish each stage before deciding what to change.</>, bullets: ["Enquiries received", "Qualified enquiries", "Bookings secured", "Deposits collected", "Appointments attended", "Revenue realised"] },
    { title: "Use three primary revenue levers", body: <>A useful first model is <strong>clients × average transaction value × purchase frequency</strong>. These levers can compound, but only if the studio has enough capacity to deliver additional demand.</>, bullets: ["More clients: visibility, referrals, conversion and reactivation.", "Higher value: pricing, project scope and appropriate add-ons.", "More frequency: continuation projects, rebooking, referrals and reactivation.", "Capacity control: ensure additional demand can actually be delivered."] },
    { title: "Find the biggest leak", body: <>Estimate the commercial value associated with each material weakness. A 2% improvement in conversion may be more valuable than a large increase in reach if the studio already receives enough enquiries.</>, bullets: ["Under-used artist hours", "Unconverted enquiry volume", "Cancellation and no-show loss", "Low average booking value", "Low repeat booking rate"] },
    { title: "Do not confuse revenue with profit", body: <>A revenue uplift can require extra labour, materials, advertising or management time. A serious commercial review therefore records the direct costs and operational conditions surrounding a change rather than claiming every pound of uplift is profit.</> },
    { title: "Build a repeatable revenue dashboard", body: <>The useful dashboard is not a wall of metrics. Track a small set of definitions consistently enough that an owner can compare periods, artists and interventions without changing the calculation each month.</>, bullets: ["Revenue", "Average booking value", "Enquiry-to-booking conversion", "Booked versus available hours", "Cancellation/no-show rate", "Repeat-client rate"] },
  ],
  related: [
    { href: "/growth-model", label: "Tattoo studio revenue growth model", description: "Model the compound effect of client volume, transaction value and purchase frequency." },
    { href: "/tattoo-studio-booking", label: "Tattoo studio booking systems", description: "Understand how enquiries become deposits, appointments and realised work." },
    { href: "/tattoo-studio-client-retention", label: "Tattoo client retention", description: "Measure repeat projects, rebooking and reactivation as revenue levers." },
    { href: "/tattoo-studio-growth", label: "Tattoo studio growth", description: "Place revenue inside the wider demand, conversion and capacity system." },
  ],
  faqs: [
    { question: "How should a tattoo studio calculate revenue growth?", answer: "Start by separating client volume, average transaction value and purchase frequency, then check whether available artist capacity can support the additional work." },
    { question: "Is a fully booked tattoo studio automatically profitable?", answer: "No. A full diary can still coexist with weak pricing, high cancellations, excessive costs, inefficient artist utilisation or low contribution margin. Revenue and profit should be measured separately." },
    { question: "What revenue metrics should a tattoo studio track?", answer: "A practical baseline includes realised revenue, average booking value, enquiry-to-booking conversion, booked versus available hours, cancellation or no-show rate, and repeat-client rate." },
  ],
  ctaTitle: "Estimate the revenue opportunity before changing the studio.",
  ctaDescription: "Run the free INKSIGHTS Revenue Audit and see which part of the studio economics may contain the largest first-pass opportunity.",
};

export const Route = createFileRoute("/tattoo-studio-revenue")({ component: () => <StudioTopicPage topic={topic} />, head: () => topicHead(topic) });
