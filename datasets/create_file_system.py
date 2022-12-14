import json

from pathlib import Path
class Fold(object):
    def __init__(self, smallest, largest, parent = None) -> None:
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
            newf = Fold(s,s+intervals,f)
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
    if(len(f.items) > 25):
        split(f)
    
def make_dirs(f: Fold, prefix: str):
    if len(f.children) != 0:
        for child in f.children:
            make_dirs(child, prefix+f"{int(f.smallest)}-{int(f.largest-1)}/")
    else:
        
        fldr_nm = prefix+f"{int(f.smallest)}-{int(f.largest-1)}"
        Path(fldr_nm).mkdir(parents=True, exist_ok=True)
        for it in f.items:
            with open(fldr_nm+"/"+str(it["appid"])+".json","w") as f:
                json.dump(it,f, indent=2)


parent = Fold(0,2500000)
a1 = Fold(0,500000, parent)
a2 = Fold(500000,1000000, parent)
a3 = Fold(1000000,1500000, parent)
a4 = Fold(1500000,2000000, parent)
a5 = Fold(2000000,2500000, parent)
parent.children.append(a1)
parent.children.append(a2)
parent.children.append(a3)
parent.children.append(a4)
parent.children.append(a5)
with open("data_set.json") as fl:
    processed_data = json.load(fl)
i = 0
j = 0
count = 0
with open("normalised_likes/tmp_0-999.json") as fl:
    norm = json.load(fl)
with open("metareviews/tmp_0-999.json") as fl:
    meta = json.load(fl)
minim = 100
for d in processed_data:
    if count == 1000:
        count = 0
        i = 0
        j = 0
        with open(f"normalised_likes/tmp_{int(i/10)}-{i+999}.json") as fl:
            norm = json.load(fl)
        with open(f"metareviews/tmp_{j}-{j+999}.json") as fl:
            meta = json.load(fl)
    
    d["Meta Score"] = meta[j]["Meta Score"]
    d["Like Histogram"] = norm[i]["fixed_date"]
    d["Completion"] = norm[i]["completion"]
    try:
        d["Rating"] = meta[j]["Rating"]
        
    except KeyError:
        d["Rating"] = "?"
    add_item(parent, d)
    i += 1
    count += 1
    j += 1
    # if d["appid"] < minim:
    #     minim = d["appid"]
# print(minim)
# exit()
make_dirs(parent,"entries/")