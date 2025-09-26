const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/api" || "http://localhost:8000/api";

async function postForm<T>(path: string, data: Record<string, string>): Promise<T> {
	const body = new URLSearchParams(data);
	const res = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body,
		cache: "no-store",
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `Request failed: ${res.status}`);
	}
	return res.json();
}

export const api = {
	sendOtp: (phone_number: string) => postForm<{ ok: boolean; dev_code?: string }>("/otp/send", { phone_number }),
	verifyOtp: (phone_number: string, code: string) =>
		postForm<{ ok: boolean; token: string }>("/otp/verify", { phone_number, code }),
	createBill: (args: { name: string; organizer_phone: string; total_amount: string; participant_phones: string }) =>
		postForm("/bills", args),
	initiateStk: (args: { phone_number: string; bill_id: string }) => postForm("/payments/stk/initiate", args),
  getBillByToken: async (token: string) => {
    const res = await fetch(`${API_BASE}/bills/by-token/${encodeURIComponent(token)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getReceiptByToken: async (token: string) => {
    const res = await fetch(`${API_BASE}/bills/receipt/${encodeURIComponent(token)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getMyShare: async (token: string, phone_number: string) => {
    const u = new URL(`${API_BASE}/bills/my-share`);
    u.searchParams.set("token", token);
    u.searchParams.set("phone_number", phone_number);
    const res = await fetch(u.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};


