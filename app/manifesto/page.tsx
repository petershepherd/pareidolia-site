"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Lightbulb, Coins } from "lucide-react";
import Link from "next/link";

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
              Illusion Of Life Manifesto
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              The philosophical foundation of Pareidolia - where patterns become purpose, chaos becomes clarity, and community emerges from collective imagination.
            </p>
          </header>

          <div className="space-y-8">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Eye className="h-6 w-6 text-cyan-400" />
                  The Art of Seeing
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-neutral prose-invert max-w-none">
                <p className="text-lg text-neutral-300 leading-relaxed">
                  Pareidolia is the tendency to perceive meaningful patterns in randomness—seeing faces in clouds, 
                  hearing voices in static, finding signals in noise. We embrace this fundamental human trait not as 
                  a flaw in perception, but as the very engine of creativity and connection.
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  In the chaos of markets, in the randomness of chance, in the noise of digital existence, 
                  we choose to see patterns. We create meaning where none existed before. This is not delusion—this is creation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Lightbulb className="h-6 w-6 text-amber-400" />
                  Memes as Meaning
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-neutral prose-invert max-w-none">
                <p className="text-lg text-neutral-300 leading-relaxed">
                  Memes are more than jokes—they are the living language of digital culture, the shared symbols 
                  through which we make sense of an increasingly complex world. They transform abstract market 
                  movements into tangible stories, complex emotions into universal truths.
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  Through meme creation, we collectively author the narrative of our time. Each image, each caption, 
                  each viral moment becomes part of a larger tapestry of shared understanding. We are not just 
                  traders or creators—we are storytellers of the digital age.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Coins className="h-6 w-6 text-orange-400" />
                  Community Through Chaos
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-neutral prose-invert max-w-none">
                <p className="text-lg text-neutral-300 leading-relaxed">
                  In the volatile world of cryptocurrency, traditional financial wisdom often fails. But pareidolia 
                  teaches us that even in apparent randomness, communities can form around shared patterns, 
                  shared stories, shared dreams of what could be.
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  $PAREIDOLIA is not just a token—it's a commitment to finding signal in the noise, to building 
                  value through collective creativity, to proving that meaning emerges not from central planning 
                  but from the beautiful chaos of human imagination working together.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/10 to-amber-400/10 border-cyan-500/20">
              <CardContent className="text-center py-8">
                <h3 className="text-2xl font-bold mb-4">Join the Pattern</h3>
                <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
                  Every meme you create, every pattern you recognize, every connection you make contributes 
                  to the collective pareidolia that defines our community. The illusion of life becomes life itself.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="rounded-2xl">
                    <Link href="/meme">
                      Create Memes
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/20 text-white hover:bg-white/10">
                    <a href="https://t.me/pareidoliaportal" target="_blank" rel="noreferrer">
                      Join Community <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}