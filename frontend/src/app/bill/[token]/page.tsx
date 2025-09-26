"use client";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BillPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [bill, setBill] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [myShare, setMyShare] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getBillByToken(token)
      .then((b) => mounted && setBill(b))
      .catch((e) => mounted && setMessage(e.message || "Failed to load bill"));
    return () => {
      mounted = false;
    };
  }, [token]);

  async function sendOtp() {
    setMessage(null);
    try {
      const r = await api.sendOtp(phone);
      setOtpSent(true);
      if (r.dev_code) setMessage(`Dev OTP: ${r.dev_code}`);
    } catch (e: any) {
      setMessage(e.message || "Failed to send OTP");
    }
  }

  async function verifyOtp() {
    setMessage(null);
    try {
      const r = await api.verifyOtp(phone, code);
      setSessionToken(r.token);
      setMessage("Verified. You can now pay.");
      try {
        const share = await api.getMyShare(token, phone);
        setMyShare(share.expected_amount);
      } catch {}
    } catch (e: any) {
      setMessage(e.message || "Failed to verify OTP");
    }
  }

  async function payNow() {
    if (!sessionToken) return;
    setPaying(true);
    setMessage(null);
    try {
      const r = await api.initiateStk({ phone_number: phone, bill_id: String(bill.id) });
      setMessage("STK initiated. Check your phone.");
    } catch (e: any) {
      setMessage(e.message || "Failed to initiate STK");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">{bill ? bill.name : 'Loading bill...'}</h1>
      {bill && (
        <div className="text-sm text-gray-600">Total: Ksh {bill.total_amount}</div>
      )}
      {myShare !== null && (
        <div className="text-sm">Your share: <span className="font-medium">Ksh {myShare}</span></div>
      )}
      <div className="space-y-2">
        <label className="block text-sm">Your phone number</label>
        <input className="w-full border rounded px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0712345678" />
        {!otpSent ? (
          <button className="w-full bg-black text-white rounded py-2" onClick={sendOtp}>Send OTP</button>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm">Enter OTP</label>
            <input className="w-full border rounded px-3 py-2" value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" />
            <button className="w-full bg-black text-white rounded py-2" onClick={verifyOtp}>Verify</button>
          </div>
        )}
      </div>
      <button disabled={!sessionToken || !bill || paying} className="w-full bg-green-600 text-white rounded py-2 disabled:opacity-50" onClick={payNow}>
        {paying ? "Initiating..." : "Pay Now"}
      </button>
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
}


