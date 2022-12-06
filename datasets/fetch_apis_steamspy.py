import json
import requests
from datetime import date
from tqdm import trange

BATCHES = 2 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
COLD_START = 0 # First index to start requests from
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
            resp = requests.get(f"https://steamspy.com/api.php?request=appdetails&appid={app_id}")
            entry["app_id"] = app_id
            entry["ccu"] = resp.json()["ccu"]
            entry["retrieval_date"] = str(date.today())
            data.append(entry)

        with open(f"steamspy/tmp_{start}-{start + (PROCESS_COUNT - 1)}.json", "w") as output_file:
            json.dump(data, output_file, indent=2)  
            