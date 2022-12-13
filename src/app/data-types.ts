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
  tags: Record<string, number>;                  // Expand this
  type: string;
}

export type GamePlatforms = {
  linux: boolean;
  mac: boolean;
  windows: boolean;
}
