# Saturn Email - Infinite Mailbox System

A Next.js-based infinite email system that allows users to generate unlimited email addresses and manage their emails through a web interface.

## Features

- 🚀 **Infinite Email Generation**: Create unlimited email addresses with various generation methods
- 📧 **Email Management**: View, search, and organize emails in a clean interface
- 🔄 **IMAP Integration**: Automatically fetch emails from your real mailbox
- 🎯 **Cloudflare Integration**: Use Cloudflare Email Routing for catch-all forwarding
- 🔍 **Search & Filter**: Powerful search across all emails and mailboxes
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🔐 **Secure**: Built with Supabase authentication and RLS policies

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Email**: IMAP (Gmail/other providers), Cloudflare Email Routing
- **Deployment**: Vercel with Cron Jobs

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd saturn-email
npm install
```

### 2. Environment Setup

Configure your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your_email@gmail.com
IMAP_PASSWORD=your_app_password
IMAP_TLS=true

# Domain Configuration
EMAIL_DOMAIN=mydomain.com

# Cron Job Security
CRON_SECRET=your_random_secret_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration script in `supabase/migrations/001_initial_schema.sql`
3. Configure authentication in Supabase dashboard

### 4. Cloudflare Email Routing

1. Add your domain to Cloudflare
2. Enable Email Routing
3. Set up catch-all forwarding to your real email address
4. Configure MX records as instructed by Cloudflare

### 5. Gmail App Password (if using Gmail)

1. Enable 2-factor authentication on your Google account
2. Generate an App Password for the application
3. Use this App Password in `IMAP_PASSWORD`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Email Generation Types

### 1. Random
Generates completely random email addresses:
- `abc123def@mydomain.com`

### 2. Custom
Use your own prefix:
- `support@mydomain.com`
- `contact@mydomain.com`

### 3. Themed
Pre-defined themes for different use cases:
- **Business**: contact, info, support, sales
- **Personal**: me, mail, inbox, personal
- **Temporary**: temp, throwaway, disposable
- **Testing**: test, demo, sample, trial

### 4. Timestamped
Includes timestamp for guaranteed uniqueness:
- `mail-1234567890@mydomain.com`

## API Endpoints

### Mailbox Management
- `POST /api/mailbox` - Create new mailbox
- `GET /api/mailbox` - List user mailboxes
- `GET /api/mailbox/[id]` - Get mailbox details and emails
- `PUT /api/mailbox/[id]` - Update mailbox
- `DELETE /api/mailbox/[id]` - Delete mailbox

### Email Operations
- `POST /api/emails/[id]/read` - Mark email as read
- `POST /api/emails/[id]/star` - Toggle email star
- `GET /api/search` - Search emails

### Cron Jobs
- `GET /api/cron/fetch-emails` - Fetch new emails (Vercel Cron)

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy the application

The `vercel.json` file is already configured for:
- Cron job that runs every 5 minutes to fetch emails
- Proper API routes handling

### Manual Email Fetching

For development and testing:

```bash
node scripts/fetch-emails.js
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `created_at`, `updated_at` (Timestamps)

### Mailboxes Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `email_address` (String, Unique)
- `name` (String, Optional)
- `description` (Text, Optional)
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### Emails Table
- `id` (UUID, Primary Key)
- `mailbox_id` (UUID, Foreign Key)
- `message_id` (String, Unique)
- `from_address`, `from_name` (String)
- `to_address` (String)
- `subject` (Text)
- `body_text`, `body_html` (Text)
- `received_at` (Timestamp)
- `is_read`, `is_starred` (Boolean)
- `attachments` (JSONB)
- `headers` (JSONB)
- `created_at`, `updated_at` (Timestamps)

## Security Features

- Row Level Security (RLS) policies
- User-based data isolation
- Secure API endpoints with authentication
- Environment variable protection
- CRON job authentication

## Manual Email Fetching Script

For development and testing:

```bash
node scripts/fetch-emails.js
```

## License

MIT License

---

**Note**: This is a complete email management system. Make sure to properly configure all services (Supabase, Cloudflare, IMAP) before deploying to production.
