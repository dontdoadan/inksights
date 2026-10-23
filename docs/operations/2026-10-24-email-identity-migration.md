# INKSIGHTS — Email identity migration (2026-10-24)

Status: **REVIEW / PUBLIC WEBSITE CHANGES STAGED**. Do not treat proposed account settings as completed.

## Approved target addresses

| Address | Intended role | Publication status |
|---|---|---|
| `contact@getinksights.co.uk` | General, support, privacy and website contact | Staged in website PR |
| `commercial@getinksights.co.uk` | Sales, proposals and service enquiries | Staged in website PR |
| `intelligence@getinksights.co.uk` | Research, reports and industry intelligence | Staged in website PR |
| `daniel@getinksights.co.uk` | Founder/individual professional correspondence | Staged in website PR |

The existing contact form / CRM integration remains the preferred route for secure submissions and canonical lead records.

## Findings from connected-account readbacks

- **Website code:** The production branch contained an obsolete `dontdoadan@icloud.com` contact fallback and `contact@getinksight.co.uk` (missing the final "s" in inksights) on two public legal/help pages. All are corrected on this PR branch. Contact page and footer show the four new roles in a way that does not change the visual system.
- **HubSpot:** The current authenticated INKSIGHTS owner/user email remains `dontdoadan@icloud.com`. The connector reports USER write as NOT_AVAILABLE. Change only through an authorised HubSpot account settings flow and test login/notifications before retiring old address.
- **Stripe:** Live INKSIGHTS account email remains `dontdoadan@icloud.com`; public `business_profile.support_email` is currently null. Do not change the account's login/recovery email without verification and controlled account-access approval. Add `contact@getinksights.co.uk` to public support details when inbound receipt is confirmed.
- **GitHub:** The authenticated user profile email is `dontdoadan@icloud.com`. The available connector does not expose user-profile email editing. Do not change commit identity/account login blindly; check authentication and notification routing first.
- **Connected Gmail:** The connected Gmail identity is a separate personal mailbox; it is not evidence that it owns the four getinksights.co.uk aliases.
- **Supabase:** The contact, audit, visibility, CRM sync and checkout webhook Edge Functions were inspected for literal emails. No hard-coded email addresses were found in the retrieved function definitions, but sender/notification configuration is not yet verified. Do not modify secrets or sending identities without checking authentication, domain verification, and current workflow.
- **Vercel:** PR branch preview built successfully. Production release must pass GitHub governance/CI and human approval. Hosting/project login, deployment integration and notification-address settings were not modified.
- **Other public profiles:** LinkedIn company page, Meta/Instagram/Facebook accounts, Google Business Profile and external directories are not confirmed editable through the available connected tools. Audit ownership, public contact fields and support links individually; do not substitute the personal account email without a scoped permissions check.

## Deliverability and account safety gate

1. Confirm MX routing and SPF, DKIM and DMARC for getinksights.co.uk with the active mail provider.
2. Confirm receipt from an external sender **separately for all four target addresses**; test replies and any alias forwarding. A forwarded 23 October message from `daniel@getinksights.co.uk` CC'd the other addresses, but does **not** independently prove each alias accepted mail.
3. Ensure the new aliases are monitored and appropriately routed, and decide which mailbox receives legal, privacy, billing, and payment failures.
4. Where relevant verify the email service / Stripe / HubSpot sending-domain configuration and automated Reply-To addresses. Do not silently replace authenticated senders with unverified addresses.
5. Preserve access to the previous owner login and recovery account until new login, verification emails and MFA recovery are confirmed.
6. Make a controlled change to each provider's **public contact/support profile** first, then separately handle account login and recovery identity with human approval.
7. Run send/receive, website contact-form, support escalation, audit post-payment and CRM notification tests. Never send real customer information to a test address.
8. Record final state, exact update date and verification evidence for each provider.

## Production release gate

- Visual identity, motion components, navigation and pricing must remain unchanged.
- Website PR CI, browser smoke, link and mailto QA must pass. Validate that every published address is spelled `@getinksights.co.uk`.
- Check the live footer, contact page, accessibility, cookies, terms, privacy, support, press and structured Organization ContactPoint after release.
- Per `AGENTS.md`, explicit human approval is required **immediately before** merging to main or releasing production-impacting changes.
