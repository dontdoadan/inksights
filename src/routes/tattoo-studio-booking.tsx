import { createFileRoute } from "@tanstack/react-router";
import { StudioTopicPage, topicHead, type StudioTopic } from "@/components/studio-topic-page";

const topic: StudioTopic = {
  canonical: "https://getinksights.co.uk/tattoo-studio-booking",
  title: "Tattoo Studio Booking Systems: Reduce Booking Friction & No-Shows | INKSIGHTS",
  description: "A practical tattoo studio booking framework covering enquiry intake, project approval, deposits, reminders, cancellations and client follow-up.",
  eyebrow: "Tattoo studio booking guide · UK",
  updated: "2026-10-08",
  intro: <>Tattoo bookings are projects, not just appointments. A useful booking system needs to capture enough information to qualify the request, protect artist time, collect the right deposit, manage exceptions and make the client's next step obvious.</>,
  sections: [
    { title: "Start with structured enquiry intake", body: <>The studio should collect the information an artist or manager needs before offering appointment time. This usually includes placement, approximate size, style, reference images, preferred artist, availability and relevant project context.</>, bullets: ["Avoid making the owner reconstruct project details from Instagram DMs.", "Separate required qualification data from optional marketing questions.", "Give the client an immediate confirmation after submission.", "Route unsuitable or incomplete requests to a non-calendar follow-up path."] },
    { title: "Control the approval step", body: <>Many custom tattoo projects cannot be priced or scheduled accurately from a generic appointment widget. A controlled approval stage allows the studio to review the project before committing valuable artist time.</>, bullets: ["Review the project before offering times.", "Keep artist availability protected until approval.", "Record who approved the project and what was agreed.", "Use one source of truth for the current booking state."] },
    { title: "Use deposits to protect the diary", body: <>Deposits should have a clear purpose and policy: what they secure, when they are transferable, when they can be retained, and how changes or cancellations are handled. The goal is predictable administration, not punitive friction.</>, bullets: ["Publish the deposit terms before payment.", "Link deposits to the correct client and project.", "Make transfers and cancellation windows explicit.", "Reconcile unpaid or overdue balances systematically."] },
    { title: "Reduce avoidable cancellations and no-shows", body: <>Reminders work best when they reinforce a clear expectation rather than simply sending more messages. Confirm the date, preparation information, cancellation terms and what the client must do if they need to move the appointment.</>, bullets: ["Immediate confirmation", "Timed reminders", "Clear preparation instructions", "Human escalation for unusual cases"] },
    { title: "Measure the booking funnel", body: <>The software is not the KPI. Measure how many enquiries become qualified projects, how many are offered appointments, how many pay deposits and how many attend. This identifies whether the bottleneck is demand, response, qualification or diary control.</>, bullets: ["Enquiry volume", "Qualification rate", "Response time", "Enquiry-to-booking conversion", "Deposit conversion", "Cancellation and no-show rate"] },
  ],
  related: [
    { href: "/tattoo-studio-software", label: "Tattoo studio software comparison", description: "Compare booking platforms only after the workflow requirements are defined." },
    { href: "/tattoo-studio-client-retention", label: "Tattoo client retention", description: "Continue the client journey beyond the completed appointment." },
    { href: "/tattoo-studio-revenue", label: "Tattoo studio revenue", description: "Measure how booking conversion and attendance translate into realised revenue." },
    { href: "/tattoo-studio-growth", label: "Tattoo studio growth", description: "See where booking sits inside the wider studio growth system." },
  ],
  faqs: [
    { question: "Should a tattoo studio allow instant online booking?", answer: "Only for appointment types that can be safely standardised. Custom projects often need qualification and artist approval before valuable diary time is offered." },
    { question: "What should a tattoo enquiry form collect?", answer: "Collect only the information needed to make the next decision, such as placement, approximate size, style, reference images, preferred artist, availability and relevant project context." },
    { question: "What is the most useful booking KPI?", answer: "There is no single universal KPI. Enquiry-to-booking conversion, deposit conversion, response time, cancellation rate and attended appointments together show where the booking journey is leaking." },
  ],
  ctaTitle: "Find out whether booking is actually your constraint.",
  ctaDescription: "Run the free Revenue Audit before buying or migrating to another booking platform. The right system depends on the studio's actual workflow and commercial bottleneck.",
};

export const Route = createFileRoute("/tattoo-studio-booking")({ component: () => <StudioTopicPage topic={topic} />, head: () => topicHead(topic) });
