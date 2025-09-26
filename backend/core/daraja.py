from base64 import b64encode
import datetime
import json
import requests


class DarajaClient:
	def __init__(self, base_url: str, consumer_key: str, consumer_secret: str, short_code: str, passkey: str):
		self.base_url = base_url.rstrip("/")
		self.consumer_key = consumer_key
		self.consumer_secret = consumer_secret
		self.short_code = short_code
		self.passkey = passkey
		self._token = None

	def _auth_header(self) -> dict:
		if not self._token:
			self._token = self._get_oauth_token()
		return {"Authorization": f"Bearer {self._token}", "Content-Type": "application/json"}

	def _get_oauth_token(self) -> str:
		print(f"DEBUG: Getting OAuth token with key: {self.consumer_key[:10]}...")
		resp = requests.get(
			f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
			auth=(self.consumer_key, self.consumer_secret),
			timeout=15,
		)
		print(f"DEBUG: OAuth response status: {resp.status_code}")
		print(f"DEBUG: OAuth response: {resp.text}")
		resp.raise_for_status()
		return resp.json()["access_token"]

	def stk_push(self, phone_number: str, amount: int, account_ref: str, callback_url: str):
		# Ensure MSISDN is in 2547XXXXXXXX format (no leading '+')
		msisdn = phone_number.lstrip('+') if phone_number.startswith('+') else phone_number
		# Timestamp format YYYYMMDDHHMMSS
		timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
		password_raw = f"{self.short_code}{self.passkey}{timestamp}"
		password = b64encode(password_raw.encode()).decode()
		payload = {
			"BusinessShortCode": self.short_code,
			"Password": password,
			"Timestamp": timestamp,
			"TransactionType": "CustomerPayBillOnline",
			"Amount": amount,
			"PartyA": msisdn,
			"PartyB": self.short_code,
			"PhoneNumber": msisdn,
			"CallBackURL": callback_url,
			"AccountReference": account_ref,
			"TransactionDesc": account_ref,
		}
		print(f"DEBUG: STK payload: {json.dumps(payload, indent=2)}")
		print(f"DEBUG: STK URL: {self.base_url}/mpesa/stkpush/v1/processrequest")
		resp = requests.post(
			f"{self.base_url}/mpesa/stkpush/v1/processrequest",
			headers=self._auth_header(),
			data=json.dumps(payload),
			timeout=30,
		)
		print(f"DEBUG: STK response status: {resp.status_code}")
		print(f"DEBUG: STK response: {resp.text}")
		resp.raise_for_status()
		return resp.json()
