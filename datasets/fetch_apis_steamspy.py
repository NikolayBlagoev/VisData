import json
import requests
from datetime import date
from os import getcwd, mkdir, path
from tqdm import trange

BATCHES = 56 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
COLD_START = 0 # First index to start requests from
PROCESS_COUNT = 1000 # How many games to make requests for per batch

CWD = getcwd()
TARGET_DIR = "steamspy"
TODAY_STR = str(date.today())

if __name__ == "__main__":
    # Create destination directory if it does not exist
    dst_dir = path.join(CWD, TARGET_DIR, TODAY_STR)
    if not path.exists(dst_dir):
        mkdir(dst_dir)

    with open("data_set.json") as fl:
        processed_data = json.load(fl)

    for current_batch in trange(BATCHES):
        start = COLD_START + (current_batch * PROCESS_COUNT)
        end = min(start + PROCESS_COUNT, len(processed_data))
        data = []

        for game_idx in trange(start, end,
                               desc=f"Fetching data for range [{start}-{end - 1}]"):
            game = processed_data[game_idx]
            app_id = game["appid"]

            entry = dict()
            resp = requests.get(f"https://steamspy.com/api.php?request=appdetails&appid={app_id}")
            entry["app_id"] = app_id
            entry["ccu"] = resp.json()["ccu"]
            entry["retrieval_date"] = TODAY_STR
            data.append(entry)

        with open(f"{TARGET_DIR}/{TODAY_STR}/tmp_{start}-{end - 1}.json", "w") as output_file:
            json.dump(data, output_file, indent=2)  
            