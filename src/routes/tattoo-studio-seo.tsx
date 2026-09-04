import { createFileRoute } from "@tanstack/react-router";
import { StudioTopicPage, topicHead, type StudioTopic } from "@/components/studio-topic-page";

const topic: StudioTopic = {
  canonical: "https://getinksights.co.uk/tattoo-studio-seo",
  title: "Tattoo Studio SEO: How to Get Found on Google in the UK | INKSIGHTS",
  description: "Practical tattoo studio SEO guidance covering Google Business Profile, local relevance, website structure, portfolio proof and booking conversion.",
  eyebrow: "Tattoo studio SEO guide · UK",
  intro: <>Tattoo studio SEO is local and commercial. The objective is not simply to rank for “tattoo studio”; it is to be discoverable when the right person searches for a relevant style, service or studio in the areas you actually serve—and then make the next step obvious.</>,
  sections: [
    { title: "Start with Google Business Profile", body: <>For a local studio, the Google Business Profile is a core public entity. Keep the business name, category, location, hours, services, website and appointment route accurate, then maintain the profile with genuine photographs and useful review responses.</>, bullets: ["Use the most accurate primary category available.", "Keep address or service-area information truthful.", "Link to a real booking or enquiry destination.", "Build a steady stream of authentic studio and work imagery."] },
    { title: "Create pages around how clients search", body: <>One homepage should not have to rank for every style, location and service. Build useful pages where there is genuine depth: black-and-grey realism, Japanese, fine line, cover-up work, piercing, or a specific location served by the studio.</>, bullets: ["Use descriptive page titles and headings.", "Avoid copied city/style pages with interchangeable text.", "Connect portfolio evidence to the service or style being discussed.", "Give every high-intent page one clear enquiry action."] },
    { title: "Make the portfolio search-relevant", body: <>Search visibility and conversion are connected. A prospect who finds a page about black-and-grey realism should immediately see relevant work, artist fit, healed evidence where available and a clear way to submit a project.</>, bullets: ["Group relevant work by artist or style where useful.", "Use descriptive image alt text rather than keyword stuffing.", "Include context around project type and location naturally.", "Keep public portfolio work current and selective."] },
    { title: "Build local authority without doorway pages", body: <>The strongest local pages are genuinely useful. They explain the studio, the service, the area and the booking process. Thin pages made only to capture town names are unlikely to build durable authority.</>, bullets: ["Publish original local or market observations.", "Earn relevant mentions and links rather than buying generic links.", "Use internal links between related service, guide and diagnostic pages.", "Keep canonical, sitemap and domain signals consistent."] },
    { title: "SEO is wasted when the booking path leaks", body: <>Ranking creates an opportunity, not a booking. Track what happens after the click: profile visit, website visit, enquiry, response, qualification, deposit and appointment. A studio can improve commercial performance more by fixing conversion than by chasing another keyword.</>, bullets: ["One prominent CTA on high-intent pages", "Clear enquiry requirements", "Expected response time", "Deposit and cancellation expectations", "Mobile-first booking journey"] },
  ],
  ctaTitle: "See where your studio is visible — and where it is leaking demand.",
  ctaDescription: "Run the free Tattoo Studio Visibility Scorecard or Revenue Audit before investing in more SEO work.",
};

export const Route = createFileRoute("/tattoo-studio-seo")({ component: () => <StudioTopicPage topic={topic} />, head: () => topicHead(topic) });
