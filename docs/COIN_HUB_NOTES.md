# Pareidolia Coin Hub - Architecture & Implementation Notes

## Overview

The Pareidolia Coin Hub is a foundational layer that transforms the primary site focus toward a Solana-based meme coin ecosystem centered around $PAREIDOLIA, while preserving legacy contest functionality under `/contest`.

## Architecture

### Data Model

**Coins (`Coin` type):**
- `id`: Unique identifier (string)
- `symbol`: Token symbol (e.g., "PAREIDOLIA")
- `name`: Human-readable name
- `description`: Optional description
- `contractAddress`: Solana mint address
- `chain`: Fixed to "SOL"
- `createdAt`: ISO timestamp
- URLs: `website`, `twitter`, `telegram`, `dexUrl`, `explorerUrl`
- Future metrics: `price`, `volume24h`, `liquidity`, `holders` (placeholders)

**Burn Events (`BurnEvent` type):**
- `id`: Unique identifier
- `coinId`: Reference to coin
- `amount`: Tokens burned
- `txHash`: Transaction hash
- `timestamp`: ISO timestamp
- `description`: Optional details

**Status Badges:**
- `NEW`: < 24 hours old (red badge)
- `EARLY`: < 7 days old (blue badge)  
- `ESTABLISHED`: > 7 days old (gray badge)

### Storage Layer

**File-based JSON (MVP):**
- `data/coins.json`: Persists coins and burn events
- `lib/coins/store.ts`: File operations with write serialization
- Race condition handling via promise chaining

**Future Migration Path:**
Documented transition to Prisma/Postgres for scalability:
1. Keep same TypeScript interfaces
2. Replace store functions with database operations
3. Add indexing for search and filtering
4. Implement proper transactions for burn events

### API Endpoints

**Public Endpoints:**
- `GET /api/coins`: List coins with optional search/status filters
- `GET /api/coins/[id]`: Single coin with derived status
- `POST /api/coins/revalidate`: Future sync job trigger

**Admin Endpoints (ADMIN_TOKEN protected):**
- `POST /api/admin/coins`: Create new coin
- `POST /api/admin/burn-events`: Log burn events

All admin endpoints require `Authorization: Bearer ADMIN_TOKEN` header.

### Security

**Admin Authentication:**
- Bearer token authentication for API endpoints
- Existing wallet + PIN system for UI access
- `ADMIN_TOKEN` environment variable for API security
- `NEXT_PUBLIC_ADMIN_TOKEN` for client-side forms (optional)

**Data Validation:**
- Required fields validation on coin creation
- Chain fixed to "SOL" 
- Status derived at runtime (not stored)

### Components

**CoinCard (`components/coins/CoinCard.tsx`):**
- Displays coin information with status badges
- Contract address copy functionality
- Action buttons (Trade, Meme, Social links)
- Deep link support for meme generator (`?coin=SYMBOL`)

**CoinList (`components/coins/CoinList.tsx`):**
- Search functionality (name, symbol, description)
- Status filtering (ALL, NEW, EARLY, ESTABLISHED)
- Responsive grid layout
- Loading and error states

### Integration Points

**Meme Generator Deep Links:**
- CoinCard generates `/meme?coin=SYMBOL` links
- Future: Auto-load coin imagery in meme generator

**Buyback & Burn Tracking:**
- Burn events API ready for UI implementation
- Future: Aggregated stats widget on home page

**Metrics Ingestion:**
- Placeholder fields for price, volume, liquidity, holders
- Future: Dexscreener/Birdeye API integration
- Trending score calculation

## Implementation Notes

### Current State (MVP)
- JSON-based persistence suitable for single-instance deployment
- File system operations with basic race condition handling
- Runtime-derived status badges (no caching)
- Manual coin addition via admin form

### Performance Considerations
- All API routes marked `dynamic = 'force-dynamic'` to prevent static optimization issues
- File reads are cached at the OS level but not application level
- Search and filtering happen in-memory

### Development Workflow
1. Add coins via `/admin/coins/new` form
2. Coins appear on updated home page
3. Status badges update automatically based on creation time
4. Deep links to meme generator ready

### Future Enhancements

**Phase 1: Real Metrics**
- Integrate Dexscreener/Birdeye APIs
- Add background job for periodic updates
- Implement trending algorithms

**Phase 2: Database Migration**
- Move from JSON to Prisma/Postgres
- Add proper indexing and caching
- Implement database transactions

**Phase 3: Advanced Features**
- Burn event UI and aggregation
- Real-time metrics via WebSocket
- Advanced filtering and sorting

## Environment Variables

Required for MVP:
- `ADMIN_TOKEN`: API authentication for coin/burn management
- Existing: `ADMIN_PIN`, `ADMIN_WALLETS`, etc.

Optional:
- `NEXT_PUBLIC_ADMIN_TOKEN`: Client-side admin token (alternative to runtime input)

## Non-Destructive Changes

All existing functionality preserved:
- Contest system under `/contest`
- Meme generator at `/meme` 
- Admin wallet + PIN authentication
- Existing API endpoints unchanged

Only the home page (`/`) content is replaced with the new Coin Hub interface.