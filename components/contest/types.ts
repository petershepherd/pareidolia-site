export type ContestImage = {
  url: string;     // kép URL (CDN, repo/raw, stb.)
  alt?: string;
};

export type Contest = {
  id: string;                 // pl. "2025-08-15-a"
  title: string;              // napi/ heti cím
  description?: string;       // rövid leírás/szabály
  images: ContestImage[];     // 1-2 kép / nap
  activeFrom: string;         // ISO
  activeTo: string;           // ISO
  minSubmissions?: number;    // pl. 5
  tweetTemplate?: string;     // sablon X poszthoz
};

export type Submission = {
  contestId: string;          // melyik contesthez tartozik
  tweetId: string;            // X tweet ID (csak ID, nem URL)
  author?: string;            // @handle (opcionális)
  createdAt?: string;         // ISO (cache / gyors szűrés)
};

export type ContestFile = {
  contests: Contest[];
  submissions: Submission[];
};
