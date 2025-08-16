/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // A data/memes.json sima olvasható endpointként:
      { source: "/memes.json", destination: "/data/memes.json" },
      // Snapshotokat is ki lehet tenni, ha kell:
      { source: "/snapshots/:date.json", destination: "/data/snapshots/:date.json" },
    ];
  },
};

module.exports = nextConfig;
