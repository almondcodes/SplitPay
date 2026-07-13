# Security Policy

## Reporting a vulnerability

Email [almond.ony@gmail.com](mailto:almond.ony@gmail.com) with details. Please do not open a public issue for security-sensitive reports.

## Secrets and credentials

- Never commit M-Pesa Daraja credentials, SMS provider keys, or production secrets.
- Use a local `.env` for secrets and keep it out of git (see `.gitignore`).
- Rotate any key that may have been exposed.
