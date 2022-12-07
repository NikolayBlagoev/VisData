from bs4 import BeautifulSoup
from tqdm import trange
import urllib.request
import json
import time
import re  
import json
import time

BASE_URL = "http://www.metacritic.com/game/pc/"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'}
BATCHES = 57 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
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
            name = game["name"]
    
            metacritic = BASE_URL + create_url(name)
            try:
                page = urllib.request.Request(metacritic, headers=HEADERS)
                content = urllib.request.urlopen(page).read()
                soup = BeautifulSoup(content, 'html.parser')

                data = json.loads(soup.find('script', type='application/ld+json').text)
                aggr_rating = -1
                content_rating = "?"
                try:
                    aggr_rating = data['aggregateRating']['ratingValue']
                    content_rating = data['contentRating']
                except KeyError:
                    aggr_rating = -1
                # print(data)
                entry = {
                    'Name' : name,
                    'Genre' : data['genre'],
                    'Meta Score' : aggr_rating,
                    'Rating': content_rating
                }
                data_list.append(entry)
            except BaseException as e:
                print()
                print(f'ERROR {BASE_URL+create_url(name)}')
                print(e)
                entry = {
                    'Name' : name,
                    'Genre' : "UNKNOWN",
                    'Meta Score' : -1
                }
                data_list.append(entry)
                time.sleep(2)

        with open(f"metareviews/tmp_{start}-{start + (PROCESS_COUNT - 1)}.json", "w") as output_file:
            json.dump(data_list, output_file, indent=2)  
            time.sleep(600)     
