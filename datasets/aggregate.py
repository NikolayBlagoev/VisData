from bisect import bisect_left
from datetime import datetime, timedelta
from os import getcwd, path, scandir
from tqdm import tqdm
import json
import numpy as np
import utils


INTERPOLATE_DATES = True


# ========== CORE STEAM KAGGLE DATASET DATA ==========
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

    arr = np.array(dt["root"])
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
        json.dump(new_dt, f, indent=2)


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


# ========== STEAMSPY DATA ==========
def get_stats_steamspy_static():
    # Gather all data points together
    STEAMSPY_STATIC_DATA_PATH = path.join(getcwd(), "steamspy", "static_data")
    avg_forever = []
    avg_2_weeks = []
    median_forever = []
    median_2_weeks = []
    for file_path in scandir(STEAMSPY_STATIC_DATA_PATH):
        with open(file_path, 'r') as file:
            data = json.load(file)
            for game in data:
                avg_forever.append(game["average_forever"])
                avg_2_weeks.append(game["average_2weeks"])
                median_forever.append(game["median_forever"])
                median_2_weeks.append(game["median_2weeks"])

    # Convert data to numpy arrays and compute statistics
    data_points = [avg_forever, avg_2_weeks, median_forever, median_2_weeks]
    key_names = ["avg_forever", "avg_2_weeks", "median_forever", "median_2_weeks"]
    aggregates = {}
    for dp_num in range(len(data_points)):
        dp_arr = np.array(data_points[dp_num])
        key_name = key_names[dp_num]
        dp_aggregates = {
        "mean": dp_arr.mean(), "std": dp_arr.std(), "median": np.median(dp_arr),
        "max": float(dp_arr.max()), "min": float(dp_arr.min()),
        "10th": np.percentile(dp_arr, 10),
        "20th": np.percentile(dp_arr, 20), "25th": np.percentile(dp_arr, 25), "30th": np.percentile(dp_arr, 30), 
        "40th": np.percentile(dp_arr, 40), "50th": np.percentile(dp_arr, 50),
        "60th": np.percentile(dp_arr, 60), "70th": np.percentile(dp_arr, 70), "75th": np.percentile(dp_arr, 75),
        "80th": np.percentile(dp_arr, 80), "90th": np.percentile(dp_arr, 90), "99th": np.percentile(dp_arr, 99)}
        aggregates[key_name] = dp_aggregates

    # Store aggregates
    with open("steamspy_static.json","w") as file:
        json.dump(aggregates, file, indent=2)


def get_stats_steamspy_static_per_genre():
    # Compute set of all genres for use as keys in stats dict
    with open("data_set.json") as steam_data_file:
        steam_data = json.load(steam_data_file)
    genre_set = utils.compute_genre_set(steam_data)

    # Acquire genre info on per game basis
    STEAMSPY_STATIC_DATA_PATH = path.join(getcwd(), "steamspy", "static_data")
    genre_data_points = {genre: {"avg_forever": [], "avg_2_weeks": [], "median_forever": [], "median_2_weeks": []} 
                        for genre in genre_set}
    steam_data_offset = 0
    for file_path in sorted(scandir(STEAMSPY_STATIC_DATA_PATH), key=utils.fetch_tmp_start_idx_as_int):
        with open(file_path, 'r') as temp_file:
            data = json.load(temp_file)
            for idx, steamspy_data in enumerate(data):
                kaggle_data = steam_data[idx + steam_data_offset]
                for genre in kaggle_data["genre"]:
                    genre_data_points[genre]["avg_forever"].append(steamspy_data["average_forever"])
                    genre_data_points[genre]["avg_2_weeks"].append(steamspy_data["average_2weeks"])
                    genre_data_points[genre]["median_forever"].append(steamspy_data["median_forever"])
                    genre_data_points[genre]["median_2_weeks"].append(steamspy_data["median_2weeks"])
        steam_data_offset += 1000

    # Convert data to numpy arrays and compute statistics
    key_names = ["avg_forever", "avg_2_weeks", "median_forever", "median_2_weeks"]
    aggregates = {}
    for genre in genre_set:
        aggregates[genre] = {}
        for key_name in key_names:
            dp_arr = np.array(genre_data_points[genre][key_name])
            dp_aggregates = {
            "mean": dp_arr.mean(), "std": dp_arr.std(), "median": np.median(dp_arr),
            "max": float(dp_arr.max()), "min": float(dp_arr.min()),
            "10th": np.percentile(dp_arr, 10),
            "20th": np.percentile(dp_arr, 20), "25th": np.percentile(dp_arr, 25), "30th": np.percentile(dp_arr, 30), 
            "40th": np.percentile(dp_arr, 40), "50th": np.percentile(dp_arr, 50),
            "60th": np.percentile(dp_arr, 60), "70th": np.percentile(dp_arr, 70), "75th": np.percentile(dp_arr, 75),
            "80th": np.percentile(dp_arr, 80), "90th": np.percentile(dp_arr, 90), "99th": np.percentile(dp_arr, 99)}
            aggregates[genre][key_name] = dp_aggregates

    # Store aggregates
    with open("steamspy_static_per_genre.json","w") as file:
        json.dump(aggregates, file, indent=2, sort_keys=True)


def get_stats_steamspy_ccu_per_genre():
    # Compute set of all genres for use as keys in stats dict
    with open("data_set.json") as steam_data_file:
        steam_data = json.load(steam_data_file)
    genre_set = utils.compute_genre_set(steam_data)

    # Enumerate collected dates
    STEAMSPY_DATA_PATH = path.join(getcwd(), "steamspy")
    collected_dates = [f.name for f in scandir(STEAMSPY_DATA_PATH) if f.is_dir() and (f.name != "static_data")]
    date_folder_paths = [f.path for f in scandir(STEAMSPY_DATA_PATH) if f.is_dir() and (f.name != "static_data")]

    # Fetch existing data
    genre_ccus_by_date = {genre: {date: [] for date in collected_dates}
                        for genre in genre_set}
    for date_folder in tqdm(date_folder_paths, desc="Fetching collected data"):
        steam_data_offset = 0
        for file_path in sorted(scandir(date_folder), key=utils.fetch_tmp_start_idx_as_int):
            with open(file_path, 'r') as temp_file:
                data = json.load(temp_file)
                for idx, steamspy_data in enumerate(data):
                    kaggle_data = steam_data[idx + steam_data_offset]
                    for genre in kaggle_data["genre"]:
                        genre_ccus_by_date[genre][steamspy_data["retrieval_date"]]\
                        .append(steamspy_data["ccu"])
            steam_data_offset += 1000
    
    # Convert data to numpy arrays and compute statistics
    aggregates = {genre: {date: dict() for date in collected_dates}
                  for genre in genre_set}
    for genre in tqdm(genre_set, desc="Computing genre statistics"):
        for date in collected_dates:
            dp_arr = np.array(genre_ccus_by_date[genre][date])
            dp_aggregates = {
            "mean": dp_arr.mean(), "std": dp_arr.std(), "median": np.median(dp_arr),
            "max": float(dp_arr.max()), "min": float(dp_arr.min()),
            "10th": np.percentile(dp_arr, 10),
            "20th": np.percentile(dp_arr, 20), "25th": np.percentile(dp_arr, 25), "30th": np.percentile(dp_arr, 30), 
            "40th": np.percentile(dp_arr, 40), "50th": np.percentile(dp_arr, 50),
            "60th": np.percentile(dp_arr, 60), "70th": np.percentile(dp_arr, 70), "75th": np.percentile(dp_arr, 75),
            "80th": np.percentile(dp_arr, 80), "90th": np.percentile(dp_arr, 90), "99th": np.percentile(dp_arr, 99)}
            aggregates[genre][date] = dp_aggregates

    # Interpolate missing middle dates if desired
    if INTERPOLATE_DATES:
        # Find earliest and latest start dates to interpolate values only within that range
        dates = []
        for date_folder in collected_dates:
            date = datetime.strptime(date_folder, "%Y-%m-%d").date()
            dates.append(date)
        min_date, max_date = min(dates), max(dates)

        num_days = ((max_date - min_date) + timedelta(days=1)).days
        all_dates = [min_date + timedelta(days=x) for x in range(num_days)]
        collected_dates_conv = sorted([datetime.strptime(date, "%Y-%m-%d").date() for date in collected_dates])
        for current_date in tqdm(all_dates, desc="Interpolating data for missing dates"):
            current_date_str = str(current_date)
            for genre in genre_set:
                # Only check the first genre because the date is present or not in ALL of them
                if current_date_str in aggregates[genre]:
                    break

                # Find collected data for dates immediately before and after
                insert_position     = bisect_left(collected_dates_conv, current_date)
                first_before_date   = collected_dates_conv[insert_position - 1]
                first_after_date    = collected_dates_conv[insert_position]
                first_before        = aggregates[genre][str(first_before_date)]
                first_after         = aggregates[genre][str(first_after_date)]

                # Compute interpolation factor
                dist_to_before          = current_date - first_before_date
                dist_to_after           = first_after_date - current_date
                before_interp_factor    = dist_to_before / (dist_to_before + dist_to_after)

                # Interpolate all quantities
                aggregates[genre][current_date_str] = {}
                for quantity in first_before:
                    aggregates[genre][current_date_str][quantity] = utils.linear_interp(
                        first_before[quantity], first_after[quantity], before_interp_factor)

    # Store aggregates
    with open("steamspy_daily_ccu_per_genre.json", "w") as file:
        json.dump(aggregates, file, indent=2, sort_keys=True)


if __name__ == "__main__":
    # Core Steam data
    with open("data_set.json") as fl:
        raw = json.load(fl)
        get_std_median_likes_per_genre(raw)
        get_std_median_like_count_per_genre(raw)
        get_count_price(raw)
        get_std_median_likes_total(raw)
        get_std_median_likes_last_30_days(raw)
        get_std_median_like_count_30_days_per_genre(raw)
        get_std_median_likes_last_30_days(raw)
        get_ownership_counts(raw)

    # SteamSpy data
    get_stats_steamspy_static()
    get_stats_steamspy_static_per_genre()
    get_stats_steamspy_ccu_per_genre()
