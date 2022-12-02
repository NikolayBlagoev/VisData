import json
import time
import requests
from tqdm import trange

BATCHES = 2 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
COLD_START = 20000 # First index to start requests from
PROCESS_COUNT = 1000 # How many games to make requests for per batch

if __name__ == "__main__":
    with open("data_set.json") as fl:
        processed_data = json.load(fl)

    for current_batch in trange(BATCHES):
        start = COLD_START + (current_batch * PROCESS_COUNT)
        data = []

        for game_idx in trange(start, start + PROCESS_COUNT,
                               desc=f"Fetching data for range [{start}-{start + (PROCESS_COUNT - 1)}]"):
            game = processed_data[game_idx]
            app_id = game["appid"]

            entry = dict()
            resp = requests.get(f"https://store.steampowered.com/appreviewhistogram/{app_id}")
            entry["histogram"] = resp.json()["results"]["recent"]
            resp = requests.get(f"http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid={app_id}")
            completion = 0
            try:
                completion = resp.json()["achievementpercentages"]["achievements"]
            except KeyError:
                completion = -1
            entry["completion"] = completion
            entry["pid"] = app_id
            data.append(entry)

        with open(f"tmp_{start}-{start + (PROCESS_COUNT - 1)}.json", "w") as output_file:
            json.dump(data, output_file, indent=2)  
            time.sleep(600)     
