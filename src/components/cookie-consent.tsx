import { useEffect, useState } from "react";
import { readConsent, saveConsent } from "@/lib/consent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const current = readConsent();
    if (!current) setOpen(true);
    else {
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    }
    const reopen = () => {
      const saved = readConsent();
      setAnalytics(Boolean(saved?.analytics));
      setMarketing(Boolean(saved?.marketing));
      setCustomising(true);
      setOpen(true);
    };
    window.addEventListener("inksight:open-consent", reopen);
    return () => window.removeEventListener("inksight:open-consent", reopen);
  }, []);

  function commit(nextAnalytics: boolean, nextMarketing: boolean) {
    saveConsent({ analytics: nextAnalytics, marketing: nextMarketing });
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setOpen(false);
    setCustomising(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-ink p-5 shadow-2xl shadow-black/50 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="cookie-title" className="font-display text-xl font-black text-ice">
              Your privacy choices
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Essential storage keeps the website working. Optional marketing technology helps us
              measure campaign journeys. It stays off unless you choose it.
            </p>
          </div>
          <a
            href="/cookies"
            className="shrink-0 text-sm font-semibold text-mint hover:text-mint-soft"
          >
            Cookie details
          </a>
        </div>

        {customising ? (
          <div className="mt-5 space-y-3 border-y border-border py-5">
            <ConsentRow
              title="Essential"
              description="Required for security, saved form progress and consent preferences."
              checked
              disabled
              onChange={() => undefined}
            />
            <ConsentRow
              title="Analytics"
              description="Reserved for privacy-conscious site measurement. No analytics provider is currently active."
              checked={analytics}
              onChange={setAnalytics}
            />
            <ConsentRow
              title="Marketing"
              description="Allows Meta Pixel to load after consent and record page and conversion events."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => commit(true, true)}
            className="rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep hover:bg-mint-soft"
          >
            Accept optional cookies
          </button>
          <button
            type="button"
            onClick={() => commit(false, false)}
            className="rounded-full border border-border px-5 py-3 text-sm font-bold text-ice hover:border-mint hover:text-mint"
          >
            Reject optional cookies
          </button>
          {customising ? (
            <button
              type="button"
              onClick={() => commit(analytics, marketing)}
              className="rounded-full border border-mint px-5 py-3 text-sm font-bold text-mint hover:bg-mint/10"
            >
              Save preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCustomising(true)}
              className="rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground hover:text-mint"
            >
              Manage preferences
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsentRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-5 rounded-xl bg-ink-deep p-4">
      <span>
        <span className="block font-bold text-ice">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--mint)]"
      />
    </label>
  );
}
