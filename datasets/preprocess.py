import json
import time
import requests

with open("steam_games.json") as fl:
    raw = json.load(fl)
dt = []
max = -1
total_genres = dict()
total_tags = dict()
batch = 5000
# Take only games:
for field in raw:
    entry = raw[field]
    if entry["type"]== "game":
        # REMOVE UNNECESSARY FIELDS
        del entry["short_description"]
        del entry["website"]

        # MAKE GENRE ARRAY CUZ WHY TF IT AINT?!?!
        genre = entry["genre"].split(',')
        genre = [g.strip() for g in genre]
        del entry["genre"]
        entry["genre"] = genre

        # GET TOTAL GENRE OVERVIEW
        for g in genre:
            if not total_genres.get(g):
                total_genres[g] = 1
            else:
                total_genres[g] += 1
        
        # GET TOTAL TAGS AND CREATE CONSENSUS GENRE!
        consesus_genre = ""
        max_count = -1
        for t,v in entry["tags"].items():
            if v>max_count and t in genre:
                consesus_genre = t
                max_count = v
            if not total_tags.get(t):
                total_tags[t] = 1
            else:
                total_tags[t] += 1
        entry["consensus_genre"] = consesus_genre 
        # resp =requests.get("https://store.steampowered.com/appreviewhistogram/"+field)
        # http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=440
        # print(resp.json()["results"])
        # entry["histogram"] = resp.json()["results"]["recent"]
        # resp = requests.get("http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid="+field)
        # completion = 0
        # try:
        #     completion = resp.json()["achievementpercentages"]["achievements"]
        # except KeyError:
        #     completion = -1
        # entry["completion"] = completion
        dt.append(entry)
        # print(entry)
        batch-=1
        if batch == 0:
            # time.sleep(0.00001)
            batch = 32
        # exit()

print(total_genres)
print(total_tags)
t = dt[0]
print(t)

with open("top_tags.json","w") as f:
    json.dump(total_tags,f, indent=2)
with open("top_genres.json","w") as f:
    json.dump(total_genres,f, indent=2)
with open("data_set.json","w") as f:
    json.dump(dt,f, indent=2)
# for field in t:
#     print(field)


