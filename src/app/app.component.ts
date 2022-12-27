import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from "@angular/forms";
import {map, Observable, startWith} from "rxjs";
import initialGame from "../assets/initial_game.json";
import {BarComponent} from './bar/bar.component';
import {BarData} from './bar/barData';
import {BinScatterComponent} from './bin-scatter/bin-scatter.component';
import {BoxComponent} from "./box/box.component";
import {BoxData} from "./box/boxData";
import {GameEntry, KaggleGame, PopMetric} from "./data-types";
import {DonutComponent} from './donut/donut.component';
import {FetchService} from "./fetch.service";
import {GradingService} from "./grading.service";
import {LineComponent} from "./line/line.component";
import {LineData} from './line/lineData';
import {PieComponent} from "./pie/pie.component";
import {PieData} from "./pie/pieData";
import {RadarComponent} from "./radar/radar.component";
import * as ttText from './tooltip-texts';
import {TooltipComponent} from './tooltip/tooltip.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit {

  readonly title          = 'VisData';
  readonly t              = new TooltipComponent();
  readonly ttText         = ttText;
  readonly optionsLength  = 50;

  data: KaggleGame[] = [];

  currentGame: KaggleGame = initialGame;
  currentGenre: string = initialGame.genre[0];

  popFeatures = ["Likes", "Recent Likes", "Playtime", "Recent Playtime", "Owners"];

  hasMetaDummy = true; // TODO: This is only for testing; Replace when collected data processing is finalised

  searchControl = new FormControl();
  filteredData = new Observable<KaggleGame[]>();

  @ViewChild("categoricalDataRadar", {read: ViewContainerRef}) categoricalDataRadarContainer!: ViewContainerRef;
  @ViewChild("categoricalDataBox", {read: ViewContainerRef}) categoricalDataBoxContainer!: ViewContainerRef;
  @ViewChild("gameCompletionDonut", {read: ViewContainerRef}) gameCompletionDonutContainer!: ViewContainerRef;
  @ViewChild("likesOverTimeLine", {read: ViewContainerRef}) likesOverTimeLineContainer!: ViewContainerRef;
  @ViewChild("ccuOverTimeLine", {read: ViewContainerRef}) ccuOverTimeLineContainer!: ViewContainerRef;
  @ViewChild("gameReviews", {read: ViewContainerRef}) gameReviewContainer!: ViewContainerRef;
  @ViewChild("genreCount", {read: ViewContainerRef}) genreCountContainer!: ViewContainerRef;
  @ViewChild("pricePie", {read: ViewContainerRef}) pricePieContainer!: ViewContainerRef;
  @ViewChild("genreCategoricalDataRadar", {read: ViewContainerRef}) genreCategoricalDataRadarContainer!: ViewContainerRef;
  @ViewChild("genreCategoricalDataBox", {read: ViewContainerRef}) genreCategoricalDataBoxContainer!: ViewContainerRef;
  @ViewChild("completionPie", {read: ViewContainerRef}) completionPieContainer!: ViewContainerRef;

  // Scatter plot handles its own data, so it doesn't need to be reloaded like the other components
  @ViewChild(BinScatterComponent) numericDataBinScatter!: BinScatterComponent;

  constructor(private fetchService: FetchService,
              private gradingService: GradingService) {}

  async ngOnInit() {
    const start = Date.now();

    const res = await fetch("assets/kaggle_data.json");
    const value = await res.text();

    this.data = JSON.parse(value);
    this.data = this.data.sort((a, b) => {
      return -(a.positive - b.positive);
    });

    console.log(`Parsing took: ${Date.now() - start}ms`);

    this.filteredData = this.searchControl.valueChanges.pipe(
      startWith(""),
      map(value => this._filter(value))
    );

    await this.onGameSelection(initialGame);
    await this.onGenreSelection(this.currentGenre);
  }

  supportToIconName(isSupported: boolean) { return isSupported ? "check" : "close"; }

  extractGameName(game: KaggleGame) { return game?.name; }

  async onGameSelection(game: KaggleGame) {
    this.currentGame = game;
    this.currentGenre = this.currentGame.genre[0];

    const entry: GameEntry = await this.fetchService.fetchFromTree(this.currentGame.appid);

    const genreData = await this.fetchService.fetch("assets/aggregate/top_genres.json");
    const priceData: Record<string, number> = await this.fetchService.fetch("assets/aggregate/price_counts.json");

    const radarDataAll = {
      "Likes": this.gradingService.attributeToGrade("mean", PopMetric.Likes),
      "Recent Likes": this.gradingService.attributeToGrade("mean", PopMetric.LikesRecent),
      "Playtime": this.gradingService.attributeToGrade("mean", PopMetric.Playtime),
      "Recent Playtime": this.gradingService.attributeToGrade("mean", PopMetric.PlaytimeRecent),
      "Owners": this.gradingService.attributeToGrade("mean", PopMetric.Owners)
    };

    const radarDataThis = {
      "Likes": this.gradingService.numberToGrade(entry.positive / (entry.positive + entry.negative), PopMetric.Likes),
      "Recent Likes": this.gradingService.numberToGrade(entry["Up 30 Days"] / (entry["Up 30 Days"] + entry["Down 30 Days"]), PopMetric.LikesRecent),
      "Playtime": this.gradingService.numberToGrade(entry["Average Playtime - Forever"], PopMetric.Playtime),
      "Recent Playtime": this.gradingService.numberToGrade(entry["Average Playtime - 2 Weeks"], PopMetric.PlaytimeRecent),
      "Owners": this.gradingService.numberToGrade(parseInt(entry.owners.split(" .. ")[0].replaceAll(",", "")), PopMetric.Owners)
    };

    this.categoricalDataRadarContainer.clear();
    const categoricalDataRadarComp = this.categoricalDataRadarContainer.createComponent(RadarComponent);

    categoricalDataRadarComp.instance.data = [[radarDataThis, radarDataAll], this.popFeatures];
    categoricalDataRadarComp.instance.height = 400;
    categoricalDataRadarComp.instance.centerHorizontalOffset = 225;
    categoricalDataRadarComp.instance.centerVerticalOffset = 200;
    categoricalDataRadarComp.instance.maxRadius = 150;

    const gen = (name: string, metric: PopMetric) => {
      return {
        label: name,
        min: this.gradingService.attributeToGrade("min", metric),
        max: this.gradingService.attributeToGrade("max", metric),
        median: this.gradingService.attributeToGrade("median", metric),
        lower_quartile: this.gradingService.attributeToGrade("25th", metric),
        upper_quartile: this.gradingService.attributeToGrade("75th", metric)
      };
    };

    const boxDataAll: BoxData[] = [
      gen("Likes", PopMetric.Likes),
      gen("Recent Likes", PopMetric.LikesRecent),
      gen("Playtime", PopMetric.Playtime),
      gen("Recent Playtime", PopMetric.PlaytimeRecent),
      gen("Owners", PopMetric.Owners)

    ];

    this.categoricalDataBoxContainer.clear();
    const categoricalDataBoxComp = this.categoricalDataBoxContainer.createComponent(BoxComponent);
    categoricalDataBoxComp.instance.data = [boxDataAll, new Map(Object.entries(radarDataThis))];
    categoricalDataBoxComp.instance.height = 500;
    categoricalDataBoxComp.instance.width = 550;
    categoricalDataBoxComp.instance.text_margin.left = 150;
    categoricalDataBoxComp.instance.labelTextSize = 14;


    this.gameReviewContainer.clear();

    const review_data: BarData[] = [];
    review_data.push({"Name": "Steam", "Value": entry.positive / (entry.positive + entry.negative) * 100});
    if (entry["Meta Score"] != -1) review_data.push({"Name": "Meta Critic", "Value": parseInt(entry["Meta Score"])});
    if (entry["User Score"] != -1) review_data.push({"Name": "User Scores", "Value": entry["User Score"] * 10});

    if (review_data.length > 1) {
      const gameReview = this.gameReviewContainer.createComponent(BarComponent);
      gameReview.instance.data = review_data;
      gameReview.instance.max_val = 100;
      gameReview.instance.height = 300;
      gameReview.instance.bar_margin = 70;
    } else {
      const gameRevieDonut = this.gameReviewContainer.createComponent(DonutComponent);
      gameRevieDonut.instance.data = [{
        "value": review_data[0].Value,
        "name": "completed"
      }, {"value": 100 - review_data[0].Value, "name": "not"}];
      gameRevieDonut.instance.displayText = review_data[0].Value.toFixed(1) + "%";
      gameRevieDonut.instance.pos_val = review_data[0].Value;

    }
    this.gameCompletionDonutContainer.clear();
    const gameComplDonut = this.gameCompletionDonutContainer.createComponent(DonutComponent);
    if (entry.Completion == -1) {
      gameComplDonut.instance.data = [{"value": 0, "name": "completed"}, {"value": 100, "name": "not"}];
      gameComplDonut.instance.displayText = "N/A";
      gameComplDonut.instance.pos_val = entry.Completion;
    } else {
      gameComplDonut.instance.data = [{
        "value": entry.Completion,
        "name": "completed"
      }, {"value": 100 - entry.Completion, "name": "not"}];
      gameComplDonut.instance.displayText = entry.Completion.toFixed(1) + "%";
      gameComplDonut.instance.pos_val = entry.Completion;
    }

    this.genreCountContainer.clear();
    const genreComp = this.genreCountContainer.createComponent(BarComponent);
    genreComp.instance.to_sort = true;


    const processedData: BarData[] = [];
    for (const gnr in genreData) {
      processedData.push({"Name": gnr, "Value": genreData[gnr]});
    }

    genreComp.instance.data = processedData;
    genreComp.instance.horizontalMargin = 90;
    genreComp.instance.height = 400;
    genreComp.instance.highlighted = entry.genre;

    const startingLikes = (entry.positive - entry["Up 30 Days"]) - (entry.negative - entry["Down 30 Days"]);

    this.likesOverTimeLineContainer.clear();
    const likesOverTimeLineComp = this.likesOverTimeLineContainer.createComponent(LineComponent);

    likesOverTimeLineComp.instance.data = [likesOverTimeLineComp.instance.fix_data(entry["Like Histogram"]), startingLikes];
    likesOverTimeLineComp.instance.width = 1200;
    // console.log(entry);
    const ccu_histogram: LineData[] = [];
    for (const el in entry["CCU Histogram"]) {
      ccu_histogram.push({"date": new Date(el), "value": entry["CCU Histogram"][el]});
    }
    this.ccuOverTimeLineContainer.clear();
    const ccuOverTimeLineComp = this.ccuOverTimeLineContainer.createComponent(LineComponent);
    ccuOverTimeLineComp.instance.data = [ccu_histogram, 0];
    ccuOverTimeLineComp.instance.width = 1200;
    ccuOverTimeLineComp.instance.dataLabel = "Players";

    this.numericDataBinScatter.onSelectedGameChange(this.currentGame.appid);

    let pieData: PieData[] = Object.entries(priceData)
      .map(([key, value]) => {
        return {name: key, amount: value};
      });

    const sumSmall = pieData.slice(-4)
      .map(x => x.amount)
      .reduce((prev, cur) => {
        return prev + cur;
      });

    pieData = pieData.slice(0, -5);
    pieData.push({name: "2000-x", amount: sumSmall});

    let index;
    if (entry.price == "free")
      index = 0;
    else {
      const curPrice = parseInt(entry.price);

      pieData.forEach((datum, i) => {
        if (datum.name == "free")
          return;

        const [from, to] = datum.name.split("-").map(x => parseInt(x));
        if (curPrice >= from && (curPrice <= to || Number.isNaN(to))) {
          index = i;
        }
      });
    }

    pieData.map(value => {
      const name = value.name;
      if (name == "free") return;

      value.name = name
          .split("-")
          .map(number => {
            if (number == "x") return "...";

            let num = parseInt(number);
            if (num[-1] == 9) {
              num++;
            }
            return (num / 100).toFixed();
          })
          .join("-")
        + "$";

      return value;
    });

    this.pricePieContainer.clear();
    const pricePieComp = this.pricePieContainer.createComponent(PieComponent);
    pricePieComp.instance.data = pieData;
    pricePieComp.instance.highlighted = index;
  }

  async onGenreSelection(newGenreSelection: string) {
    this.currentGenre = newGenreSelection;

    const entry: GameEntry = await this.fetchService.fetchFromTree(this.currentGame.appid);

    const radarDataGenre = {
      "Likes": this.gradingService.attributeToGrade("mean", PopMetric.Likes, this.currentGenre),
      "Recent Likes": this.gradingService.attributeToGrade("mean", PopMetric.LikesRecent, this.currentGenre),
      "Playtime": this.gradingService.attributeToGrade("mean", PopMetric.Playtime, this.currentGenre),
      "Recent Playtime": this.gradingService.attributeToGrade("mean", PopMetric.PlaytimeRecent, this.currentGenre),
      "Owners": this.gradingService.attributeToGrade("mean", PopMetric.Owners, this.currentGenre)
    };

    const radarDataThis = {
      "Likes": this.gradingService.numberToGrade(entry.positive / (entry.positive + entry.negative), PopMetric.Likes),
      "Recent Likes": this.gradingService.numberToGrade(entry["Up 30 Days"] / (entry["Up 30 Days"] + entry["Down 30 Days"]), PopMetric.LikesRecent),
      "Playtime": this.gradingService.numberToGrade(entry["Average Playtime - Forever"], PopMetric.Playtime),
      "Recent Playtime": this.gradingService.numberToGrade(entry["Average Playtime - 2 Weeks"], PopMetric.PlaytimeRecent),
      "Owners": this.gradingService.numberToGrade(parseInt(entry.owners.split(" .. ")[0].replaceAll(",", "")), PopMetric.Owners)
    };

    this.genreCategoricalDataRadarContainer.clear();
    const genreCategoricalDataRadarComp = this.genreCategoricalDataRadarContainer.createComponent(RadarComponent);

    genreCategoricalDataRadarComp.instance.data = [[radarDataThis, radarDataGenre], this.popFeatures];
    genreCategoricalDataRadarComp.instance.centerVerticalOffset = 150;
    genreCategoricalDataRadarComp.instance.centerHorizontalOffset = 200;
    genreCategoricalDataRadarComp.instance.width = 400;
    genreCategoricalDataRadarComp.instance.height = 300;
    genreCategoricalDataRadarComp.instance.margin = 0;
    genreCategoricalDataRadarComp.instance.maxRadius = 120;
    genreCategoricalDataRadarComp.instance.labelTextSize = 130;
    genreCategoricalDataRadarComp.instance.attrDotRadius = 4;

    const gen = (name: string, metric: PopMetric) => {
      return {
        label: name,
        min: this.gradingService.attributeToGrade("min", metric, this.currentGenre),
        max: this.gradingService.attributeToGrade("max", metric, this.currentGenre),
        median: this.gradingService.attributeToGrade("median", metric, this.currentGenre),
        lower_quartile: this.gradingService.attributeToGrade("25th", metric, this.currentGenre),
        upper_quartile: this.gradingService.attributeToGrade("75th", metric, this.currentGenre)
      };
    };

    const boxDataGenre: BoxData[] = [
      gen("Likes", PopMetric.Likes),
      gen("Recent Likes", PopMetric.LikesRecent),
      gen("Playtime", PopMetric.Playtime),
      gen("Recent Playtime", PopMetric.PlaytimeRecent),
      gen("Owners", PopMetric.Owners)

    ];

    this.genreCategoricalDataBoxContainer.clear();
    const genreCategoricalDataBoxComp = this.genreCategoricalDataBoxContainer.createComponent(BoxComponent);

    genreCategoricalDataBoxComp.instance.data = [boxDataGenre, new Map(Object.entries(radarDataThis))];
    genreCategoricalDataBoxComp.instance.height = 400;
    genreCategoricalDataBoxComp.instance.width = 500;
    genreCategoricalDataBoxComp.instance.boxHeight = 35;
    genreCategoricalDataBoxComp.instance.margin = {top: 40, right: 40, bottom: 40, left: 0};
    genreCategoricalDataBoxComp.instance.scaleTextSize = 11;
    genreCategoricalDataBoxComp.instance.labelTextSize = 18;



    this.completionPieContainer.clear();
    const completionPieComp = this.completionPieContainer.createComponent(PieComponent);
    // completionPieComp.instance.data = ;
    completionPieComp.instance.horizontalOffset = 180;
    completionPieComp.instance.radius = 100;
    completionPieComp.instance.labelRadius = 110;
    completionPieComp.instance.labelFontSize = 16;
    completionPieComp.instance.legendSquareSize = 20;
    completionPieComp.instance.legendHorizontalOffset = 130;
    completionPieComp.instance.legendTextVerticalOffset = 15;
    // completionPieComp.instance.highlighted = index;
  }

  private _filter(value: string): KaggleGame[] {
    // noinspection SuspiciousTypeOfGuard
    if (typeof value !== "string") {
      console.log("TODO: fix this issue");
      return [];
    }

    let result: KaggleGame[];

    if (value === "") {
      result = this.data.slice(0, this.optionsLength);
    }
    else {
      const filterValue = value.toLowerCase();

      result = this.data
        .filter(game => game.name.toLowerCase().includes(filterValue))
        .slice(0, this.optionsLength);
    }

    return result;
  }
}
