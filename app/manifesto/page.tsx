import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Illusion Of Life, Pareidolia Manifesto",
  description: "A cultural and economic pattern engine for decentralized meme culture, centered on transparency, fair emergence, and creative attribution in the $PAREIDOLIA ecosystem.",
};

export default function ManifestoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
            Illusion Of Life
          </span>
          <br />
          <span className="text-neutral-200">Pareidolia Manifesto</span>
        </h1>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
          A cultural and economic pattern engine for decentralized meme culture, centered on transparency, fair emergence, and creative attribution in the $PAREIDOLIA ecosystem.
        </p>
      </header>

      <div className="prose prose-invert prose-lg max-w-none">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">The Pattern Engine</h2>
          <p className="text-neutral-300 leading-relaxed">
            We see what we want to see. This fundamental truth of human perception becomes the cornerstone of our decentralized meme culture. Pareidolia—the tendency to perceive meaningful patterns in random stimuli—is not just our name, but our philosophy.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            In the chaotic noise of market data, social sentiment, and cultural zeitgeist, we discover the patterns that matter. We transform these patterns into meme magic through the power of perception and collective recognition.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Principles of Fair Emergence</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-cyan-400 pl-4">
              <h3 className="text-lg font-semibold text-white">Transparency</h3>
              <p className="text-neutral-300">All pattern recognition algorithms, token distributions, and community decisions are open and verifiable on-chain.</p>
            </div>
            <div className="border-l-4 border-fuchsia-400 pl-4">
              <h3 className="text-lg font-semibold text-white">Creative Attribution</h3>
              <p className="text-neutral-300">Every meme creator receives proper recognition and economic incentives for their contributions to the cultural pattern engine.</p>
            </div>
            <div className="border-l-4 border-amber-400 pl-4">
              <h3 className="text-lg font-semibold text-white">Collective Intelligence</h3>
              <p className="text-neutral-300">The wisdom of the crowd amplifies individual pattern recognition, creating emergent insights that benefit the entire ecosystem.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">The $PAREIDOLIA Ecosystem</h2>
          <p className="text-neutral-300 leading-relaxed">
            Our token represents more than speculative value—it embodies the collective pattern-finding power of our community. Through contests, collaborative creation, and transparent governance, $PAREIDOLIA becomes the economic layer of decentralized meme culture.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            We believe in the illusion of life that emerges from seemingly random market movements. In this illusion, we find truth. In this truth, we build lasting value for creators, holders, and the broader Solana ecosystem.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Join the Pattern</h2>
          <p className="text-neutral-300 leading-relaxed">
            The patterns are already there, waiting to be discovered. Join us in turning market chaos into meme magic, individual creativity into collective intelligence, and fleeting trends into lasting cultural artifacts.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            See what you want to see. Create what others need to see. Together, we shape the illusion of life.
          </p>
        </section>
      </div>

      <footer className="text-center pt-8 border-t border-neutral-800">
        <p className="text-neutral-400">
          Contact: <a href="mailto:patterns@pareidolia.community" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4">patterns@pareidolia.community</a>
        </p>
      </footer>
    </div>
  );
}