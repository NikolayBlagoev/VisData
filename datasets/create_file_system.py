from sklearn.cluster import AgglomerativeClustering
from pathlib import Path
import json
import numpy as np


class Fold(object):
    def __init__(self, smallest, largest, parent=None) -> None:
        self.smallest = smallest
        self.largest = largest
        self.parent = parent
        self.children: list[Fold] = []
        self.items = []
        pass


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
            make_dirs(child, prefix+f"{int(f.smallest)}-{int(f.largest-1)}/")
    else:
        fldr_nm = prefix+f"{int(f.smallest)}-{int(f.largest-1)}"
        Path(fldr_nm).mkdir(parents=True, exist_ok=True)
        for it in f.items:
            with open(fldr_nm+"/"+str(it["appid"])+".json", "w") as f:
                json.dump(it, f, indent=2)


def make_dirs(f: Fold, prefix: str):
    if len(f.children) != 0:
        for child in f.children:
            make_dirs(child, prefix+f"{int(f.smallest)}-{int(f.largest)}/")
    else:
        fldr_nm = prefix+f"{int(f.smallest)}-{int(f.largest)}"
        Path(fldr_nm).mkdir(parents=True, exist_ok=True)
        for it in f.items:
            with open(fldr_nm+"/"+str(it["appid"])+".json", "w") as f:
                json.dump(it, f, indent=2)


def make_json(f: Fold):
    if len(f.children) != 0:
        return {"smallest": int(f.smallest), "largest": int(f.largest), "children": [make_json(ch) for ch in f.children]}
    else:
        return {"smallest": int(f.smallest), "largest": int(f.largest), "children": []}


if __name__ == "__main__":
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
    with open("normalised_likes/tmp_0-999.json") as fl:
        norm = json.load(fl)
    with open("metareviews/tmp_0-999.json") as fl:
        meta = json.load(fl)
    
    i = 0
    j = 0
    count = 0
    total_like_change = []
    minim = 100
    file_count = 0
    for d in processed_data:
        if count == 1000:
            count = 0
            i = 0
            j = 0
            with open(f"normalised_likes/tmp_{int(file_count/10)}-{file_count+999}.json") as fl:
                norm = json.load(fl)
            with open(f"metareviews/tmp_{file_count}-{file_count+999}.json") as fl:
                meta = json.load(fl)

        if d["appid"] > 0:
            d["Meta Score"] = meta[j]["Meta Score"]
            d["User Score"] = meta[j]["User Score"]
            d["Like Histogram"] = norm[i]["fixed_date"]

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
        file_count += 1

    make_dirs(parent, "entries/")
    print("Made system")

    with open("like_intermediate.json", "w") as f:
        json.dump(total_like_change, f, indent=2)
