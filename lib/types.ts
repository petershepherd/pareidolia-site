export type MemeMetrics = { like: number; retweet: number; reply: number; quote: number };

export type Submission = {
  id: string;               // tweet ID (pl. "tw-1955...")
  tweetUrl: string;
  wallet?: string;
  submittedAt: string;      // ISO
  approved: boolean;
  metrics: MemeMetrics;
};

export type MemeData = {
  submissions: Submission[];
};

export type Snapshot = {
  date: string;             // YYYY-MM-DD
  metrics: { [id: string]: MemeMetrics };
};
