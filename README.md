# Pareidolia Site

A Next.js-based meme coin hub and community platform built on Solana, featuring the $PAREIDOLIA ecosystem with contest functionality, meme generation, and community features.

## Features

- **Coin Hub**: Browse and discover Solana meme coins with live metrics
- **Meme Generator**: Create memes with integrated coin deep-linking
- **Community Contest**: Daily meme challenges with scoring and rewards
- **Leaderboards**: Track top creators and community rankings
- **Submit System**: Community meme submission and curation

## Navigation & Feature Placement

The site uses a streamlined navigation approach that prioritizes the core coin hub functionality while preserving community features through secondary discovery paths:

### Primary Navigation (Top Bar)
- **Home**: Landing page with coin hub and community highlights
- **Meme Generator**: Core creative tool with coin integration

### Secondary Feature Access

**Community Highlights Section (Homepage)**
- Prominent widget section beneath the hero featuring three discovery cards:
  - **Meme Contest**: Visual card linking to `/contest` with participation details
  - **Submit a Meme**: Community submission portal at `/submit`  
  - **Leaderboard**: Rankings and creator showcase at `/leaderboard`

**Global Footer**
- **Community Section**: Direct links to Contest, Submit a Meme, and Leaderboard
- **Resources Section**: Meme Generator, Token Explorer, Trade Token
- **Connect Section**: Social links and legal information
- **Action Bar**: Quick access to trading and community joining

### Design Rationale

This navigation structure:
1. **Reduces cognitive load** - Main nav focuses on core coin hub functionality
2. **Preserves discoverability** - Community features prominently displayed on homepage
3. **Maintains deep links** - All existing routes (`/contest`, `/submit`, `/leaderboard`) remain functional
4. **Enhances visual hierarchy** - Contest features presented as destination content rather than utility links
5. **Improves accessibility** - Multiple pathways to community features through cards, footer, and preserved URLs

The approach transforms community features from always-visible navigation items into engaging destination content that users can discover through the homepage experience or access directly via bookmarks and deep links.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Architecture

Built with:
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience  
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Solana Web3.js** - Blockchain integration
- **Wallet Adapter** - Multi-wallet connection support

## Contributing

Community contributions are welcome! Please ensure all existing functionality remains intact when making changes.