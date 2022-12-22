from bs4 import BeautifulSoup
from os import getcwd, path, scandir
from time import sleep
from tqdm import tqdm, trange
import urllib.request
import json
import re
import utils

# General parameters
BASE_URL = "http://www.metacritic.com/game/pc/"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'}
METACRITIC_DIR = path.join(getcwd(), "metareviews")

# Scraper parameters
BATCHES = 1 # Number of batches to process; Final number of requests is (BATCHES * PROCESS_COUNT); Each batch results in one JSON file
COLD_START = 55000 # First index to start requests from
PROCESS_COUNT = 690 # How many games to make requests for per batch


def create_url(inp: str) -> str :
    inp = inp.strip()
    inp = re.sub(" ","-",inp)
    inp = inp.lower()
    inp = re.sub("/[^a-z\d\?!\-]/","",inp)
    inp = inp.replace(":", "")
    return inp


def scrape_metacritic():
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
                sleep(1)

        with open(f"metareviews/tmp_{start}-{start + (PROCESS_COUNT - 1)}.json", "w") as output_file:
            json.dump(data_list, output_file, indent=2)  
            sleep(600)  


def _fetch_user_score(game_name: str) -> float:
    request_url = BASE_URL + create_url(game_name)
    try:
        anchor_href = f"/game/pc/{create_url(game_name)}/user-reviews"
        page = urllib.request.Request(request_url, headers=HEADERS)
        content = urllib.request.urlopen(page).read()
        soup = BeautifulSoup(content, 'html.parser')

        user_score_anchor = soup.find('a', class_="metascore_anchor", href=anchor_href)
        if user_score_anchor is None:
            return -1
        user_score = user_score_anchor.find('div').text
        if (user_score is None) or not (user_score.isnumeric()):
            return -1
        return float(user_score)

    # Metacritic crapped out on us, retry
    except BaseException as e:
        print(f'===== ERROR {BASE_URL + create_url(game_name)} =====')
        print(f"GAME NAME: {game_name}")
        print(e)
        sleep(2)
        return _fetch_user_score(game_name)


def add_user_scores():
    # Load game data to cross-reference app-id with name
    with open("data_set.json") as steam_data_file:
        steam_data = json.load(steam_data_file)

    steam_data_offset = 0
    for file_path in tqdm(sorted(scandir(METACRITIC_DIR), key=utils.fetch_tmp_start_idx_as_int)):
        with open(file_path, 'r+') as temp_file:
            data = json.load(temp_file)
            for idx, metacritic_datum in enumerate(tqdm(data)):
                # Only request user score if game already has a meta score; Placeholder data otherwise
                if metacritic_datum["Meta Score"] != -1:
                    game_name = steam_data[idx + steam_data_offset]["name"]
                    metacritic_datum["User Score"] = _fetch_user_score(game_name)
                    sleep(2)
                else:
                    metacritic_datum["User Score"] = -1
                data[idx] = metacritic_datum
            temp_file.seek(0)
            json.dump(data, temp_file, indent=2, sort_keys=True)  
            temp_file.truncate()
        steam_data_offset += 1000


if __name__ == "__main__":
    # scrape_metacritic()
    add_user_scores()
