import json
import time
import requests

with open("steam_games.json") as fl:
    raw = json.load(fl)
dt = []
max = -1

batch = 1000
# Take only games:
for field in raw:
    entry = raw[field]
    if entry["type"]== "game":
        print(batch)
        

        

        entry = dict()
        resp =requests.get("https://store.steampowered.com/appreviewhistogram/"+field)
        # http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=440
        # print(resp.json()["results"])
        entry["histogram"] = resp.json()["results"]["recent"]
        resp = requests.get("http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid="+field)
        completion = 0
        try:
            completion = resp.json()["achievementpercentages"]["achievements"]
        except KeyError:
            completion = -1
        entry["completion"] = completion
        entry["pid"] = field
        dt.append(entry)
        # print(entry)
        batch-=1
        if batch == 0:
            with open("tmp1.json","w") as f:
                json.dump(dt,f, indent=2)
            # time.sleep(0.00001)
            exit()
            
        # exit()
