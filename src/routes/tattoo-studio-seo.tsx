import { createFileRoute } from "@tanstack/react-router";
import { StudioTopicPage, topicHead, type StudioTopic } from "@/components/studio-topic-page";

const topic: StudioTopic = {
  canonical: "https://getinksights.co.uk/tattoo-studio-seo",
  title: "Tattoo Studio SEO: Google & Local Search Guide for UK Studios | INKSIGHTS",
  description:
    "A practical UK tattoo studio SEO guide covering Google Business Profile, local search, service and style pages, portfolio proof, internal linking, reviews, measurement and booking conversion.",
  eyebrow: "Tattoo studio SEO & local search guide · UK",
  updated: "2026-10-08",
  intro: (
    <>
      Tattoo studio SEO is not about publishing the most pages or repeating the phrase “tattoo studio near me”. The commercial
      objective is to appear when the right local prospect searches for a studio, artist, style or service the business genuinely
      provides — and then give that person enough proof and clarity to enquire.
    </>
  ),
  sections: [
    {
      title: "Start with the search journey, not a list of keywords",
      body: (
        <>
          A useful search strategy maps the decisions a tattoo client makes. Someone may begin with a broad local search, narrow to
          a style such as black-and-grey realism or fine line, compare artists and portfolios, then look for practical information
          about location, booking, deposits or availability. Each important search intent should have one clear destination rather
          than several pages competing for the same phrase.
        </>
      ),
      bullets: [
        "Studio intent: tattoo studio + city or area.",
        "Style intent: realism, fine line, Japanese, blackwork or another genuine specialism.",
        "Artist intent: artist name, portfolio, style and studio relationship.",
        "Decision intent: booking process, pricing context, deposits, consultations and availability.",
      ],
    },
    {
      title: "Treat Google Business Profile as part of the search system",
      body: (
        <>
          Google says local results are mainly influenced by relevance, distance and prominence. A studio cannot control the
          searcher's distance, but it can improve the accuracy and completeness of its public entity signals. The website, Business
          Profile, reviews and other trusted references should describe the same real business rather than sending conflicting
          signals.
        </>
      ),
      bullets: [
        "Use the most accurate primary business category and only relevant additional categories.",
        "Keep address, opening hours, phone, website and appointment route accurate.",
        "Describe genuine services and specialisms instead of adding unrelated categories for reach.",
        "Maintain current photographs and respond professionally to genuine reviews.",
      ],
    },
    {
      title: "Give each valuable search intent a useful landing page",
      body: (
        <>
          One homepage should not carry every local, style and service query. Build a dedicated page when the studio can provide
          real depth: relevant work, artist fit, process information, location context and a clear enquiry route. A page deserves
          to exist because it helps a prospective client make a decision — not simply because a keyword can be inserted into a URL.
        </>
      ),
      bullets: [
        "Use one primary intent per page and keep titles, H1s and body copy aligned to it.",
        "Show relevant portfolio evidence close to the claim the page is making.",
        "Explain who the service is for, how the project works and what the next step is.",
        "Link the page naturally to the relevant artist, booking and studio-information pages.",
      ],
    },
    {
      title: "Do not create thin city and style doorway pages",
      body: (
        <>
          A template that swaps only a town name or tattoo style creates little value and can fragment authority across dozens of
          weak URLs. Create local or specialist pages only when the studio genuinely serves that market and can add unique evidence:
          work completed, artist expertise, travel or location context, client questions, process differences or original
          observations.
        </>
      ),
      bullets: [
        "Consolidate overlapping pages when they answer the same intent.",
        "Avoid mass-producing near-identical town pages.",
        "Use a broader regional page when there is not enough unique local substance.",
        "Update strong existing pages before creating another page that targets the same demand.",
      ],
    },
    {
      title: "Turn the portfolio into search evidence",
      body: (
        <>
          Tattooing is visual, but search engines still need context around the images. A strong portfolio page connects each piece
          to an artist, style and project context while remaining useful to a human visitor. The goal is not keyword-heavy alt text;
          it is a clear relationship between the work shown and the search intent the page promises to satisfy.
        </>
      ),
      bullets: [
        "Use descriptive image alt text where the image conveys meaningful content.",
        "Group work by artist or genuine specialism when that helps clients compare fit.",
        "Add concise project context instead of uploading anonymous image grids.",
        "Include healed work and current studio imagery where available and appropriate.",
      ],
    },
    {
      title: "Build internal links as a topic map",
      body: (
        <>
          Google explicitly uses links to discover pages and understand relevance. For a tattoo studio, internal linking should
          connect informational guidance to the commercial destination it supports. A style guide can link to the relevant
          portfolio or artist; an artist page can link to the booking process; the booking page can link back to policies and studio
          information. Descriptive anchor text is more useful than repeated “click here” links.
        </>
      ),
      bullets: [
        "Every important page should be reachable through at least one crawlable internal link.",
        "Link related pages in context rather than relying only on the navigation menu.",
        "Use descriptive, natural anchor text that explains the destination.",
        "Create hubs around meaningful themes such as styles, artists, booking and studio information.",
      ],
    },
    {
      title: "Build prominence with reputation and real-world mentions",
      body: (
        <>
          Local visibility is not created by the website alone. Google describes prominence as how well known a business is and
          notes that information from across the web, including links and reviews, can contribute. The durable strategy is therefore
          to earn genuine references from relevant organisations, publications, suppliers, local sources and partners rather than
          buying generic link packages.
        </>
      ),
      bullets: [
        "Ask satisfied clients for genuine reviews without incentives or fabricated wording.",
        "Keep core business information consistent on legitimate profiles and directories.",
        "Create resources or original observations that industry sites have a reason to reference.",
        "Treat partnerships, events and local coverage as reputation opportunities, not link schemes.",
      ],
    },
    {
      title: "Keep the technical layer simple and accurate",
      body: (
        <>
          Technical SEO should make good content easy to crawl, index and understand. For most studio sites that means clean URLs,
          crawlable links, self-consistent canonicals, a truthful sitemap, useful page titles and mobile pages that contain the same
          important content and links as desktop. Technical complexity is not a substitute for relevance or authority.
        </>
      ),
      bullets: [
        "Keep indexable commercial pages accessible without login or client-side-only navigation.",
        "Use one canonical URL for each piece of content and redirect retired duplicates.",
        "Only use sitemap last-modified dates when a page has changed significantly.",
        "Check mobile usability and page experience before adding decorative complexity.",
      ],
    },
    {
      title: "Measure search before and after the click",
      body: (
        <>
          Search Console measures what happened in Google before a visitor arrived: impressions, clicks, queries and pages. Website
          analytics measures what happened after the click. Connect those layers to the studio funnel so SEO is judged by qualified
          enquiries, deposits and booked work rather than rankings alone.
        </>
      ),
      bullets: [
        "Track impressions, clicks, CTR and query/page movement in Search Console.",
        "Track organic landing pages, enquiry starts and completed enquiries on the website.",
        "Measure enquiry-to-booking and deposit conversion separately from traffic.",
        "Review the pages and queries creating commercial outcomes, not only the highest visit counts.",
      ],
    },
    {
      title: "Use a 90-day sequence instead of random SEO tasks",
      body: (
        <>
          Start by fixing measurement, indexability and duplicate intent. Then strengthen the pages closest to a booking decision,
          connect them with internal links and improve Business Profile consistency. Only after the foundation is measurable should
          the studio expand into new informational topics or additional local pages. The exact sequence should follow the observed
          constraint rather than a generic publishing quota.
        </>
      ),
      bullets: [
        "Days 1–14: measurement, indexability, query-to-page map and Business Profile accuracy.",
        "Days 15–45: improve high-intent style, artist, service and booking pages.",
        "Days 46–75: build supporting guides, internal links and link-worthy original resources.",
        "Days 76–90: compare Search Console movement with enquiries and decide what to expand, merge or rebuild.",
      ],
    },
  ],
  faqs: [
    {
      question: "Does a tattoo studio still need a website if Instagram performs well?",
      answer:
        "Yes, if the studio wants durable search visibility and a controlled booking journey. Social platforms can create demand and proof, but the studio website gives the business its own indexable pages, structured information, conversion path and measurement layer.",
    },
    {
      question: "Should a tattoo studio create a separate page for every nearby town?",
      answer:
        "Only when the studio genuinely serves that location and can provide useful, unique local content. Near-identical pages that simply swap place names are unlikely to create durable value and can dilute the site's architecture.",
    },
    {
      question: "Do Google reviews improve local SEO?",
      answer:
        "Google states that review count and review score can contribute to local prominence, but reviews do not guarantee a particular position. Reviews should be genuine and treated as part of the wider reputation and customer-experience system.",
    },
    {
      question: "How quickly should SEO rankings improve?",
      answer:
        "There is no reliable universal timeframe. Crawl and index changes can happen relatively quickly, while competitive ranking gains may take much longer and depend on relevance, authority, competition, location and the quality of the underlying site. Measure progress through impressions, clicks, qualified enquiries and commercial outcomes rather than promising a date.",
    },
  ],
  related: [
    {
      href: "/tattoo-studio-marketing",
      label: "Tattoo studio marketing",
      description: "Connect organic discovery with the wider demand-generation and conversion system.",
    },
    {
      href: "/tattoo-studio-booking",
      label: "Tattoo studio booking systems",
      description: "Make sure additional search demand can become qualified, protected diary time.",
    },
    {
      href: "/tattoo-studio-growth",
      label: "How to grow a tattoo studio",
      description: "Place SEO inside the wider visibility, conversion, capacity and retention model.",
    },
    {
      href: "/tattoo-studio-software",
      label: "Tattoo studio software comparison",
      description: "Evaluate software only after the workflow and measurement requirements are clear.",
    },
  ],
  sources: [
    {
      label: "Google Business Profile Help — Tips to improve your local ranking on Google",
      href: "https://support.google.com/business/answer/7091?hl=en",
      note: "Google's guidance on relevance, distance, prominence, reviews and profile completeness.",
    },
    {
      label: "Google Search Central — Link best practices",
      href: "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
      note: "Crawlable links, descriptive anchor text and internal-link guidance.",
    },
    {
      label: "Google Search Central — Creating helpful, reliable, people-first content",
      href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
      note: "Content-quality guidance and warnings against search-engine-first publishing.",
    },
    {
      label: "Google Search Central — Build and submit a sitemap",
      href: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap",
      note: "Guidance on sitemap URLs and meaningful last-modified dates.",
    },
    {
      label: "Google Search Central — Using Search Console and Analytics data for SEO",
      href: "https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console",
      note: "How pre-click Search Console data and post-click analytics complement each other.",
    },
  ],
  ctaTitle: "See where your studio is visible — and where it is leaking demand.",
  ctaDescription:
    "Run the free Tattoo Studio Visibility Scorecard or Revenue Audit before investing in more SEO work.",
};

export const Route = createFileRoute("/tattoo-studio-seo")({
  component: () => <StudioTopicPage topic={topic} />,
  head: () => topicHead(topic),
});
