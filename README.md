# Faze Subathon Tracker

A real-time web application to track the Faze Clan subathon with live stats, predictions, and community competition.

## Features

- **Live Subscriber Tracking**: Real-time sub counts updated every 5 minutes via TwitchTracker scraping
- **Anonymous User System**: No authentication required - users tracked via localStorage
- **Team Selection**: Choose your champion streamer
- **Daily Predictions**: Predict which streamer will gain the most subs
- **Points & Coins System**: Earn rewards for accurate predictions
- **Streaks & Multipliers**: 3-day and 7-day streak bonuses
- **Leaderboards**: Individual and team rankings
- **User Profiles**: Track stats, achievements, and prediction history
- **Analytics Dashboard**: Compare streamer performance with interactive charts
- **Individual Streamer Pages**: Detailed stats and growth charts

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Vercel Cron Jobs
- **Database**: MongoDB Atlas (M0 Free Tier)
- **Charts**: Recharts
- **Scraping**: Cheerio
- **Deployment**: Vercel (Free Tier)

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)

### Setup

1. Clone the repository:
```bash
cd fazeathon
npm install
```

2. Create a `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
CRON_SECRET=your_random_secret_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Manual Testing

Test the scraper manually:
```bash
curl http://localhost:3000/api/cron/scrape
```

Test the scoring system:
```bash
curl http://localhost:3000/api/cron/score
```

## Deployment to Vercel

### Step 1: MongoDB Atlas Setup

1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new M0 (free) cluster
3. Create a database user with read/write permissions
4. Whitelist all IPs (0.0.0.0/0) for Vercel access
5. Get your connection string

### Step 2: Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CRON_SECRET`: Generate a random secret key

5. Redeploy with production environment:
```bash
vercel --prod
```

### Step 3: Verify Cron Jobs

The app uses two cron jobs configured in `vercel.json`:

1. **Scraper** (every 5 minutes): `/api/cron/scrape`
2. **Scorer** (midnight daily): `/api/cron/score`

Verify cron jobs are running in Vercel dashboard.

## Gamification System

### Points System

- Correct winner prediction: **+100 points**
- Sub count within 5%: **+50 points**
- Sub count within 10%: **+25 points**
- 3-day streak: **2x multiplier**
- 7-day streak: **3x multiplier**

### Coins System

- Daily prediction: **+10 coins**
- Correct winner: **+20 coins**
- Referral: **+50 coins**
- Level up: **+50 coins**

## Monitored Streamers

1. JasonTheWeen
2. Silky
3. StableRonaldo
4. Lacy
5. Adapt
6. Kaysan

## License

MIT
