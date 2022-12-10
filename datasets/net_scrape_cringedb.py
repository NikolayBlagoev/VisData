from bs4 import BeautifulSoup
from tqdm import trange
import urllib.request
import json
import time
import re  
import json
import time

BASE_URL = "http://steamdb.info/app/"
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0',
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
'Cookie': 'cf_clearance=4ytoWH01u2FLBl8nDF1PSrEdEaKsaPPi8_Yg75H5Pmc-1670685728-0-160; cf_chl_2=21319eda1002ea0; __cf_bm=VRS5SwqkQis7fjDj95UJ4tHgvbvlmVE7nJckqlJZuLc-1670685728-0-AayMWjrSOicvUVf4z+30mWcwmMZRDvS8dONjsO0XCAVKGmXxj3bNDbLpONvG+9VparIrW8mi6sVtiXJgzz8cn6A=',
'Upgrade-Insecure-Requests': '1',
'Connection':'keep-alive'}
BATCHES = 28 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
COLD_START = 0 # First index to start requests from
PROCESS_COUNT = 1000 # How many games to make requests for per batch

def create_url(inp: str) -> str :
    inp = inp.strip()
    inp = re.sub(" ","-",inp)
    inp = inp.lower()
    inp = re.sub("/[^a-z\d\?!\-]/","",inp)
    return inp
def get_game_info(appid, data_list):
    steamchart = BASE_URL + str(appid)+"/graphs/"
    page = urllib.request.Request(steamchart, headers=HEADERS)
    content = urllib.request.urlopen(page).read()
    soup = BeautifulSoup(content, 'html.parser')    
                   
    try:
        data = soup.findAll("li")
        peak = -1
        for d in data:                
            if d.text.find("all-time peak")!= -1:
                peak = d.findChild().text
                break
    except KeyError:
        peak = -1
                # print(f'appid: {appid} has peak: {peak}')
    entry = {
        'appid' : appid,
        'peak_count' : peak
    }
    data_list.append(entry)
    time.sleep(0.005)
    return data_list
def make_attempt(appid,data_list):
    try:
        return get_game_info(appid,data_list)
    except BaseException as e:
        print()
        print()
        print(f'ERROR {BASE_URL+str(appid)}')
        print(e)
        time.sleep(30)
        return make_attempt(appid,data_list)
    
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
            data_list = make_attempt(appid,data_list)
            
            

        with open(f"steamcharts/tmp_{start}-{start + (PROCESS_COUNT - 1)}.json", "w") as output_file:
            json.dump(data_list, output_file, indent=2)  
            time.sleep(600)     
