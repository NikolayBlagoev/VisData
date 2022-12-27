# VisData

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Data generation

All data related processing scripts are located in the datasets folder.

- aggregate.py - Contains code related to aggregating data from data_set.json or likes_intermediate.json
- create_file_system.py - Creates a unique file for each game, which contains all the information on it and puts it in the indexed tree
- fetch_apis_steam.py - Collects achievement and recent likes from steam API
- like_normaliser.py - Keeps recent likes only for the month of November (since some game's recent likes may be in previous months as they have not had any activity recently)
- net_scrape_metacritic.py - Collects metacritic, user scores, and game ratings (by the ESRB system) from Metacritic


## Visualisation elements

All visualisation elements are written in TypeScripts with the D3 library. They can be found as folders in src/app/

- donut - Contains files related to the visualisation of a donut chart (pie chart with hole in the middle). Takes data in the form of two element array, where one element is the positive (ex. completion) value and the other is max - positive. The text for positive is displayed in the middle of the donut.

- bar - Generates a bar plot, where each bin is the key and the height is the value. Data is in the form of {Name: string, Value: number}

- radar - Contains files related to the Radar (or spider/stand) chart. Creates an arbitrary many sides (one for reach feature). Takes data in the form of two field array, where second field is a string list of all the features, and the first one is an array of all the elements to be visualised. 