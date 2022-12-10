from bs4 import BeautifulSoup
from tqdm import trange
import urllib.request
import json
import time
import re  
import json
import time

BASE_URL = "http://steamcharts.com/app/"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'}
BATCHES = 56 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
COLD_START = 0 # First index to start requests from
PROCESS_COUNT = 1000 # How many games to make requests for per batch

def create_url(inp: str) -> str :
    inp = inp.strip()
    inp = re.sub(" ","-",inp)
    inp = inp.lower()
    inp = re.sub("/[^a-z\d\?!\-]/","",inp)
    return inp

if __name__ == "__main__":
    with open("data_set.json") as fl:
        processed_data = json.load(fl)

    for current_batch in trange(BATCHES):
        start = COLD_START + (current_batch * PROCESS_COUNT)
        data_list = []

        for game_idx in trange(start, start + PROCESS_COUNT,
                               desc=f"Fetching data for range [{start}-{start + (PROCESS_COUNT - 1)}]"):
            game = processed_data[game_idx]
            appid = game["appid"]
    
            steamchart = BASE_URL + str(appid)
            try:
                page = urllib.request.Request(steamchart, headers=HEADERS)
                content = urllib.request.urlopen(page).read()
                soup = BeautifulSoup(content, 'html.parser')
                # print(soup)
               
                
                # print(f"{peak}")
                # exit()
               
                try:
                    data = soup.findAll("div",{"class","app-stat"})
                    peak = -1
                    for d in data:
                        
                        if d.text.find("all-time peak")!= -1:
                            inf = d.text.split('\n')
                            prev = "-1"
                            for el in inf:
                                if el.find("all-time peak")!= -1:
                                    peak = int(prev)
                                    break
                                prev = el
                except KeyError:
                        peak = -1
                # print(data)
                entry = {
                    'appid' : appid,
                    'peak_count' : peak
                }
                data_list.append(entry)
            except BaseException as e:
                print()
                print(f'ERROR {BASE_URL+str(appid)}')
                print(e)
                entry = {
                    'appid' : appid,
                    'peak_count' : -1
                }
                data_list.append(entry)
                time.sleep(2)

        with open(f"steamcharts/tmp_{start}-{start + (PROCESS_COUNT - 1)}.json", "w") as output_file:
            json.dump(data_list, output_file, indent=2)  
            time.sleep(600)     
