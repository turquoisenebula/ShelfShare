# ShelfShare

A shared reading & watchlist tracker with a transparent, tag-based recommendation engine — no ML, no black box, just explainable logic you can point to and explain in one paragraph.

Track what you're reading and watching across **Want to / In Progress / Done**, rate what you finish, follow other people's shelves, and get recommendations based on what you've actually liked — with the reasoning shown right in the UI.

---

## Features

- **Personal shelves** — add books and shows, track status (Want to / In Progress / Done), rate anything you finish
- **Tag-based recommendations** — a fully transparent scoring algorithm (see below) that explains *why* each item was suggested
- **Tag filtering** — filter your own shelf down by tag
- **Public profiles** — every user has a shareable shelf at `/u/[username]`
- **Follow system** — follow other users and see a combined feed of what they're reading/watching at `/feed`
- **People search** — find and follow other users by name or username

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + React |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (credentials provider) |

## The recommendation engine

The core feature, and deliberately simple:

1. **Preference map** — look at every item the user rated 4–5 stars, and count how often each tag appears across them.
2. **Scoring** — for every item not already on the user's list, sum the preference weight of its tags.
3. **Ranking** — sort by score, return the top N, along with the specific tag and source item that drove each suggestion.

See [`lib/recommendations.ts`](./lib/recommendations.ts) — it's isolated and commented so the logic is easy to read end-to-end.

## Design

Items are treated as physical shelf objects rather than table rows: books render as asymmetric "spine" cards, shows as "poster" cards, laid out in horizontally scrolling shelf rows per status. Palette is warm paper/ink with a single rust accent; Fraunces for display type, Inter for body text. Full token set in [`tailwind.config.ts`](./tailwind.config.ts) and [`app/globals.css`](./app/globals.css).

## Getting started

### Prerequisites
- Node.js 18+
- A PostgreSQL database ([Neon](https://neon.tech) or [Supabase](https://supabase.com) both offer a free tier and a connection string in under a minute)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env — set DATABASE_URL to your Postgres connection string,
# and set NEXTAUTH_SECRET to the output of:
openssl rand -base64 32

# 3. Apply the database schema
npx prisma db push

# 4. Seed sample data (18 items, 14 tags, 3 demo users)
npm run db:seed

# 5. Run it
npm run dev
```

Visit `http://localhost:3000`.

### Demo login
```
email: amara@example.com
password: password123
```
(also available: `jonah@example.com`, `priya@example.com` — same password)

## Project structure

```
app/
  api/
    auth/[...nextauth]     NextAuth handler
    signup                 create account
    items/                 list, search, create items; GET /api/items/[id]
    user-items             the logged-in user's list (add/update status & rating)
    recommendations        recommendations for the logged-in user
    profile/[username]     public shelf data
    follow                 follow status + toggle follow/unfollow
    feed                   shelves of people you follow, grouped by user
    users                  search people by name/username
  shelf/                   main authenticated app view (with tag filter)
  item/[id]/               item detail + status/rating controls
  u/[username]/            public profile page (with Follow button)
  feed/                    "Following" feed + people search
  login/, signup/          auth pages

lib/
  recommendations.ts       the recommendation engine
  auth.ts                  NextAuth config
  prisma.ts                Prisma client singleton

components/
  ItemCard, ShelfSection, RecommendationPanel, BookmarkRating,
  AddItemForm, TagFilter, PeopleSearch, Header

prisma/
  schema.prisma            data model
  seed.ts                  sample data
```

## Data model

```
User        — auth + profile
Item        — a book or show
Tag         — a genre/descriptor
ItemTag     — many-to-many join between Item and Tag
UserItem    — a user's personal status + rating for an item
Follow      — a directed follow relationship between two users
```

## Non-goals

This project intentionally stays away from:
- External APIs (TMDB, Goodreads, etc.) — items are added manually
- ML libraries or embeddings for recommendations
- OAuth/social login
- Comments, likes, or a social feed

The scope is kept small on purpose — the point is a complete, explainable full-stack app, not a sprawling one.

## License

MIT — do whatever you'd like with this.
