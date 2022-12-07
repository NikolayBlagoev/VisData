import json
import requests
from pprint import pprint

GAME_INDEX = 2819

if __name__ == "__main__":
    with open("data_set.json") as fl:
        processed_data = json.load(fl)
    
    game = processed_data[GAME_INDEX]
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
    
    pprint(entry, sort_dicts=False)
