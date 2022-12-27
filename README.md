# Code

### Components
Each component represents a part of the website, including the associated ts and css.
Every type of graph is a component, as well as the tooltip and the body of the site.
The graphs are further explained in [visualisation elements](#visualisation-elements).

### Services
There are several services which each have a unique purpose, separate from other code.
- entry-tree: finds a game entry in the file tree
- fetch: retrieves and parses a file from the file server
- grading: calculates the grade of an amount, for a metric (e.g. likes) of all games
- id: generates a unique letter only id

# Data generation

All data related processing scripts are located in the datasets folder.

- aggregate.py - Contains code related to aggregating data from data_set.json or likes_intermediate.json
- create_file_system.py - Creates a unique file for each game, which contains all the information on it and puts it in the indexed tree
- fetch_apis_steam.py - Collects achievement and recent likes from steam API
- like_normaliser.py - Keeps recent likes only for the month of November (since some game's recent likes may be in previous months as they have not had any activity recently)
- net_scrape_metacritic.py - Collects metacritic, user scores, and game ratings (by the ESRB system) from Metacritic


# Visualisation elements

All visualisation elements are written in TypeScripts with the D3 library. They can be found as folders in src/app/

- Pie - Displays elements which are parts of a whole. The values are shown outside the pie to avoid visual cluttering.
  Takes data in the form of a tuple array, where each entry is a slice. The first value in the tuple is the name of the element, the second value is the amount.
  The given values are converted to the ratio of the sum.

- Donut - Contains files related to the visualisation of a donut chart (pie chart with hole in the middle). Takes data in the form of two element array, where one element is the positive (ex. completion) value and the other is max - positive. The text for positive is displayed in the middle of the donut.

- Bar - Generates a bar plot, where each bin is the key and the height is the value. Data is in the form of {Name: string, Value: number}

- Radar - Contains files related to the Radar (or spider/stand) chart. Creates an arbitrary many sides (one for reach feature). Takes data in the form of two field array, where second field is a string list of all the features, and the first one is an array of all the elements to be visualised. 
