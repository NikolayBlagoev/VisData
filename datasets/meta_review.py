import json
with open("metacritic_games.json") as fp:
    raw = json.load(fp)
dt = {}
for field in raw:
    print(field)
for field in raw["metascore"]:
    score = raw["metascore"][field]
    name = raw["name"][field]
    dt[name] = {"score": score, "rating": raw["rating"][field]}
with open("metascores.json","w") as f:
    json.dump(dt,f, indent=2)