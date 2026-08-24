# INKCARE Pilot Studio Landing Page — Conversion Specification

Status: **Implementation-ready**  
Owner: **Codex / Engineering**  
Commercial owner: **Dan / INKCARE**  
Canonical implementation issue: **#1**

## 1. Objective

Convert qualified UK tattoo studio owners into applications for the first INKCARE pilot cohort.

Primary conversion: completed pilot application.  
Secondary conversion: CTA engagement and form initiation.

## 2. Core positioning

INKCARE is a revenue growth, operations and performance platform for tattoo studios. It identifies leakage across the full client journey, then helps studios implement measurable improvements to conversion, retention, rebooking, capacity, client experience, reporting and automation.

Aftercare and retail are supporting revenue levers, not the primary positioning.

## 3. Ideal applicant

Prioritise studios that are:

- Based in the UK
- Established and actively trading
- Multi-artist, or operating with meaningful appointment volume
- Generating approximately £10,000+ monthly revenue
- Experiencing measurable friction in enquiries, booking conversion, cancellations, no-shows, rebooking, retention, reporting, retail or owner workload
- Willing to provide baseline operating data
- Able to implement agreed operational changes

## 4. Page architecture and final copy direction

### Hero

**Eyebrow:** INKCARE Pilot Studio Programme

**Headline:** Find the Revenue Your Tattoo Studio Is Already Losing

**Supporting copy:** INKCARE helps established tattoo studios identify and fix revenue, retention and operational leaks across the full client journey — from first enquiry to repeat booking.

**Primary CTA:** Apply for the Pilot Programme

**Secondary CTA:** See What We Assess

**Trust note:** Limited to a small number of UK tattoo studios.

### Problem section

**Headline:** Growth problems rarely start with a lack of demand

**Body:** Many studios already have enough attention, enquiries and client demand. Revenue is often lost inside the operating system: delayed replies, inconsistent deposits, avoidable cancellations, weak rebooking, underused capacity and limited performance visibility.

**Problem cards:**

- Enquiries that never become bookings
- Slow or inconsistent follow-up
- Cancellations and no-shows
- Weak rebooking and retention
- Inconsistent artist utilisation
- Limited revenue and KPI visibility
- Owner-dependent administration
- Underdeveloped aftercare and retail systems

### Assessment section

**Headline:** We assess the full studio revenue system

Assess:

1. Enquiry handling and response time
2. Booking conversion
3. Deposit and payment processes
4. Cancellations and no-shows
5. Artist capacity and productivity
6. Pricing and average session value
7. Retention and rebooking
8. Aftercare and retail
9. Reviews and referrals
10. CRM and automation
11. Reporting and revenue attribution

### Pilot delivery section

**Headline:** A structured route from diagnosis to measurable improvement

Framework:

**Audit → Diagnose → Design → Deploy → Measure → Optimise → Scale**

Selected studios receive:

- Full client-journey and operational audit
- Revenue leak and bottleneck analysis
- Prioritised implementation roadmap
- Systems and automation recommendations
- KPI and performance tracking structure
- Close implementation support during the pilot

### Qualification section

**Headline:** Built for studios ready to measure and improve

**This is for:**

- Established UK tattoo studios
- Owners prepared to share baseline data
- Teams able to implement agreed changes
- Studios seeking measurable growth and operational improvement

**This is not for:**

- Studios only seeking generic social-media management
- Businesses unwilling to measure performance
- Studios looking only for wholesale aftercare
- Owners seeking guaranteed results without operational participation

### Founder credibility section

**Headline:** Built from real tattoo-studio operating experience

**Copy:** INKCARE is being developed by Dan, drawing on more than seven years of tattoo-industry experience across tattooing, studio management and business operations. The pilot is intentionally transparent: the aim is to validate the operating model with a small number of suitable studios, document measurable outcomes and build the systems around real implementation evidence.

Do not imply validated results, established case studies or guaranteed uplift until evidence exists.

### Final CTA

**Headline:** Ready to Find the Gaps in Your Studio's Revenue System?

**Supporting copy:** Apply for the pilot programme. Suitable studios will be reviewed against operational fit, implementation readiness and measurable improvement potential.

**CTA:** Apply for the Pilot Programme

## 5. Application form

Required fields:

- Full name
- Studio name
- Email
- Phone
- Location
- Website
- Instagram
- Number of artists
- Number of locations
- Approximate monthly revenue band
- Current booking or CRM system
- Biggest operational challenge
- Consent and privacy acknowledgement

Recommended revenue bands:

- Under £5,000
- £5,000–£9,999
- £10,000–£19,999
- £20,000–£39,999
- £40,000+
- Prefer not to say

Recommended challenge options:

- Enquiry conversion
- Cancellations and no-shows
- Rebooking and retention
- Artist capacity or performance
- Pricing and average spend
- Reporting and data visibility
- Owner workload and administration
- Retail or aftercare revenue
- Multiple issues

## 6. Internal qualification score

Score each application out of 100. This is an internal triage aid, not a promise of acceptance.

| Dimension | Weight | Scoring principle |
|---|---:|---|
| Revenue and transaction volume | 20 | Higher baseline creates clearer measurement potential |
| Multi-artist operational complexity | 15 | More artists and locations increase system value |
| Problem severity | 20 | Clear, measurable leakage receives a higher score |
| Data availability | 15 | Existing CRM, booking, payments and reporting improve attribution |
| Implementation readiness | 20 | Willingness and capacity to execute changes |
| Strategic proof value | 10 | Strong fit for a credible, reusable case study |

Triage bands:

- **75–100:** Priority discovery call
- **55–74:** Review manually; request missing evidence
- **Below 55:** Nurture or redirect to a lighter diagnostic offer

## 7. Tracking specification

Prepare the following events:

- `pilot_page_view`
- `pilot_cta_click`
- `pilot_form_start`
- `pilot_form_submit`
- `pilot_form_error`

Recommended event properties:

- CTA location
- Device category
- Referrer
- Campaign source
- Campaign medium
- Campaign name
- Revenue band
- Artist-count band
- Location count
- Primary challenge

Do not include unnecessary personal data in analytics payloads.

## 8. KPI framework

Primary KPI:

- Qualified pilot applications per week

Supporting KPIs:

- Landing-page conversion rate
- CTA click-through rate
- Form-start rate
- Form-completion rate
- Qualified-application rate
- Discovery-call booking rate
- Pilot acceptance rate
- Cost per qualified application when paid traffic begins

Initial diagnostic targets should be treated as hypotheses until traffic volume is sufficient. Do not present unvalidated benchmarks as established performance standards.

## 9. Technical requirements

- Dedicated route: `/pilot-studios`
- Mobile-first responsive layout
- Semantic headings and labelled form controls
- Keyboard-accessible interaction
- Clear validation and error states
- Minimal animation
- Fast-loading assets
- Existing Command Centre must remain unaffected
- Form submissions must use a verified backend path
- If persistence is unavailable, use a typed integration boundary and document the missing dependency; do not simulate successful storage
- No production deployment without explicit approval

## 10. Acceptance criteria

- Route renders locally without errors
- All CTA links scroll or navigate correctly
- Form validates required fields
- Submission success is shown only after verified persistence
- Analytics hooks are present and documented
- Responsive behaviour is checked across mobile, tablet and desktop
- No fabricated testimonials, logos, performance statistics or case studies
- Basic accessibility checks pass
- README or implementation notes are updated
- Pull request includes preview evidence and unresolved dependencies

## 11. Commercial outcome

Expected outcome: create a measurable, repeatable acquisition asset for recruiting pilot studios and validating the INKCARE offer.

Primary KPI: qualified pilot applications generated.

Secondary asset value: the qualification model, form structure, messaging hierarchy and tracking specification can be reused for future diagnostic, audit and studio-growth campaigns.

## 12. Remaining dependencies

- Codex implementation in the repository
- Verified form-storage destination
- Privacy-policy URL
- Final campaign tracking parameters
- Review and production-deployment approval

## 13. Next best action

Codex should implement issue #1 against this specification, create a pull request, run local build and lint checks, and attach preview evidence. Production deployment remains blocked pending explicit approval.
