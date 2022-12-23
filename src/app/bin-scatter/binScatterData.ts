export interface Point {
    x: number,
    y: number
}

export const availableNumerics: Array<string> = [
    // SteamSpy
    "Average Playtime - 2 Weeks", "Average Playtime - Forever",
    "Median Playtime - 2 Weeks", "Median Playtime - Forever",
    // Kaggle
    "Like Percentage", "Ownership", "Price (Current)", "Price (No Discount)",
    "Required Age", "Completion Percentage",
    // Metacritic
    "Metacritic Score", "Metacritic User Score"
];

export const numericsFiles: Array<string> = [
    // SteamSpy
    "avg_playtime_2_weeks.json", "avg_playtime_forever.json",
    "median_playtime_2_weeks.json", "median_playtime_forever.json",
    // Kaggle
    "like_percentage.json", "ownership.json", "price_current.json", "price_no_discount.json",
    "required_age.json", "completion_percentage.json",
    // Metacritic
    "metacritic_score.json", "metacritic_user_score.json"
];
