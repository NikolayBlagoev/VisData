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
        
        rating = game["positive"]
        
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

def get_count_price(raw):
    dt = {"free": 0, "0-99": 0,"100-499": 0 ,"500-999": 0,  "1000-1999": 0, "2000-2999": 0,"3000-4999": 0, "5000-5999": 0, "6000-9999": 0, "10000+": 0}
    for game in raw:
        
        price = int(game["price"])
        if price == 0:
            dt["free"] += 1
        elif price < 100:
            dt["0-99"] += 1
        elif price < 500:
            dt["100-499"] += 1
        elif price<1000:
            dt["500-999"] += 1
        elif price < 2000:
            dt["1000-1999"] += 1
        elif price < 3000:
            dt["2000-2999"] += 1
        elif price < 5000:
            dt["3000-4999"] += 1
        elif price < 6000:
            dt["5000-5999"] += 1
        elif price < 10000:
            dt["6000-9999"] += 1
        else:
            dt["10000+"] += 1
   
    with open("price_counts.json","w") as f:
        json.dump(dt,f, indent=2)

def get_std_median_likes_total(raw):
    dt = {"root": []}
    for game in raw:
        try:
            rating = game["positive"]/(game["positive"]+game["negative"])
        except ZeroDivisionError:
            rating = 0
        dt["root"].append(rating)
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
    with open("total_likes.json","w") as f:
        json.dump(new_dt,f, indent=2)

def get_std_median_likes_last_30_days(raw):
    dt = {"root": []}
    for game in raw:
        try:
            rating = game["acc_up"]/(game["acc_up"]+game["acc_down"])
        except ZeroDivisionError:
            rating = 0
        dt["root"].append(rating)
    # print(dt.keys())
    # new_dt = dict()
    # for k,v in dt.items():
    arr = np.array(dt["root"])
    # arr.sort()
    new_dt={"mean": arr.mean(), "std": arr.std(), "max": arr.max(), "min": arr.min(), "median": np.median(arr),
        "10th": np.percentile(arr,10),
        "20th": np.percentile(arr,20), "25th": np.percentile(arr,25), "30th": np.percentile(arr,30), 
        "40th": np.percentile(arr,40), "50th": np.percentile(arr,50),
        "60th": np.percentile(arr,60), "70th": np.percentile(arr,70), "75th": np.percentile(arr,75),
        "80th": np.percentile(arr,80), "90th": np.percentile(arr,90), "99th": np.percentile(arr,99)}
    with open("30_days_likes.json","w") as f:
        json.dump(new_dt,f, indent=2)

def get_std_median_like_count_30_days_per_genre(raw):
    dt = dict()
    for game in raw:
        
        rating = game["acc_up"]
        
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

def get_std_median_like_count_last_30_days(raw):
    dt = {"root": []}
    for game in raw:
        try:
            rating = game["acc_up"]
        except ZeroDivisionError:
            rating = 0
        dt["root"].append(rating)
    # print(dt.keys())
    new_dt = dict()
    for k,v in dt.items():
        arr = np.array(v)
        arr.sort()
        new_dt[k]={"mean": arr.mean(), "std": arr.std(), "max": str(arr.max()), "min": str(arr.min()), "median": np.median(arr),
        "10th": np.percentile(arr,10),
        "20th": np.percentile(arr,20), "25th": np.percentile(arr,25), "30th": np.percentile(arr,30), 
        "40th": np.percentile(arr,40), "50th": np.percentile(arr,50),
        "60th": np.percentile(arr,60), "70th": np.percentile(arr,70), "75th": np.percentile(arr,75),
        "80th": np.percentile(arr,80), "90th": np.percentile(arr,90), "99th": np.percentile(arr,99)}
    with open("30_days_like_count.json","w") as f:
        json.dump(new_dt,f, indent=2)

def get_ownership_counts(raw):
    dt = {"0-20,000": 0, "20,000-50,000": 0,"100-499": 0 ,"500-999": 0,  "1000-1999": 0, "2000-2999": 0,"3000-4999": 0, "5000-5999": 0, "6000-9999": 0, "10000+": 0}
    arr = []
    
    for game in raw:
        arr.append(int(game["owners"].split("..")[0].strip().replace(",","")))
    arr = np.array(arr)
    new_dt={"mean": arr.mean(), "std": arr.std(), "max": str(arr.max()), "min": str(arr.min()), "median": np.median(arr),
        "10th": np.percentile(arr,10),
        "20th": np.percentile(arr,20), "25th": np.percentile(arr,25), "30th": np.percentile(arr,30), 
        "40th": np.percentile(arr,40), "50th": np.percentile(arr,50),
        "60th": np.percentile(arr,60), "70th": np.percentile(arr,70), "75th": np.percentile(arr,75),
        "80th": np.percentile(arr,80), "90th": np.percentile(arr,90), "99th": np.percentile(arr,99)}
    with open("owners_aggregate.json","w") as f:
        json.dump(new_dt,f, indent=2)
    # print(np.unique(np.array(arr)))
    # print(len(np.unique(np.array(arr))))

with open("data_set.json") as fl:
    raw = json.load(fl)
    get_ownership_counts(raw)