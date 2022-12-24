import { LineData } from "./line/lineData";

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
  "CCU Histogram": any[];
  Rating: string;
  "User Score": number;
  "Up 30 Days": number;
}

