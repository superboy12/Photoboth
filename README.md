# Photobox Multiplayer

> Online collaborative photobooth for you and your friends — from anywhere! 📸

## Features

- 🎥 **Multiplayer rooms** — Up to 8 participants with unique room codes
- 📸 **Synchronized countdown** — Everyone takes photos at the same time
- 🖼️ **20+ Frames** — Cute, Funny, Romantic, Friendship, Minimalist, Indonesian
- 🎨 **Virtual Backgrounds** — Solid colors, gradients, and 15 image backgrounds
- ✨ **Photo Editor** — Filters, stickers (50+), text overlays, adjustments
- 🎞️ **Photostrip** — Classic photobooth strip format
- 📥 **Download & Share** — PNG/JPG with Web Share API
- 🔗 **QR Code** — Easy room sharing via QR code
- ⚡ **Real-time Sync** — Powered by Supabase Realtime

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (Realtime + PostgreSQL)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Setup

### 1. Configure Environment Variables

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Setup Supabase Database

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor.

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Usage Flow

1. **Create Room** → Get 6-character room code + QR code
2. **Share code** → Friends join with code or QR scan
3. **Choose Frame & Background** → Host selects, synced to all
4. **Countdown** → `3... 2... 1... CHEESE!`
5. **Edit** → Filters, stickers, text overlays
6. **Download** → PNG or Photostrip format

## Privacy

- Camera streams are **never** uploaded to any server
- Photos are processed **entirely in the browser**
- Rooms automatically expire after **2 hours**
