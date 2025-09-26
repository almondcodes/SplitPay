"use client";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getReceiptByToken(token)
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e.message || "Failed to load receipt"));
    return () => {
      mounted = false;
    };
  }, [token]);

  function printPage() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Receipt</h1>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={printPage}>Print</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data && (
        <div className="space-y-4">
          <div>
            <div className="font-medium">{data.bill.name}</div>
            <div className="text-sm text-gray-600">Total: Ksh {data.bill.total_amount}</div>
            <div className="text-xs text-gray-500">Token: {data.bill.share_token}</div>
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
                {data.participants.map((p: any, idx: number) => (
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
          <div className="flex items-center justify-end gap-6 text-sm">
            <div>Expected: <span className="font-medium">Ksh {data.totals.expected}</span></div>
            <div>Paid: <span className="font-medium">Ksh {data.totals.paid}</span></div>
            <div>Outstanding: <span className="font-medium">Ksh {data.totals.outstanding}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}


