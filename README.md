# VisData
## Overview
This repository contains the source code for the InfoVis project submission belonging to Group 12 for the course IN4089 Data Visualisation. Group 12 is composed of the following members:
* Nikolay Blagoev
* Tobias van den Hurk
* William Narchi

The application is built on the Angular framework and makes use of the D3 library for generating visuals.

## How to Run
### Application
Node.js must be installed in order to run this project. The current codebase was tested on v19.1.0

In order to run this project, first clone the [repository containing the core data structure](https://github.com/tsvdh/VisDataFiles) and follow the instructions provided. After successfully running the aforementioned file server, run the following commands
```shell
npm install
npm start
```
This will create a web server (on port 4200 by default) that serves the application

### Data Collection and Preprocessing
All of the data collection and preprocessing scripts are written in Python. The current codebase was tested on 3.10.6

Create a virtual environment (optional), install the packages in `requirements.txt`, navigate to `datasets` then run the desired script
```shell
pip install -r requirements.txt
cd datasets
python ${NAME_OF_SCRIPT}
```

## Directory Structure
- `data` - Aggregate data used to visualise averages and trends <!-- TODO: remove if this directory is removed during wrap-up  -->
- `datasets` - Python scripts for data collection and preprocessing; Raw/mildly processed data for operation by the scripts
- `src` - Source code for the core Angular application


## Stub Information
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.0.

### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
