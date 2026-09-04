import { createFileRoute } from "@tanstack/react-router";
import { StudioTopicPage, topicHead, type StudioTopic } from "@/components/studio-topic-page";

const topic: StudioTopic = {
  canonical: "https://getinksights.co.uk/tattoo-studio-growth",
  title: "How to Grow a Tattoo Studio in the UK | INKSIGHTS",
  description: "A practical framework for growing a UK tattoo studio through visibility, enquiry conversion, capacity, transaction value and client return.",
  eyebrow: "Tattoo studio growth guide · UK",
  intro: <>Growing a tattoo studio is not simply a matter of getting more followers or more enquiries. A studio needs a reliable system for attracting the right clients, converting enquiries, protecting artist time, realising value from each booking and creating reasons to return.</>,
  sections: [
    { title: "Start with the growth constraint", body: <>Before spending more on advertising, identify the first material point where performance is being lost. More traffic will not repair weak enquiry handling, an under-used diary or poor client return.</>, bullets: ["Low visibility: the right local prospects are not finding the studio.", "Low conversion: enquiries arrive but fail to become qualified bookings.", "Low utilisation: artists have avoidable gaps or weak demand matching.", "Low value or frequency: booked work is not creating enough revenue per client over time."] },
    { title: "Use the three core revenue levers", body: <>A useful commercial model is <strong>clients × average transaction value × purchase frequency</strong>. A studio can improve one lever, several together, or the operating conditions underneath them.</>, bullets: ["Clients: improve local discovery, referral, enquiry response and reactivation.", "Average transaction value: improve project structure, pricing discipline and appropriate premium options.", "Purchase frequency: improve rebooking, multi-session continuity, referrals and client reactivation.", "Capacity: protect the available artist hours needed to deliver the additional demand."] },
    { title: "Measure the tattoo-studio funnel", body: <>Owners should be able to move from a revenue total to the conditions producing it: where enquiries come from, how quickly they are handled, how many qualify, how many pay deposits, how much time is booked and how many clients return.</>, bullets: ["Website and Google visibility", "Monthly enquiries and qualified enquiries", "Enquiry-to-booking conversion", "Deposit and cancellation rate", "Available versus booked artist hours", "Average booking value", "Repeat-client and rebooking rate"] },
    { title: "Fix the system before adding software", body: <>A new platform is useful only when it removes a proven bottleneck. First define the desired workflow, ownership, exceptions, policies and metrics. Then assess whether the current tools can support it.</>, bullets: ["Map the current journey from discovery to repeat booking.", "Document which steps require human judgement.", "Define the one metric that should improve first.", "Choose the smallest change that can test the hypothesis."] },
    { title: "Build a studio growth baseline", body: <>The long-term advantage comes from knowing the studio's normal operating position. A structured baseline makes future changes measurable and allows a studio to compare periods without relying on memory.</>, bullets: ["Revenue and booking mix", "Artist utilisation and available capacity", "Lead source and response time", "Cancellation and no-show conditions", "Average transaction value", "Repeat bookings, referrals and reactivation"] },
  ],
  ctaTitle: "Find your studio's biggest growth constraint.",
  ctaDescription: "Run the free INKSIGHTS Revenue Audit to estimate where opportunity may be sitting before you spend more on traffic, software or tactics.",
};

export const Route = createFileRoute("/tattoo-studio-growth")({ component: () => <StudioTopicPage topic={topic} />, head: () => topicHead(topic) });
