# Dexscreener API Integration - Implementation Guide

## Overview

This implementation adds comprehensive Dexscreener API integration to the Pareidolia coin listing system, providing real-time market data updates with automatic background synchronization.

## 🚀 Features Implemented

### ✅ Core API Integration
- **Dexscreener API Service** (`lib/dexscreener/api.ts`)
  - Rate limiting with exponential backoff
  - Request deduplication and caching
  - Health check functionality
  - Error handling and retry logic

### ✅ Market Data Synchronization
- **Background Sync System** (`lib/coins/sync.ts`)
  - Configurable sync intervals (5-10 minutes)
  - Batch processing for multiple tokens
  - Sync status tracking and failure handling
  - Manual and automatic sync triggers

### ✅ Enhanced Data Model
Extended `Coin` type with market data fields:
- `price: number | null`
- `volume24h: number | null` 
- `liquidity: number | null`
- `marketCap: number | null`
- `priceChange24h: number | null`
- `lastSyncAt: string | null`

### ✅ API Endpoints
- `GET/POST /api/coins/sync` - Manual sync trigger and status
- `GET /api/coins/revalidate` - Enhanced with sync functionality
- `GET/POST /api/admin/sync/scheduler` - Background scheduler management

### ✅ Updated UI Components
- **Enhanced CoinCard** - Displays real market data with:
  - Formatted price with change indicators (green ↑ / red ↓)
  - Volume, liquidity, and market cap formatting
  - Last sync timestamp
  - Price change percentage with color coding

### ✅ Admin Interface
- **Sync Controls** (`components/admin/SyncControls.tsx`)
  - Manual sync triggers
  - Real-time sync status display
  - Error reporting and diagnostics
  - Force sync option

### ✅ Performance & Caching
- **Market Data Cache** (`lib/cache/market-data.ts`)
  - In-memory caching with TTL
  - Automatic cleanup of expired entries
  - Cache statistics and monitoring

### ✅ Configuration
- Environment-based configuration
- Configurable sync intervals
- Feature flags for enabling/disabling auto-sync
- Rate limiting parameters

## 📁 File Structure

```
lib/
├── dexscreener/
│   ├── api.ts              # Main API service
│   └── types.ts            # TypeScript definitions
├── coins/
│   ├── sync.ts             # Sync logic and status
│   └── types.ts            # Extended with market data
├── cache/
│   └── market-data.ts      # Caching system
├── config/
│   └── dexscreener.ts      # Environment configuration
├── utils/
│   └── formatting.ts       # Market data formatters
└── background/
    └── scheduler.ts        # Background sync scheduler

app/api/
├── coins/
│   └── sync/route.ts       # Sync API endpoint
└── admin/
    └── sync/
        └── scheduler/route.ts  # Scheduler management

components/
├── coins/
│   └── CoinCard.tsx        # Enhanced with market data
└── admin/
    └── SyncControls.tsx    # Admin sync interface
```

## 🔧 Environment Configuration

Add to your `.env.local`:

```bash
# Dexscreener API Configuration
DEXSCREENER_SYNC_INTERVAL_MINUTES=10
DEXSCREENER_MIN_SYNC_INTERVAL_MINUTES=5
ENABLE_AUTO_SYNC=true

# Rate limiting
DEXSCREENER_MAX_RETRIES=3
DEXSCREENER_RETRY_DELAY_MS=1000
DEXSCREENER_REQUEST_TIMEOUT_MS=10000

# Admin authentication (existing)
ADMIN_TOKEN=your-admin-token
```

## 🎯 Usage

### Automatic Sync
- Background scheduler runs every 10 minutes by default
- Only syncs coins that haven't been updated recently
- Respects rate limits and handles failures gracefully

### Manual Sync
```bash
# Sync all coins that need updating
curl -X POST "http://localhost:3000/api/coins/sync"

# Force sync all coins
curl -X POST "http://localhost:3000/api/coins/sync" \
  -H "Content-Type: application/json" \
  -d '{"forceSync": true}'

# Check sync status
curl -X GET "http://localhost:3000/api/coins/sync"
```

### Admin Interface
1. Navigate to `/admin`
2. Connect authorized wallet and enter PIN
3. Use the "Market Data Sync" panel to:
   - View sync status
   - Trigger manual syncs
   - Monitor errors and performance

## 📊 Market Data Display

The CoinCard now shows:

- **Price**: Formatted based on value (scientific notation for very small values)
- **24h Change**: Green ↑ for positive, red ↓ for negative
- **Volume 24h**: Formatted as $45.7K, $1.2M, etc.
- **Liquidity**: Same formatting as volume
- **Market Cap**: Formatted with K/M/B suffixes
- **Last Updated**: Relative timestamps (5m ago, 2h ago, etc.)

## 🔒 Security

- Admin endpoints require `ADMIN_TOKEN` authentication
- Rate limiting prevents API abuse
- Error handling prevents system crashes
- Input validation on all endpoints

## 🚀 Performance

- **Caching**: 3-minute cache TTL for API responses
- **Batch Processing**: 5 tokens per batch with delays
- **Request Deduplication**: Prevents duplicate API calls
- **Memory Management**: Automatic cache cleanup

## 🔧 Monitoring

- Comprehensive error logging
- Sync status tracking
- Cache statistics
- API health checks

## 🔄 Background Sync Process

1. **Initialization**: Scheduler starts automatically on server boot
2. **Interval Sync**: Runs every 10 minutes (configurable)
3. **Smart Filtering**: Only syncs coins older than 5 minutes
4. **Batch Processing**: Processes 5 tokens at a time
5. **Error Handling**: Continues on failures, logs errors
6. **Status Updates**: Updates global sync status

## 🎨 UI Enhancements

The market data is seamlessly integrated into the existing design:
- Maintains the existing card layout
- Uses consistent styling and colors
- Responsive design for mobile devices
- Loading and error states handled gracefully

## 📈 Data Flow

1. **Background Sync** → Fetches from Dexscreener API
2. **Cache Layer** → Stores responses temporarily
3. **Database** → Updates coin records in JSON file
4. **API Endpoints** → Serves data to frontend
5. **UI Components** → Displays formatted market data

## 🔮 Future Enhancements

The architecture supports easy extension for:
- WebSocket real-time updates
- Additional DEX integrations
- Advanced analytics and charts
- Push notifications for price changes
- Database migration (Prisma/Postgres ready)

## 🐛 Error Handling

- API failures gracefully degrade to cached or placeholder data
- Network errors trigger retry logic with exponential backoff
- Malformed responses are logged and skipped
- UI shows appropriate error states and recovery options

This implementation provides a production-ready foundation for real-time market data in the Pareidolia ecosystem while maintaining backward compatibility and system reliability.