# PTO Connect - Complete PTO Management Platform

A comprehensive web application for Parent-Teacher Organizations (PTOs) to manage events, communications, fundraising, budgets, and member engagement.

## 🚀 Features

- **Multi-Tenant Architecture**: Secure organization isolation
- **User Management**: Role-based access control (Admin, Board, Committee, Volunteer, Parent, Teacher)
- **Event Management**: Create, manage, and track RSVP for school events
- **Communication Tools**: Email, SMS, and social media posting
- **Budget Tracking**: Income/expense management with receipt uploads
- **Fundraising**: Donation campaigns with Stripe integration
- **Teacher Requests**: Resource request and approval workflow
- **Document Management**: File sharing with role-based access
- **AI Integration**: Content generation and assistance
- **Subscription Management**: Stripe-powered billing system

## 🏗️ Architecture

### Frontend
- **React 18** with Vite for fast development
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **Supabase** for database and authentication
- **Stripe** for payment processing
- **OpenAI** for AI features
- **Twilio** for SMS
- **Nodemailer** for email

### Database
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)** for data isolation
- **Multi-tenant design** with organization-based access

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pto-connect
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd pto-connect-backend
   pnpm install

   # Frontend
   cd ../pto-connect
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment templates
   cp pto-connect/.env.example pto-connect/.env
   cp pto-connect-backend/.env.example pto-connect-backend/.env
   
   # Update with your actual API keys
   ```

4. **Database Setup**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `database-setup-complete.sql`

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend (Port 3000)
   cd pto-connect-backend
   pnpm start

   # Terminal 2 - Frontend (Port 3001)
   cd pto-connect
   pnpm dev
   ```

6. **Test the Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Test Signup: http://localhost:3001/onboarding/simple-signup

## 📋 Required API Keys

### Supabase (Required)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (backend only)

### Stripe (For payments)
- `STRIPE_PUBLISHABLE_KEY`: Public key (frontend)
- `STRIPE_SECRET_KEY`: Secret key (backend)
- `STRIPE_WEBHOOK_SECRET`: Webhook secret

### OpenAI (For AI features)
- `OPENAI_API_KEY`: OpenAI API key

### Twilio (For SMS)
- `TWILIO_ACCOUNT_SID`: Account SID
- `TWILIO_AUTH_TOKEN`: Auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

### Meta/Facebook (For social posting)
- `META_ACCESS_TOKEN`: Access token
- `META_APP_ID`: App ID
- `META_APP_SECRET`: App secret

## 🗂️ Project Structure

```
pto-connect/
├── pto-connect/                 # Frontend React app
│   ├── src/
│   │   ├── components/          # Shared components
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── events/         # Event management
│   │   │   ├── communications/ # Messaging
│   │   │   ├── budgets/        # Budget tracking
│   │   │   └── ...
│   │   └── utils/              # Utilities
│   └── package.json
├── pto-connect-backend/         # Backend API
│   ├── routes/                  # API routes
│   │   ├── auth/               # Authentication
│   │   ├── event/              # Events
│   │   ├── user/               # User management
│   │   └── ...
│   └── package.json
├── pto-connect-public/          # Public marketing site
├── database-setup-complete.sql  # Database migration
└── WEEK1_SETUP_GUIDE.md        # Setup instructions
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based auth via Supabase
- **Role-Based Access**: Hierarchical permission system
- **Organization Isolation**: Multi-tenant data separation
- **Environment Variables**: Secure API key management

## 🧪 Testing

### Test Organization Creation
1. Visit: http://localhost:3001/onboarding/simple-signup
2. Fill in organization details
3. Create admin account
4. Verify signup code generation

### Test Multi-Tenant Isolation
1. Create multiple test organizations
2. Verify data isolation between orgs
3. Test role-based access controls

## 📚 Documentation

- `WEEK1_SETUP_GUIDE.md` - Comprehensive setup instructions
- `database-setup-complete.sql` - Complete database schema
- `CRITICAL_ISSUES_AND_FIXES.md` - Architecture decisions and fixes

## 🚀 Deployment

### Frontend (Vercel/Netlify)
- Build command: `pnpm build`
- Output directory: `dist`
- Environment variables: Copy from `.env.example`

### Backend (Render/Railway/Heroku)
- Start command: `pnpm start`
- Environment variables: Copy from `.env.example`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For setup assistance or bug reports, please create an issue in the repository.

---

**Built with ❤️ for PTO communities everywhere**
