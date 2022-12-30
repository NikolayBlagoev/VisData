import { GameEntry, KaggleGame } from "./data-types";

export function supportToIconName(isSupported: boolean) { return isSupported ? "check" : "close"; }

export function extractGameName(game: KaggleGame) { return game?.name; }

export function formatOwnersAmount(amount: number) {
    let ownersThis;
    if (amount < 1000) { ownersThis = amount; }
    else if (amount < 1000000) { ownersThis = Math.round(amount / 1000) + "k"; }
    else { ownersThis = Math.round(amount / 1000000) + "M"; }
    return ownersThis;
}

export function calculateDataThisGame(entry: GameEntry) {
    return {
        "Likes": entry.positive / (entry.positive + entry.negative),
        "Recent Likes":entry["Up 30 Days"] / (entry["Up 30 Days"] + entry["Down 30 Days"]),
        "Playtime": entry["Average Playtime - Forever"],
        "Recent Playtime": entry["Average Playtime - 2 Weeks"],
        "Owners": parseInt(entry.owners.split(" .. ")[0].replaceAll(",", "")),
    };
}
