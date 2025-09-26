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
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getBillByToken(token)
      .then((b) => mounted && setBill(b))
      .catch((e) => mounted && setMessage(e.message || "Failed to load bill"));
    return () => {
      mounted = false;
    };
  }, [token]);

  // Countdown timer effect
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => {
        setOtpCountdown(otpCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (otpCountdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [otpCountdown, canResend]);

  async function sendOtp() {
    setMessage(null);
    setSendingOtp(true);
    try {
      const r = await api.sendOtp(phone);
      setOtpSent(true);
      setOtpCountdown(300); // 5 minutes countdown
      setCanResend(false);
      if (r.dev_code) setMessage(`Dev OTP: ${r.dev_code}`);
    } catch (e: any) {
      setMessage(e.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    setMessage(null);
    setVerifyingOtp(true);
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
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function resendOtp() {
    setMessage(null);
    setSendingOtp(true);
    try {
      const r = await api.sendOtp(phone);
      setOtpCountdown(300); // Reset countdown
      setCanResend(false);
      if (r.dev_code) setMessage(`Dev OTP: ${r.dev_code}`);
    } catch (e: any) {
      setMessage(e.message || "Failed to resend OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setCode(value);
  }

  async function payNow() {
    if (!sessionToken) return;
    setPaying(true);
    setMessage(null);
    try {
      const r = await api.initiateStk({ phone_number: phone, bill_id: String(bill.id) });
      setMessage("STK initiated. Check your phone.");
      setPaymentStatus("pending");
      // Start polling for payment status
      pollPaymentStatus();
    } catch (e: any) {
      setMessage(e.message || "Failed to initiate STK");
    } finally {
      setPaying(false);
    }
  }

  async function pollPaymentStatus() {
    if (!phone) return;
    const interval = setInterval(async () => {
      try {
        const share = await api.getMyShare(token, phone);
        if (share.status === "paid") {
          setPaymentStatus("paid");
          setMessage("Payment successful! 🎉");
          clearInterval(interval);
        } else if (share.status === "failed") {
          setPaymentStatus("failed");
          setMessage("Payment failed. Please try again.");
          clearInterval(interval);
        }
      } catch (e) {
        // Continue polling on error
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
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
      
      {paymentStatus === "paid" ? (
        <div className="space-y-4">
          <div className="text-center p-6 bg-green-50 border border-green-200 rounded">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-medium text-green-800">Payment Successful!</div>
            <div className="text-sm text-green-600">You've paid Ksh {myShare}</div>
          </div>
          <div className="flex gap-3">
            <a href={`/bill/${encodeURIComponent(token)}/dashboard`} className="flex-1 text-center bg-black text-white rounded py-2">
              View Dashboard
            </a>
            <a href={`/bill/${encodeURIComponent(token)}/receipt`} className="flex-1 text-center bg-gray-600 text-white rounded py-2">
              View Receipt
            </a>
          </div>
        </div>
      ) : paymentStatus === "failed" ? (
        <div className="space-y-4">
          <div className="text-center p-6 bg-red-50 border border-red-200 rounded">
            <div className="text-2xl mb-2">❌</div>
            <div className="font-medium text-red-800">Payment Failed</div>
            <div className="text-sm text-red-600">Please try again</div>
          </div>
          <button onClick={() => {setPaymentStatus(null); setMessage(null);}} className="w-full bg-green-600 text-white rounded py-2">
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm">Your phone number</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={phone} 
              onChange={e=>setPhone(e.target.value)} 
              placeholder="0712345678" 
              disabled={otpSent}
            />
            {!otpSent ? (
              <button 
                className="w-full bg-black text-white rounded py-2 disabled:opacity-50" 
                onClick={sendOtp}
                disabled={!phone.trim() || sendingOtp}
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>
            ) : !sessionToken ? (
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-600">
                  OTP sent to {phone}
                  {otpCountdown > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Expires in {formatTime(otpCountdown)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm">Enter 6-digit OTP</label>
                  <input 
                    className="w-full border rounded px-3 py-2 text-center text-lg tracking-widest" 
                    value={code} 
                    onChange={handleOtpChange} 
                    placeholder="123456"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 bg-black text-white rounded py-2 disabled:opacity-50" 
                      onClick={verifyOtp}
                      disabled={code.length !== 6 || verifyingOtp}
                    >
                      {verifyingOtp ? "Verifying..." : "Verify"}
                    </button>
                    <button 
                      className="px-3 py-2 border rounded text-sm disabled:opacity-50" 
                      onClick={resendOtp}
                      disabled={!canResend || sendingOtp}
                    >
                      {sendingOtp ? "..." : "Resend"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-green-600">
                ✅ Verified successfully
              </div>
            )}
          </div>
          
          {sessionToken && (
            <button 
              disabled={!sessionToken || !bill || paying} 
              className="w-full bg-green-600 text-white rounded py-2 disabled:opacity-50" 
              onClick={payNow}
            >
              {paying ? "Initiating..." : paymentStatus === "pending" ? "Processing..." : "Pay Now"}
            </button>
          )}
        </div>
      )}
      
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
}


