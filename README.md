# World of Darkness Book Tracker

A modern Next.js 15 application for tracking your World of Darkness book collection.

## Features

- **Browse Books**: View all 971 World of Darkness books in a sortable table
- **Sort & Filter**: Sort by title, year, product line, edition, or collected status
- **Track Collection**: Check off books as you collect them with instant optimistic updates
- **Progress Stats**: See your collection progress by product line
- **Fast Performance**: Built with Next.js 15 Server Components and React 19

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL 18 with Drizzle ORM
- **State**: Server Components + Optimistic UI
- **UI Components**: Custom components with shadcn/ui patterns

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 18 database running locally
- Database `postgres` with tables: `books`, `product_lines`, `editions`

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create `.env.local` file (already created):
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=postgres
   DATABASE_USER=order
   DATABASE_PASSWORD=
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── books/             # Main books listing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to /books)
├── components/
│   ├── ui/                # Base UI components
│   ├── books/             # Book-related components
│   └── collections/       # Collection stats components
├── lib/
│   ├── db/                # Database layer
│   │   ├── schema.ts      # Drizzle schema
│   │   ├── index.ts       # Database connection
│   │   └── queries.ts     # Query functions
│   ├── actions/           # Server Actions
│   └── utils/             # Utility functions
└── hooks/                 # React hooks
```

## Database Schema

The application connects to your existing PostgreSQL database with:

- **books**: 971 records with title, ww_code, publication_year, collected, etc.
- **product_lines**: 16 game lines (Vampire, Werewolf, Mage, etc.)
- **editions**: Various editions (1st, 2nd, Revised, 20th Anniversary, etc.)

## Key Features

### Optimistic UI Updates
- Checkboxes update instantly before server confirmation
- Smooth user experience with automatic rollback on errors

### Smart Filtering
- Search by title or product line name
- Filter by product line, edition, or collection status
- All filtering happens client-side for instant results

### Collection Progress
- Overall completion percentage
- Per-product-line progress bars
- Real-time stats

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Development

Built with modern web technologies:
- Server Components for zero-JS data fetching
- Server Actions for type-safe mutations
- Optimistic updates for instant feedback
- Tailwind CSS for styling
- TypeScript for type safety

## License

Private project for personal use.
