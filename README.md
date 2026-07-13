# SplitPay

Bill splitting for groups with M-Pesa STK Push payments. Django REST backend and Next.js frontend.

## Features

- **Bill Creation**: Create bills with multiple participants
- **Equal Split**: Automatically calculate equal shares
- **M-Pesa Integration**: Pay via M-Pesa STK Push
- **SMS Notifications**: OTP verification via SMS
- **Real-time Updates**: Track payment status in real-time
- **WhatsApp Sharing**: Share bills via WhatsApp

## Tech stack

### Backend
- Django 5.2.6
- Django REST Framework
- SQLite (development)
- M-Pesa Daraja API
- Africa's Talking SMS API
- Twilio SMS (fallback)

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React

## Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
```bash
# M-Pesa Daraja API
DARAJA_CONSUMER_KEY=your_consumer_key
DARAJA_CONSUMER_SECRET=your_consumer_secret
DARAJA_PASSKEY=your_passkey
DARAJA_SHORT_CODE=your_short_code
DARAJA_BASE_URL=https://sandbox.safaricom.co.ke
DARAJA_CALLBACK_URL=your_callback_url

# SMS Configuration
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_api_key

# Twilio (fallback)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=your_twilio_number
```

## API Endpoints

- `POST /api/otp/send/` - Send OTP
- `POST /api/otp/verify/` - Verify OTP
- `POST /api/bills/create/` - Create bill
- `GET /api/bills/by-token/{token}/` - Get bill by token
- `POST /api/payments/initiate-stk/` - Initiate STK push
- `POST /api/payments/daraja/callback/` - M-Pesa callback

## Development

### Branching Strategy

- `main` - Production branch
- `develop` - Development branch (default for feature branches)
- `feature/*` - Feature branches (checkout from develop)
- `hotfix/*` - Hotfix branches (checkout from main)

### Creating Feature Branches

```bash
# Switch to develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on feature, commit changes
git add .
git commit -m "Add your feature"

# Push feature branch
git push origin feature/your-feature-name

# Create pull request to develop
```

## License

MIT License
