import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

const CANONICAL_URL = "https://getinksight.co.uk/accessibility";

export const Route = createFileRoute("/accessibility")({
  component: AccessibilityPage,
  head: () => ({
    meta: [
      { title: "Accessibility Statement | INKSIGHT" },
      { name: "description", content: "INKSIGHT's accessibility approach, current features and how to report a barrier." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function AccessibilityPage() {
  return (
    <LegalPage
      eyebrow="Accessibility"
      title="Accessibility Statement"
      description="INKSIGHT aims to make public tools, articles and service information usable across devices, input methods and assistive technologies."
    >
      <h2>Accessibility target</h2>
      <p>The website is being developed toward WCAG 2.2 Level AA principles. This is an ongoing engineering and content process rather than a claim that every page is already perfect.</p>

      <h2>Current measures</h2>
      <ul>
        <li>A skip-to-content link on the shared public header.</li>
        <li>Keyboard-visible focus indicators.</li>
        <li>Responsive layouts designed down to a 320-pixel viewport.</li>
        <li>Minimum touch-friendly controls on primary navigation and forms.</li>
        <li>Reduced-motion support when the operating system requests it.</li>
        <li>Semantic headings, labels, fieldsets and status messages on interactive pages.</li>
        <li>Text alternatives or descriptive context for functional icons.</li>
        <li>High-contrast dark, white and mint visual system.</li>
      </ul>

      <h2>Known limitations</h2>
      <ul>
        <li>Some complex comparison tables require horizontal scrolling on narrow screens.</li>
        <li>Interactive calculators simplify information and may need further testing with a wider range of screen readers and voice-control tools.</li>
        <li>Third-party services, embedded authentication or payment interfaces may have accessibility behaviour outside INKSIGHT's direct control.</li>
      </ul>

      <h2>Alternative formats and support</h2>
      <p>If a tool, article or form creates a barrier, email <a href="mailto:contact@getinksight.co.uk">contact@getinksight.co.uk</a>. Include the page address, device or assistive technology and the task you were trying to complete. INKSIGHT will provide the information in a practical alternative format where possible.</p>

      <h2>Technical approach</h2>
      <p>The public website uses semantic HTML, React and progressive browser features. Core information remains text-based and public pages do not require account creation.</p>

      <h2>Review</h2>
      <p>This statement will be reviewed as new tools and content formats are added.</p>
    </LegalPage>
  );
}
