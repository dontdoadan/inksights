import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

const CANONICAL_URL = "https://getinksight.co.uk/privacy";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Notice | INKSIGHT" },
      { name: "description", content: "How INKSIGHT collects, uses, stores and protects personal information submitted through the website." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal and privacy"
      title="Privacy Notice"
      description="This notice explains how INKSIGHT handles personal information submitted through the public website, assessments, contact forms and business relationship."
    >
      <h2>Who controls the information?</h2>
      <p>INKSIGHT is the controller for personal information collected directly through this website. Privacy questions and rights requests can be sent to <a href="mailto:contact@getinksight.co.uk">contact@getinksight.co.uk</a>.</p>

      <h2>Information we may collect</h2>
      <ul>
        <li>Contact details such as name, email address and telephone number.</li>
        <li>Studio information such as business name, location, website, team size and commercial stage.</li>
        <li>Assessment answers, stated problems, desired outcomes, implementation readiness and booking preferences.</li>
        <li>Messages, support requests, feedback and records of business communication.</li>
        <li>Technical and attribution information such as page path, referrer, campaign parameters, browser information and security fingerprints.</li>
        <li>Consent choices and the date those choices were recorded.</li>
      </ul>

      <h2>Why we use it</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Purpose</th><th>Typical lawful basis</th></tr></thead>
          <tbody>
            <tr><td>Provide an assessment, respond to an enquiry or take requested pre-contract steps.</td><td>Contract or steps requested before entering a contract.</td></tr>
            <tr><td>Operate, secure, diagnose and improve the website and lead-routing systems.</td><td>Legitimate interests in running a secure and effective service.</td></tr>
            <tr><td>Maintain business records, prevent duplicate submissions and manage delivery.</td><td>Legitimate interests and legal obligations where applicable.</td></tr>
            <tr><td>Send optional marketing or load marketing tracking technologies.</td><td>Consent, which can be withdrawn.</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Automated qualification</h2>
      <p>The Studio Growth Check uses assessment answers to calculate scores such as urgency, readiness and commercial fit. The result routes people to a relevant offer, booking request or nurture path. It does not make a legal, employment, credit, medical or similarly significant decision.</p>

      <h2>Who may process the information?</h2>
      <p>INKSIGHT uses service providers for website hosting, databases, CRM, source control, automation, email, calendar and advertising measurement. Current systems may include Supabase, GitHub, HubSpot, Google services, n8n and Meta where enabled. Providers receive only the information needed for their role and are subject to their own security and data-processing terms.</p>

      <h2>International transfers</h2>
      <p>Some technology providers may process information outside the United Kingdom. Where this occurs, INKSIGHT will rely on an appropriate transfer mechanism or the provider's applicable safeguards.</p>

      <h2>How long information is retained</h2>
      <p>Information is kept only while it is needed for the stated purpose, an active relationship, security, record keeping or a legal requirement. Unconverted enquiries and assessment records are reviewed periodically and would normally be deleted or anonymised when they are no longer commercially or operationally relevant. A longer period may apply where a contract, dispute, consent record or legal obligation requires it.</p>

      <h2>Security</h2>
      <p>Public forms submit through server-side validation and rate limiting. Sensitive service credentials are not placed in the browser. Database tables use access controls and row-level security where appropriate. No system is completely risk-free, but access is restricted and changes are version controlled.</p>

      <h2>Your rights</h2>
      <p>Depending on the circumstances, UK data-protection law may give you rights to access, correct, delete or restrict personal information; object to certain processing; receive portable information; and withdraw consent. You can make a request by emailing <a href="mailto:contact@getinksight.co.uk">contact@getinksight.co.uk</a>.</p>
      <p>You may also complain to the Information Commissioner's Office if you believe your information has been handled unlawfully.</p>

      <h2>Marketing and advertisers</h2>
      <p>INKSIGHT does not sell personal information to advertisers. Meta Pixel remains disabled until marketing consent is selected. Changing cookie preferences does not affect essential website functions.</p>

      <h2>Changes to this notice</h2>
      <p>This notice may be updated as the service, providers or legal requirements change. The revision date at the top identifies the current version.</p>
    </LegalPage>
  );
}
