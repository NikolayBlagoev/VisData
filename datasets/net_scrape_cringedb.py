from bs4 import BeautifulSoup
from tqdm import trange
import urllib.request
import requests
import json
import time
import re  
import json
import time
import random 


class PROXY():
    def __init__(self, ip, cookie) -> None:
        self.ip = ip
        self.cookie = cookie
        pass
BASE_URL = "http://steamdb.info/app/"
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0',
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
'Cookie': 'cf_clearance=CBigcXlTNQrQnX23_bTxmpg5cntaPjLluwDl4cMoZ.o-1670716698-0-160; cf_chl_2=1ad36c7eed82855',
'Upgrade-Insecure-Requests': '1',
'Connection':'keep-alive'}
BATCHES = 28 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
COLD_START = 0 # First index to start requests from
PROCESS_COUNT = 400 # How many games to make requests for per batch
PROXIES = None
def create_url(inp: str) -> str :
    inp = inp.strip()
    inp = re.sub(" ","-",inp)
    inp = inp.lower()
    inp = re.sub("/[^a-z\d\?!\-]/","",inp)
    return inp
def get_game_info(appid, data_list):
    steamchart = BASE_URL + str(appid)+"/graphs/"
    page = urllib.request.Request(steamchart, headers=HEADERS)
    if PROXIES is not None:
        page.set_proxy(PROXIES,'https')
        page.set_proxy(PROXIES,'http')
    content = urllib.request.urlopen(page).read()
    # response = requests.get(steamchart, headers=HEADERS).text
    # print(response.content)
    
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
    print()
    print()
    print(entry)
    
    data_list.append(entry)
    time.sleep(0.1)
    return data_list
def make_attempt(appid,data_list):
    try:
        return get_game_info(appid,data_list)
    except BaseException as e:
        print()
        print()
        print(f'ERROR {BASE_URL+str(appid)}')
        print(e)
        time.sleep(600)
        # PROXIES = FreeProxy(https=True).get()
        # print(PROXIES)
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
            
            

        with open(f"cringedb/tmp_{start}-{start + (PROCESS_COUNT - 1)}.json", "w") as output_file:
            json.dump(data_list, output_file, indent=2)  
            time.sleep(600)     
