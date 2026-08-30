import { useState } from "react";

export function PartnerCTA() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="partner" className="relative">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <div className="relative rounded-3xl border border-mint/40 bg-gradient-to-br from-ink-elev to-ink p-10 md:p-16 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-mint/10 blur-3xl" />
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-widest text-mint">
              Partnership & Investment
            </div>
            <h2 className="mt-4 font-display font-black text-4xl md:text-6xl leading-[1.02] text-balance max-w-3xl">
              Partner with <span className="text-mint">INKSIGHT.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              We're building a studio growth platform powered by aftercare. If you're an investor,
              operator, or strategic partner — let's talk.
            </p>

            {submitted ? (
              <div className="mt-10 rounded-2xl border border-mint/40 bg-mint/10 p-8">
                <p className="font-display font-bold text-2xl text-mint">
                  Thanks — we'll be in touch.
                </p>
                <p className="mt-2 text-muted-foreground">
                  We review every enquiry personally and respond within 48 hours.
                </p>
              </div>
            ) : (
              <form
                className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <Input name="name" placeholder="Full name" required />
                <Input name="email" type="email" placeholder="you@company.com" required />
                <Input name="company" placeholder="Company" />
                <select
                  name="role"
                  required
                  defaultValue=""
                  className="rounded-full bg-ink-deep border border-border px-5 py-4 text-ice focus:outline-none focus:border-mint"
                >
                  <option value="" disabled>
                    I'm a…
                  </option>
                  <option value="investor">Investor</option>
                  <option value="studio">Studio Owner</option>
                  <option value="partner">Strategic Partner</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  name="message"
                  placeholder="A few words about why you're reaching out…"
                  rows={4}
                  className="sm:col-span-2 rounded-2xl bg-ink-deep border border-border px-5 py-4 text-ice placeholder:text-muted-foreground/60 focus:outline-none focus:border-mint resize-none"
                />
                <button
                  type="submit"
                  className="sm:col-span-2 justify-self-start inline-flex items-center gap-2 rounded-full bg-mint text-ink-deep px-7 py-4 font-bold hover:bg-mint-soft transition-colors"
                >
                  Send enquiry →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-full bg-ink-deep border border-border px-5 py-4 text-ice placeholder:text-muted-foreground/60 focus:outline-none focus:border-mint"
    />
  );
}
