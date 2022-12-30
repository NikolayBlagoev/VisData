export type GamePlatforms = {
  linux: boolean;
  mac: boolean;
  windows: boolean;
}

export type HistogramData = {
  date: number,
  recommendations_up: number,
  recommendations_down: number
}

export type Achievement = {
  name: string;
  percent: number;
}

export type KaggleGame = {
  appid: number;
  categories: string[];
  ccu: number;
  consensus_genre: string;
  developer: string;
  discount: string;
  genre: string[];
  header_image: string;
  initialprice: string;
  languages: string;
  name: string;
  negative: number;
  owners: string;
  platforms: GamePlatforms
  positive: number;
  price: string;
  publisher: string;
  release_date: string;
  required_age: number;
  tags: Record<string, number>;
  type: string;
}

export type GameEntry = KaggleGame & {
  Completion: number;
  consensus_genre: string;
  "Down 30 Days": number;
  "Like Histogram": HistogramData[];
  "Meta Score": string | -1;
  "CCU Histogram": Record<string, number>;
  Rating: string;
  "User Score": number;
  "Up 30 Days": number;
  "Average Playtime - 2 Weeks": number;
  "Average Playtime - Forever": number;
  "Median Playtime - 2 Weeks": number;
  "Median Playtime - Forever": number;
}

export enum PopMetric {
  Likes,
  LikesRecent,
  Playtime,
  PlaytimeRecent,
  Owners
}

export type PopMetricData = {
  "Likes": number,
  "Recent Likes": number
  "Playtime": number
  "Recent Playtime": number
  "Owners": number
}

export type Distribution = {
  "mean": number,
  "std": number,
  "max": number,
  "min": number,
  "median": number,
  "10th": number,
  "20th": number,
  "25th": number,
  "30th": number,
  "40th": number,
  "50th": number,
  "60th": number,
  "70th": number,
  "75th": number
  "80th": number,
  "90th": number,
  "99th": number
}
