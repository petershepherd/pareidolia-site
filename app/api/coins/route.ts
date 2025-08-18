import { NextRequest, NextResponse } from "next/server";

// Sample coin data - in a real app this would come from a database
const SAMPLE_COINS = [
  {
    symbol: "PAREIDOLIA",
    name: "Pareidolia",
    imageUrls: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    ],
    narrative: "The ultimate meme coin for pattern recognition enthusiasts who see faces in everything from clouds to coffee foam."
  },
  {
    symbol: "DOGE",
    name: "Dogecoin", 
    imageUrls: [
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=600&fit=crop"
    ],
    narrative: "Much wow, such coin, very meme. The original meme cryptocurrency that started it all."
  },
  {
    symbol: "PEPE",
    name: "Pepe",
    imageUrls: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop"
    ],
    narrative: "Rare Pepe energy in crypto form. Feel good, meme good."
  },
  {
    symbol: "BONK",
    name: "Bonk",
    imageUrls: [
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop"
    ],
    narrative: "Bonk to the moon! Community-driven meme coin with serious bonking power."
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let results = SAMPLE_COINS;

    // Filter by search term (case-insensitive symbol match)
    if (search) {
      const searchLower = search.toLowerCase();
      results = SAMPLE_COINS.filter(coin => 
        coin.symbol.toLowerCase() === searchLower
      );
    }

    return NextResponse.json({
      coins: results,
      total: results.length
    });
  } catch (error) {
    console.error("Error in /api/coins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}