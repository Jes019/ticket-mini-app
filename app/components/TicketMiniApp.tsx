
"use client";

import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_PROPERTY_SUGGESTIONS = [
  "Shoreline – Block A",
  "Shoreline – Block B",
  "Shoreline – Block C",
];
const CATEGORIES = [
  { id: "access", label: "Access / Lock / Code" },
  { id: "wifi", label: "Wi‑Fi / Internet" },
  { id: "hvac", label: "AC / Heating" },
  { id: "plumbing", label: "Plumbing / Leak" },
  { id: "electrical", label: "Electrical / Power" },
  { id: "appliance", label: "Appliance" },
  { id: "cleaning", label: "Cleaning" },
  { id: "noise", label: "Noise / Nuisance" },
  { id: "safety", label: "Safety" },
  { id: "other", label: "Other" },
];
const PRIORITIES = [
  { id: "P3", label: "Normal" },
  { id: "P2", label: "Urgent" },
  { id: "P1", label: "Emergency" },
];

const STR:any = {
  en: {
    title: "Report an issue",
    sub: "We’ll create a ticket and update you via WhatsApp/SMS.",
    property: "Property",
    unit: "Unit",
    name: "Your name",
    phone: "WhatsApp / Phone",
    email: "Email (optional)",
    category: "Category",
    priority: "Priority",
    describe: "Describe the issue",
    media: "Photo/Video link (optional)",
    consent: "I consent to be contacted about this ticket.",
    submit: "Create ticket",
    openChat: "Open WhatsApp chat",
    created: (id: string) => `✅ Ticket ${id} created`,
    createdSub: "We’ll message you with updates.",
    safety: "If you're in immediate danger, call local emergency services.",
    fetching: "Fetching units…",
    unitsNone: "No units found for this property.",
  },
  mt: {
    title: "Irrapporta problema",
    sub: "Se noħolqu biljett u nżommuk aġġornat fuq WhatsApp/SMS.",
    property: "Proprjetà",
    unit: "Unità",
    name: "Ismek",
    phone: "WhatsApp / Telefon",
    email: "Email (mhux obbligatorju)",
    category: "Kategorija",
    priority: "Prijorità",
    describe: "Ippreżenta l-problema",
    media: "Rabta ta’ ritratt/vidjo (mhux obbl.)",
    consent: "Nikkunsenti li tikkuntattjawni dwar dan il-biljett.",
    submit: "Oħloq biljett",
    openChat: "Iftaħ WhatsApp",
    created: (id: string) => `✅ Biljett ${id} inħoloq`,
    createdSub: "Nibagħtulek aġġornamenti.",
    safety: "Jekk hemm emerġenza ċempel lis-servizzi tal-emerġenza.",
    fetching: "Qed inġibu l-unitajiet…",
    unitsNone: "Ma nstabux unitajiet għal din il-proprjetà.",
  },
};

export default function TicketMiniApp() {
  const [lang, setLang] = useState("en");
  const t = useMemo(() => STR[lang] || STR.en, [lang]);

  const [property, setProperty] = useState("");
  const [unit, setUnit] = useState("");
  const [units, setUnits] = useState<string[] | null>(null);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("wifi");
  const [priority, setPriority] = useState("P3");
  const [details, setDetails] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [consent, setConsent] = useState(false);

  const [loadingUnits, setLoadingUnits] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!property) { setUnits(null); return; }
    const ctrl = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoadingUnits(true);
        setError(null);
        const res = await fetch(`/api/units?property=${encodeURIComponent(property)}`, { method: "GET" });
        const json = await res.json();
        if (json && json.ok) {
          const arr = Array.isArray(json.items) ? json.items.map((x:any) => x.value || x.label || String(x)) : [];
          setUnits(arr.length ? arr : []);
        } else {
          setUnits([]);
        }
      } catch (e:any) {
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    }, 350);
    return () => { clearTimeout(timeout); ctrl.abort(); };
  }, [property]);

  const valid = useMemo(() => {
    const phoneOk = /^\+?[0-9]{7,15}$/.test(phone.trim());
    return property && unit && guestName && phoneOk && details.trim().length >= 6 && consent;
  }, [property, unit, guestName, phone, details, consent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        property: property,
        unit: unit,
        guest_name: guestName,
        whatsapp: phone,
        email: email,
        intent: category,
        issue: category,
        details: details,
        media_urls: mediaUrl ? [mediaUrl] : [],
        conversation_id: `web-${Date.now()}`,
      };
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "failed");
      setTicketId(json.ticket_id || "");
    } catch (e:any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setProperty("");
    setUnit("");
    setUnits(null);
    setGuestName("");
    setPhone("");
    setEmail("");
    setCategory("wifi");
    setPriority("P3");
    setDetails("");
    setMediaUrl("");
    setConsent(false);
    setError(null);
    setTicketId(null);
  }

  const waLink = useMemo(() => {
    if (!ticketId || !phone) return null;
    const message = encodeURIComponent(`Hi, I just created ticket ${ticketId}.`);
    const n = phone.replace(/^\+/, "");
    return `https://wa.me/${n}?text=${message}`;
  }, [ticketId, phone]);

  const PriorityBanner = () => (
    priority === "P1" ? (
      <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm">
        {t.safety}
      </div>
    ) : null
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <select
            className="rounded-lg border px-2 py-1 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="mt">MT</option>
          </select>
        </div>
        <p className="text-gray-600 mb-4">{t.sub}</p>

        {ticketId ? (
          <div className="rounded-2xl bg-white shadow p-5">
            <div className="text-lg font-medium">{t.created(ticketId)}</div>
            <div className="text-gray-600 mb-4">{t.createdSub}</div>
            <div className="flex flex-col sm:flex-row gap-2">
              {waLink && (
                <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border px-4 py-2">
                  {t.openChat}
                </a>
              )}
              <button onClick={resetForm} className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2">
                + {t.submit}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Property <span className="text-red-500">*</span></label>
                <input
                  list="prop-list"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  placeholder="e.g., Shoreline – Block B"
                  className="w-full rounded-xl border px-3 py-2"
                  required
                />
                <datalist id="prop-list">
                  {DEFAULT_PROPERTY_SUGGESTIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit <span className="text-red-500">*</span></label>
                {loadingUnits ? (
                  <div className="text-sm text-gray-500 py-2">{t.fetching}</div>
                ) : units ? (
                  units.length ? (
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2"
                      required
                    >
                      <option value="" disabled>
                        -- select --
                      </option>
                      {units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder={t.unitsNone}
                      className="w-full rounded-xl border px-3 py-2"
                      required
                    />
                  )
                ) : (
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., B‑214"
                    className="w-full rounded-xl border px-3 py-2"
                    required
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Your name <span className="text-red-500">*</span></label>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp / Phone <span className="text-red-500">*</span></label>
                <input
                  inputMode="tel"
                  placeholder="+3567…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                  required
                />
                {!/^\+?[0-9]{7,15}$/.test(phone || "") && (
                  <div className="text-xs text-red-600 mt-1">Use international format, e.g. +3567…</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="self-end">
                <PriorityBanner />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Describe the issue <span className="text-red-500">*</span></label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="What happened? Where exactly? Any error codes?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Photo/Video link (optional)</label>
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://… (Drive/Dropbox/Imgur)"
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div className="flex items-start gap-2">
              <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
              <label htmlFor="consent" className="text-sm">I consent to be contacted about this ticket.</label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{String(error)}</div>
            )}

            <button
              type="submit"
              disabled={!valid || submitting}
              className={`w-full rounded-xl px-4 py-3 text-white ${valid ? "bg-black" : "bg-gray-400"}`}
            >
              {submitting ? "…" : t.submit}
            </button>

            <div className="text-xs text-gray-500 text-center">By submitting, you agree to our house rules and privacy policy.</div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Tip: Add this page as a Home Screen app. You can also place a QR code at the lobby.
        </div>
      </div>
    </div>
  );
}
