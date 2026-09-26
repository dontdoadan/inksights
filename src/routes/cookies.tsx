import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

const CANONICAL_URL = "https://getinksights.co.uk/cookies";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
  head: () => ({
    meta: [
      { title: "Cookie Notice | INKSIGHTS" },
      { name: "description", content: "How INKSIGHTS uses essential browser storage, Google Analytics 4 and optional marketing tracking." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal and privacy"
      title="Cookie and Tracking Notice"
      description="Optional tracking is disabled by default. This page explains the storage and technologies used by the website and how to change your choice."
    >
      <h2>What are storage and access technologies?</h2>
      <p>Websites can store or access information on a device using cookies, local storage, pixels, scripts and similar technologies. Some are required for the service to work; others measure or advertise.</p>

      <h2>Current categories</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Category</th><th>Current use</th><th>Choice</th></tr></thead>
          <tbody>
            <tr><td><strong>Essential</strong></td><td>Stores the cookie preference, supports security, authentication where used and may preserve form progress.</td><td>Always active because the requested service cannot operate reliably without it.</td></tr>
            <tr><td><strong>Analytics</strong></td><td>Loads Google Analytics 4 (measurement ID <code>G-V7SQ9SPYMH</code>) after analytics consent and also permits first-party measurement of page views and key conversion events.</td><td>Optional and off until accepted.</td></tr>
            <tr><td><strong>Marketing</strong></td><td>Loads Meta Pixel after consent to record page views and selected conversion events such as assessment completion or booking request.</td><td>Optional and off until accepted.</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Essential browser storage</h2>
      <p>The key <code>inksight-consent-v1</code> stores whether analytics and marketing technologies were accepted or rejected, together with the date of the choice. Supabase may also use essential authentication storage for signed-in dashboard users.</p>

      <h2>Google Analytics 4</h2>
      <p>Google Analytics 4 is configured for the INKSIGHTS website stream at <code>https://getinksights.co.uk</code> using measurement ID <code>G-V7SQ9SPYMH</code>. The Google tag is loaded only after analytics consent is granted.</p>
      <p>When enabled, the site can send page-view and interaction events such as diagnostic, contact and checkout events. The implementation does not intentionally send form contents, email addresses, phone numbers or other direct contact details to Google Analytics.</p>
      <p>If analytics consent is withdrawn, INKSIGHTS updates the Google consent state to deny analytics storage for subsequent measurement.</p>

      <h2>Meta Pixel</h2>
      <p>Meta Pixel is not inserted into the page source until marketing consent is selected. Once enabled, it may process browser and event information to measure the journey from a Meta advertisement or social interaction to a website action.</p>
      <p>Rejecting marketing cookies prevents the pixel from loading through the INKSIGHTS consent system. Previously transmitted information cannot be recalled from Meta by changing the local preference.</p>

      <h2>Changing or withdrawing consent</h2>
      <p>Select “Change cookie preferences” in the website footer. You can reject optional technologies or save a different preference at any time.</p>
      <p>You can also clear site data through your browser. Clearing it removes the saved preference and the website will ask again.</p>

      <h2>Browser controls</h2>
      <p>Browsers allow you to block or remove cookies and local storage. Blocking essential storage may prevent saved progress, login or preference features from working correctly.</p>

      <h2>Updates</h2>
      <p>This notice should be updated before any additional non-essential provider is activated. The consent interface is intended to reflect the technologies currently available.</p>

      <h2>Questions</h2>
      <p>Email <a href="mailto:contact@getinksight.co.uk">contact@getinksight.co.uk</a> with questions about tracking or consent records.</p>
    </LegalPage>
  );
}
