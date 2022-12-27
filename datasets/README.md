# Data Collection and Preprocessing
## Directory Structure
### Data Files
- `data_set.json` - Processed version of the core dataset from Kaggle
- `metascores.json` - Score and ESRB rating of all games that could be found on Metacritic
- `steam_games.json` - Core dataset from Kaggle

### Scripts
- `aggregate.py` - Contains code related to aggregating data from `data_set.json` or `likes_intermediate.json`
- `collect_numeric_data.py` - Creates a JSON file for each piece of numeric data (that could feasibly be plotted on a scatter plot) for all games. Additionally, culls values above a certain threshold as the underlying datasets were found to have a significant number of outliers that negatively impact visualisation potential
- `create_file_system.py` - Creates a unique file for each game, which contains all the information about it and puts it in the indexed tree
- `fetch_apis_steam.py` - Collects achievement and recent likes from Steam API
- `fetch_apis_steamspy.py` - Collects data from the SteamSpy API. Used to collect CCU numbers over time as well as average and median playtime over the past 2 weeks and forver
- `inspect_api_steam.py` - Used to debug data fetching from the Steam API
- `like_normaliser.py` - Keeps recent likes only for the month of November (since some game's recent likes may be in previous months as they have not had any activity recently)
- `meta_review.py` - Processes raw Metacritic data and generates mapping from game name to score and ESRB rating
- `net_scrape_cringedb.py` - Scrapes data from SteamDB (NOT USED IN FINAL DATASET DUE TO ANTI WEB-SCRAPING MEASURES)
- `net_scrape_metacritic.py` - Collects metacritic, user scores, and game ratings (by the ESRB system) from Metacritic
- `net_scrape_steam_charts.py` - Scrapes data from Steam Chart (NOT USED IN FINAL DATASET DUE TO ANTI WEB-SCRAPING MEASURES)
- `utils.py` - Various utility methods utilised by the scripts
