"use client";
import { use, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

export default function DashboardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [bill, setBill] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/bill/${encodeURIComponent(token)}`;
  }, [token]);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const b = await api.getBillByToken(token);
        if (!cancel) setBill(b);
        if (typeof window !== "undefined") {
          setReceiptUrl(`${window.location.origin}/bill/${encodeURIComponent(token)}/receipt`);
        }
      } catch (e: any) {
        if (!cancel) setError(e.message || "Failed to load bill");
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => {
      cancel = true;
      clearInterval(id);
    };
  }, [token]);

  const totals = useMemo(() => {
    const parts = bill?.participants || [];
    return {
      total: parts.length,
      paid: parts.filter((p: any) => p.status === "paid").length,
      pending: parts.filter((p: any) => p.status === "pending").length,
      failed: parts.filter((p: any) => p.status === "failed").length,
    };
  }, [bill]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{bill ? bill.name : "Loading..."}</h1>
        <div className="text-sm text-gray-500">Total: Ksh {bill?.total_amount ?? "—"}</div>
      </div>

      <div className="flex items-center gap-2">
        <input readOnly className="flex-1 border rounded px-3 py-2" value={shareUrl} />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={copyLink}>{copied ? "Copied" : "Copy"}</button>
        {receiptUrl && (
          <a className="px-3 py-2 rounded border" href={receiptUrl} target="_blank">Receipt</a>
        )}
        <a className="px-3 py-2 rounded border" href={`https://wa.me/?text=${encodeURIComponent(`PesaSplit: ${bill?.name ?? ''} (Ksh ${bill?.total_amount ?? ''}). Pay here: ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="border rounded p-3">
          <div className="text-2xl font-semibold">{totals.paid}</div>
          <div className="text-xs text-gray-500">Paid</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-2xl font-semibold">{totals.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-2xl font-semibold">{totals.failed}</div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Expected</th>
              <th className="text-left p-2">Paid</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bill?.participants?.map((p: any, idx: number) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="p-2 font-mono">{p.phone_number}</td>
                <td className="p-2">Ksh {p.expected_amount}</td>
                <td className="p-2">Ksh {p.paid_amount}</td>
                <td className="p-2 capitalize">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


