import json
import numpy as np
def get_std_median_likes_per_genre(raw):
    dt = dict()
    for game in raw:
        try:
            rating = game["positive"]/(game["positive"]+game["negative"])
        except ZeroDivisionError:
            rating = 0
        for genre in game["genre"]:
            if not dt.get(genre):
                dt[genre] = [rating]
            else:
                dt[genre].append(rating)
    # print(dt.keys())
    new_dt = dict()
    for k,v in dt.items():
        arr = np.array(v)
        arr.sort()
        new_dt[k]={"mean": arr.mean(), "std": arr.std(), "max": arr.max(), "min": arr.min(), "median": np.median(arr),
        "10th": np.percentile(arr,10),
        "20th": np.percentile(arr,20), "25th": np.percentile(arr,25), "30th": np.percentile(arr,30), 
        "40th": np.percentile(arr,40), "50th": np.percentile(arr,50),
        "60th": np.percentile(arr,60), "70th": np.percentile(arr,70), "75th": np.percentile(arr,75),
        "80th": np.percentile(arr,80), "90th": np.percentile(arr,90), "99th": np.percentile(arr,99)}
    with open("likes_genres.json","w") as f:
        json.dump(new_dt,f, indent=2)

def get_std_median_like_count_per_genre(raw):
    dt = dict()
    for game in raw:
        
        rating = game["positive"]+game["negative"]
        
        for genre in game["genre"]:
            if not dt.get(genre):
                dt[genre] = [rating]
            else:
                dt[genre].append(rating)
    # print(dt.keys())
    new_dt = dict()
    for k,v in dt.items():
        arr = np.array(v)
        arr.sort()
        new_dt[k]={"mean": str(arr.mean()), "std": str(arr.std()), "max": str(arr.max()), "min": str(arr.min()), "median": str(np.median(arr)),
        "10th": str(np.percentile(arr,10)),
        "20th": str(np.percentile(arr,20)), "25th": str(np.percentile(arr,25)), "30th": str(np.percentile(arr,30)), 
        "40th": str(np.percentile(arr,40)), "50th": str(np.percentile(arr,50)),
        "60th": str(np.percentile(arr,60)), "70th": str(np.percentile(arr,70)), "75th": str(np.percentile(arr,75)),
        "80th": str(np.percentile(arr,80)), "90th": str(np.percentile(arr,90)), "99th": str(np.percentile(arr,99))}
        
    with open("likes_count_genres.json","w") as f:
        json.dump(new_dt,f, indent=2)

with open("data_set.json") as fl:
    raw = json.load(fl)
    get_std_median_like_count_per_genre(raw)