"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [total, setTotal] = useState("");
  const [phones, setPhones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bill, setBill] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (!bill) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/bill/${encodeURIComponent(bill.share_token)}`;
  }, [bill]);

  const dashboardUrl = useMemo(() => {
    if (!bill) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/bill/${encodeURIComponent(bill.share_token)}/dashboard`;
  }, [bill]);

  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.createBill({
        name,
        organizer_phone: organizer,
        total_amount: total,
        participant_phones: phones,
      });
      setBill(data);
    } catch (err: any) {
      setError(err.message || "Failed to create bill");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">PesaSplit</h1>
        <p className="text-sm text-gray-500">Split bills. Pay via M-Pesa. Easy.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm">Bill name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Dinner at CJ's" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Organizer phone</label>
          <input className="w-full border rounded px-3 py-2" value={organizer} onChange={e=>setOrganizer(e.target.value)} placeholder="0712345678" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Total amount (Ksh)</label>
          <input className="w-full border rounded px-3 py-2" value={total} onChange={e=>setTotal(e.target.value)} placeholder="6000" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Participant phones (comma-separated)</label>
          <textarea className="w-full border rounded px-3 py-2" rows={2} value={phones} onChange={e=>setPhones(e.target.value)} placeholder="0711...,0700..." />
        </div>
        <button disabled={loading} className="w-full bg-black text-white rounded py-2">
          {loading ? "Creating..." : "Create bill"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      {bill && (
        <div className="border rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Bill created</h2>
            <span className="text-xs text-gray-500">Total: Ksh {bill.total_amount}</span>
          </div>
          <div className="space-y-1">
            <div className="text-sm">Share link</div>
            <div className="flex items-center gap-2">
              <input readOnly className="flex-1 border rounded px-3 py-2" value={shareUrl} />
              <button onClick={copyShareUrl} className="px-3 py-2 rounded bg-black text-white text-sm">{copied ? "Copied" : "Copy"}</button>
            </div>
          </div>
          <div className="flex gap-3">
            <Link className="text-blue-600 text-sm underline" href={`/bill/${encodeURIComponent(bill.share_token)}`}>
              Open bill page →
            </Link>
            <Link className="text-blue-600 text-sm underline" href={`/bill/${encodeURIComponent(bill.share_token)}/dashboard`}>
              Open dashboard →
            </Link>
            <a
              className="text-blue-600 text-sm underline"
              href={`https://wa.me/?text=${encodeURIComponent(`PesaSplit: ${bill.name} (Ksh ${bill.total_amount}). Pay your share: ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on WhatsApp →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
