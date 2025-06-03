# 0xReplyer Frontend

Instagram automation and content creation platform that helps users manage automated responses, create landing pages, and generate AI-powered captions.

## Features

- **Instagram Automation**: Set up automated DM responses triggered by keywords in comments
- **Caption Generator**: AI-powered caption creation with transcription and optimization
- **Landing Page Builder**: Drag-and-drop editor with custom domain support
- **Analytics Dashboard**: Track engagement metrics and automation performance

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **UI Components**: Radix UI
- **Authentication**: Google OAuth, Instagram OAuth
- **Internationalization**: next-intl (ES/EN)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Facebook/Instagram Developer App
- Google Cloud Console project (for OAuth)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 0xreplyer-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_FACEBOOK_APP_ID`: Facebook App ID
   - `NEXT_PUBLIC_INSTAGRAM_APP_ID`: Instagram App ID
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth Client ID
   - `JWT_SECRET`: Secret key for JWT tokens

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `https://localhost:3000` (uses experimental HTTPS)

## Available Scripts

- `npm run dev` - Start development server with Turbopack and HTTPS
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
/app              # Next.js App Router pages
/components       # React components
  /auth          # Authentication components
  /caption       # Caption generator components
  /editor        # Landing page editor components
  /landing       # Landing page display components
  /reels         # Instagram reels management
  /ui            # Base UI components
/contexts        # React Context providers
/hooks           # Custom React hooks
/lib             # Utilities and configurations
/messages        # i18n translation files
/public          # Static assets
```

## Key Features Configuration

### Instagram Integration
- Configure Instagram webhook endpoints in your Facebook App
- Set up Instagram Basic Display API permissions
- Configure OAuth redirect URLs

### Custom Domains
- SSL certificate management is handled automatically
- Configure DNS records to point to the application

### Supabase Database
- Required tables are managed through Supabase migrations
- Real-time subscriptions for live updates

## Deployment

### Architecture Overview

The project uses a hybrid deployment architecture:

- **Main Application** (Railway): Dashboard, editor, authentication, and core features
- **VPS Server**: Dedicated to serving landing pages with custom domain support

### VPS Deployment

The VPS deployment is automated through GitHub Actions:

1. **Automatic Deployment**
   - Triggers on push to main branch
   - Uses `scripts/deploy-vps.sh` for zero-downtime updates
   - PM2 process manager for reliability

2. **Build Process**
   ```bash
   ./build-vps.sh  # Sets NEXT_PUBLIC_IS_VPS=true
   ```

3. **Manual Deployment**
   ```bash
   ssh your-vps
   cd /path/to/project
   ./scripts/deploy-vps.sh
   ```

### SSL Certificates

The project handles SSL certificates for two different purposes:

#### 1. Local Development HTTPS
```bash
npm run dev  # Uses --experimental-https flag
```
- Next.js generates self-signed certificates automatically
- Required for Instagram/Facebook webhook testing
- Enables local testing of OAuth flows

#### 2. Production SSL (Custom Domains)

Managed via `scripts/manage_ssl.sh`:

```bash
# Install dependencies
sudo ./scripts/manage_ssl.sh install-deps

# Setup wildcard certificate for *.creator0x.com
sudo ./scripts/manage_ssl.sh wildcard

# Add custom domain certificate
sudo ./scripts/manage_ssl.sh custom example.com

# Remove domain
sudo ./scripts/manage_ssl.sh remove example.com

# Renew all certificates
sudo ./scripts/manage_ssl.sh renew
```

**API Endpoints** (VPS only):
- `POST /api/ssl/create` - Generate SSL for custom domain
- `POST /api/ssl/remove` - Remove SSL certificate
- `GET /api/ssl/health` - Check SSL service status

**Security**: SSL APIs require `X-VPS-Secret` header and only work when `NEXT_PUBLIC_IS_VPS=true`

### Custom Domain Flow

1. User configures custom domain in editor
2. User updates DNS records to point to VPS IP
3. System automatically generates SSL certificate
4. Middleware routes custom domain to correct landing page

### Environment Variables (VPS)

Additional variables for VPS deployment:

```env
# VPS Configuration
NEXT_PUBLIC_IS_VPS=true
VPS_SECRET=your_vps_secret_key
NAMECHEAP_API_USER=your_namecheap_user
NAMECHEAP_API_KEY=your_namecheap_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

Private project - All rights reserved