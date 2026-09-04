import { createFileRoute } from "@tanstack/react-router";
import { StudioTopicPage, topicHead, type StudioTopic } from "@/components/studio-topic-page";

const topic: StudioTopic = {
  canonical: "https://getinksights.co.uk/tattoo-studio-revenue",
  title: "Tattoo Studio Revenue: Find and Fix Revenue Leakage | INKSIGHTS",
  description: "Learn how to diagnose tattoo studio revenue using clients, transaction value, purchase frequency, capacity, conversion and retention.",
  eyebrow: "Tattoo studio revenue guide · UK",
  intro: <>Revenue problems are rarely caused by one number. A studio can have strong demand but weak conversion, a busy diary but low average value, or healthy sales with poor repeat behaviour. INKSIGHTS treats revenue as the output of a measurable operating system.</>,
  sections: [
    { title: "Revenue starts with booked, delivered work", body: <>Separate demand from realised revenue. Enquiries are not bookings, bookings are not attendance, and booked hours are not necessarily productive hours. Establish each stage before deciding what to change.</>, bullets: ["Enquiries received", "Qualified enquiries", "Bookings secured", "Deposits collected", "Appointments attended", "Revenue realised"] },
    { title: "Use three primary revenue levers", body: <>A useful first model is <strong>clients × average transaction value × purchase frequency</strong>. These levers can compound, but only if the studio has enough capacity to deliver additional demand.</>, bullets: ["More clients: visibility, referrals, conversion and reactivation.", "Higher value: pricing, project scope and appropriate add-ons.", "More frequency: continuation projects, rebooking, referrals and reactivation.", "Capacity control: ensure additional demand can actually be delivered."] },
    { title: "Find the biggest leak", body: <>Estimate the commercial value associated with each material weakness. A 2% improvement in conversion may be more valuable than a large increase in reach if the studio already receives enough enquiries.</>, bullets: ["Under-used artist hours", "Unconverted enquiry volume", "Cancellation and no-show loss", "Low average booking value", "Low repeat booking rate"] },
    { title: "Do not confuse revenue with profit", body: <>A revenue uplift can require extra labour, materials, advertising or management time. A serious commercial review therefore records the direct costs and operational conditions surrounding a change rather than claiming every pound of uplift is profit.</> },
    { title: "Build a repeatable revenue dashboard", body: <>The useful dashboard is not a wall of metrics. Track a small set of definitions consistently enough that an owner can compare periods, artists and interventions without changing the calculation each month.</>, bullets: ["Revenue", "Average booking value", "Enquiry-to-booking conversion", "Booked versus available hours", "Cancellation/no-show rate", "Repeat-client rate"] },
  ],
  ctaTitle: "Estimate the revenue opportunity before changing the studio.",
  ctaDescription: "Run the free INKSIGHTS Revenue Audit and see which part of the studio economics may contain the largest first-pass opportunity.",
};

export const Route = createFileRoute("/tattoo-studio-revenue")({ component: () => <StudioTopicPage topic={topic} />, head: () => topicHead(topic) });
