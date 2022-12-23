from os import getcwd, path
from pathlib import Path
from typing import List, Tuple
from tqdm import tqdm
import json


OWNER_MAP = {
    '0 .. 20,000': 0,
    '20,000 .. 50,000': 0.5,
    '50,000 .. 100,000': 1,
    '100,000 .. 200,000': 2,
    '200,000 .. 500,000': 3,
    '500,000 .. 1,000,000': 4,
    '1,000,000 .. 2,000,000': 5,
    '2,000,000 .. 5,000,000' : 6,
    '5,000,000 .. 10,000,000': 7,
    '10,000,000 .. 20,000,000': 7.5,
    '20,000,000 .. 50,000,000': 8,
    '50,000,000 .. 100,000,000': 9,
    '100,000,000 .. 200,000,000': 9.5,
    '200,000,000 .. 500,000,000': 10
}
RAW_ATTRS = [
    # SteamSpy
    "Average Playtime - 2 Weeks", "Average Playtime - Forever",
    "Median Playtime - 2 Weeks", "Median Playtime - Forever",
    # Kaggle
    "positive", "negative", "owners", "price", "initialprice",
    "required_age", "Completion",
    # Metacritic
    "Meta Score", "User Score"
]
OUTPUT_FILENAMES_MAP = {
    # Need processing
    "like_percentage": "like_percentage", "ownership": "ownership",
    "Meta Score": "metacritic_score", "User Score": "metacritic_user_score",
    "Completion": "completion_percentage",
    # DO NOT need processing
    "Average Playtime - 2 Weeks": "avg_playtime_2_weeks",
    "Average Playtime - Forever": "avg_playtime_forever",
    "Median Playtime - 2 Weeks": "median_playtime_2_weeks",
    "Median Playtime - Forever": "median_playtime_forever",
    "price": "price_current", "initialprice": "price_no_discount",
    "required_age": "required_age"
}
ROOT_DIR = path.join(getcwd(), "entries")


def _collect_raw_data() -> Tuple[dict[str, List], List[int]]:
    """
    Collect raw data from search tree

    Returns:
        attrs_to_vals: Dict mapping from raw attribute names to a list of their values from all games
        app_ids: List of all app IDs collected in the same order as the attribute values 
    """
    attrs_to_vals = {attr: [] for attr in RAW_ATTRS}
    app_ids = []
    for path in tqdm(Path(ROOT_DIR).rglob('*.json'), desc="Collecting data (55,689 total)"):
        with open(path, "r") as game_file:
            game = json.load(game_file)
            app_ids.append(game["appid"])
            for attr in RAW_ATTRS:
                attrs_to_vals[attr].append(game[attr])
    return attrs_to_vals, app_ids


def _process_and_store(attrs_to_vals: dict[str, List], app_ids: List[int]):
    # Process likes to percentage
    attrs_to_vals["like_percentage"] = []
    for pos, neg in zip(attrs_to_vals["positive"], attrs_to_vals["negative"]):
        # Prevent division by zero
        if (pos == 0) and (neg == 0):
            attrs_to_vals["like_percentage"].append(0)
        else:
            like_percentage = round((pos / (pos + neg)) * 100, 2)
            attrs_to_vals["like_percentage"].append(like_percentage)

    # Process owners to numeric value
    attrs_to_vals["ownership"] = []
    for figure in attrs_to_vals["owners"]:
        attrs_to_vals["ownership"].append(OWNER_MAP[figure])

    # Remove processed data
    PROCESSED = ["positive", "negative", "owners"]
    [attrs_to_vals.pop(processed_item) for processed_item in PROCESSED]
    
    # Compute final data, removing pieces of data that can have placeholder values
    filtered_data = {label: {} for label in attrs_to_vals.keys()}
    for idx, app_id in enumerate(app_ids):
        for label in filtered_data:
            # Skip if invalid
            value = attrs_to_vals[label][idx]
            if value == -1:
                continue
            # If price, convert to number and divide by 100 to get decimal price
            if (label == "price") or (label == "initialprice"):
                value = int(value) / 100
            # If completion percentage, truncate to two decimal places
            if label == "Completion":
                value = round(value, 2)
            filtered_data[label][app_id] = value
    
    for label in filtered_data:
        output_filename = OUTPUT_FILENAMES_MAP[label]
        with open(f"{output_filename}.json", "w") as file:
            json.dump(filtered_data[label], file, indent=None, sort_keys=True)


if __name__ == "__main__":
    attrs_to_vals, app_ids = _collect_raw_data()
    _process_and_store(attrs_to_vals, app_ids)
