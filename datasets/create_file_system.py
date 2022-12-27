import numpy as np
from bisect import bisect_left
from datetime import datetime, timedelta
from sklearn.cluster import AgglomerativeClustering
from os import getcwd, path, scandir
from pathlib import Path
from tqdm import tqdm
import json
import numpy as np
import utils


INTERPOLATE_STEAMSPY_DATES = True


class Fold(object):
    def __init__(self, smallest, largest, parent=None) -> None:
        self.smallest = smallest
        self.largest = largest
        self.parent = parent
        self.children: list[Fold] = []
        self.items = []
        pass


def _get_steamspy_ccus(file_count: int, file_end_point: int, rest_of_app_data: dict) -> dict[str, int]:
    """
    Gather all Steamspy CCU histogram data for a given game, interpolating if
    the appropriate flag is set

    Args:
        file_count: Starting index of the temp files in which the game's data is stored
        file_end_point: Upper bound of the tmp filename
        rest_of_app_data: Dict containing the data of the application as found in `data_set.json`

    Returns:
        Dict where keys are dates and values are CCU counts for that particular date
    """
    # Enumerate collected dates
    STEAMSPY_DATA_PATH = path.join(getcwd(), "steamspy")
    collected_dates = [f.name for f in scandir(STEAMSPY_DATA_PATH) if f.is_dir() and (f.name != "static_data")]
    date_folder_paths = [f.path for f in scandir(STEAMSPY_DATA_PATH) if f.is_dir() and (f.name != "static_data")]

    # Fetch existing data
    date_to_ccu: dict[str, int] = {}
    for date_folder in date_folder_paths:
        file_path = path.join(date_folder, f"tmp_{file_count}-{file_end_point}.json")
        with open(file_path, 'r') as temp_file:
                data = json.load(temp_file)
                for steamspy_data in data:
                    if steamspy_data["app_id"] == rest_of_app_data["appid"]:
                        date_to_ccu[steamspy_data["retrieval_date"]] = steamspy_data["ccu"]
                        break

    # Interpolate missing middle dates if desired 
    if INTERPOLATE_STEAMSPY_DATES:
        # Find earliest and latest start dates to interpolate values only within that range
        dates = []
        for date_folder in collected_dates:
            date = datetime.strptime(date_folder, "%Y-%m-%d").date()
            dates.append(date)
        min_date, max_date = min(dates), max(dates)

        num_days = ((max_date - min_date) + timedelta(days=1)).days
        all_dates = [min_date + timedelta(days=x) for x in range(num_days)]
        collected_dates_conv = sorted([datetime.strptime(date, "%Y-%m-%d").date() for date in collected_dates])
        for current_date in all_dates:
            # No interpolation needed if date already has data
            current_date_str = str(current_date)
            if current_date_str in date_to_ccu:
                continue

            # Find collected data for dates immediately before and after
            insert_position     = bisect_left(collected_dates_conv, current_date)
            first_before_date   = collected_dates_conv[insert_position - 1]
            first_after_date    = collected_dates_conv[insert_position]
            first_before_ccu    = date_to_ccu[str(first_before_date)]
            first_after_ccu     = date_to_ccu[str(first_after_date)]

            # Compute interpolation factor and interpolate
            dist_to_before                  = (current_date - first_before_date).days
            dist_to_after                   = (first_after_date - current_date).days
            before_interp_factor            = dist_to_before / (dist_to_before + dist_to_after)
            date_to_ccu[current_date_str]   = int(utils.linear_interp(first_before_ccu, first_after_ccu, before_interp_factor))

    return date_to_ccu

def split(f: Fold):
    intervals = (f.largest - f.smallest) / 5
    s = f.smallest
    for i in range(5):
        newf = Fold(s, s+intervals, f)
        f.children.append(newf)
        for it in f.items:
            if it["appid"] >= newf.smallest and it["appid"] < newf.largest:
                newf.items.append(it)
        s += intervals
    f.items = []


def add_item(f: Fold, it):
    if len(f.children) != 0:
        for child in f.children:
            if it["appid"] >= child.smallest and it["appid"] < child.largest:
                add_item(child, it)
                return
    f.items.append(it)
    if (len(f.items) > 25):
        split(f)


def make_dirs(f: Fold, prefix: str):
    if len(f.children) != 0:
        for child in f.children:
            make_dirs(child, prefix+f"{int(f.smallest)}-{int(f.largest)}/")
    else:
        fldr_nm = prefix+f"{int(f.smallest)}-{int(f.largest)}"
        Path(fldr_nm).mkdir(parents=True, exist_ok=True)
        for it in f.items:
            with open(fldr_nm+"/"+str(it["appid"])+".json", "w") as f:
                json.dump(it, f, indent=2, sort_keys=True)


def make_json(f: Fold):
    if len(f.children) != 0:
        return {"smallest": int(f.smallest), "largest": int(f.largest), "children": [make_json(ch) for ch in f.children]}
    else:
        return {"smallest": int(f.smallest), "largest": int(f.largest), "children": []}

dt = dict()
def likes_30_days_genre(game):
    rating = 0
    if d["Up 30 Days"] != 0:
        rating = d["Up 30 Days"]/(d["Up 30 Days"]+d["Down 30 Days"])
        
    for genre in game["genre"]:
        if not dt.get(genre):
            dt[genre] = [rating]
        else:
            dt[genre].append(rating)





if __name__ == "__main__":
    # Suppress scikit-learn warnings; TODO: Not this, this is horrible
    from warnings import simplefilter
    simplefilter(action='ignore', category=FutureWarning)

    parent = Fold(0, 2500000)
    a1 = Fold(0, 500000, parent)
    a2 = Fold(500000, 1000000, parent)
    a3 = Fold(1000000, 1500000, parent)
    a4 = Fold(1500000, 2000000, parent)
    a5 = Fold(2000000, 2500000, parent)
    parent.children.append(a1)
    parent.children.append(a2)
    parent.children.append(a3)
    parent.children.append(a4)
    parent.children.append(a5)

    with open("data_set.json") as fl:
        processed_data = json.load(fl)
    i = 0
    j = 0
    count = 1000 # Allows us to avoid the lines for loading an initial batch
    total_like_change = []
    minim = 100
    file_count = -1000 # Allows us to avoid the lines for loading an initial batch
    for d in tqdm(processed_data, desc="Collecting data"):
        # Fetch next 1000 games
        if count == 1000:
            count = 0
            file_count += 1000
            i = 0
            j = 0
            steamspy_end_point = min(file_count+999, len(processed_data) - 1)
            with open(f"normalised_likes/tmp_{int(file_count/10)}-{file_count+999}.json") as fl:
                norm = json.load(fl)
            with open(f"metareviews/tmp_{file_count}-{file_count+999}.json") as fl:
                meta = json.load(fl)
            with open(f"steamspy/static_data/tmp_{file_count}-{steamspy_end_point}.json") as fl:
                steamspy_static = json.load(fl)

        if d["appid"] > 0:
            d["Meta Score"]     = meta[j]["Meta Score"]
            d["User Score"]     = meta[j]["User Score"]
            d["Like Histogram"] = norm[i]["fixed_date"]

            # Steam Spy data
            d["Average Playtime - Forever"] = steamspy_static[j]["average_forever"]
            d["Average Playtime - 2 Weeks"] = steamspy_static[j]["average_2weeks"]
            d["Median Playtime - Forever"]  = steamspy_static[j]["median_forever"]
            d["Median Playtime - 2 Weeks"]  = steamspy_static[j]["median_2weeks"]
            d["CCU Histogram"]              = _get_steamspy_ccus(file_count, steamspy_end_point, d)

            acc_up = 0
            acc_down = 0
            for entr in norm[i]["fixed_date"]:
                acc_up += entr["recommendations_up"]
                acc_down += entr["recommendations_down"]
            d["Up 30 Days"] = acc_up
            d["Down 30 Days"] = acc_down

            total_like_change.append(
                {"appid": d["appid"], "acc_up": acc_up, "acc_down": acc_down, "genre": d["genre"]})
            if norm[i]["completion"] != -1 and len(norm[i]["completion"]) > 1:
                each_completed = [achvm_prog["percent"] for achvm_prog in norm[i]["completion"]]
                each_completed = [a for a in each_completed if a > 0]
                if len(each_completed) < 2:
                    d["Completion"] = -1
                else:
                    each_completed_cop = np.array(each_completed)

                    each_completed_cop = each_completed_cop.reshape(-1, 1)
                    model = AgglomerativeClustering(
                        linkage="ward", affinity="euclidean")
                    model.fit(each_completed_cop)
                    counter = 0
                    each_completed_cop = []
                    while counter < len(model.labels_) and model.labels_[counter] == model.labels_[0]:
                        each_completed_cop.append(each_completed[counter])
                        counter += 1

                    d["Completion"] = np.median(each_completed_cop)
            else:
                d["Completion"] = -1

            try:
                d["Rating"] = meta[j]["Rating"]
            except KeyError:
                d["Rating"] = "?"
            add_item(parent, d)
        i += 1
        j += 1
        count += 1

    print("Making system...")
    make_dirs(parent, "entries/")
    print("Made system")
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
            
    with open("like_intermediate.json", "w") as f:
        json.dump(total_like_change, f, indent=2)
