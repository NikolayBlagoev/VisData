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
  @ViewChild("genreLikes", {read: ViewContainerRef}) genreLikes!: ViewContainerRef;
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

  private formatOwnersAmount(amount: number) {
    let ownersThis;
    if (amount < 1000) {
      ownersThis = amount;
    } else if (amount < 1000000) {
      ownersThis = Math.round(amount / 1000) + "k";
    } else {
      ownersThis = Math.round(amount / 1000000) + "M";
    }
    return ownersThis;
  }

  calculateDataThisGame(entry: GameEntry) {
    return {
      "Likes": entry.positive / (entry.positive + entry.negative),
      "Recent Likes":entry["Up 30 Days"] / (entry["Up 30 Days"] + entry["Down 30 Days"]),
      "Playtime": entry["Average Playtime - Forever"],
      "Recent Playtime": entry["Average Playtime - 2 Weeks"],
      "Owners": parseInt(entry.owners.split(" .. ")[0].replaceAll(",", "")),
    };
  }

  generateRadarDataThisGame(entry: GameEntry) {
    const dataThis = this.calculateDataThisGame(entry);
    return {
      "Likes": this.gradingService.numberToGrade(dataThis.Likes, PopMetric.Likes),
      "Recent Likes": this.gradingService.numberToGrade(dataThis["Recent Likes"], PopMetric.LikesRecent),
      "Playtime": this.gradingService.numberToGrade(dataThis.Playtime, PopMetric.Playtime),
      "Recent Playtime": this.gradingService.numberToGrade(dataThis["Recent Playtime"], PopMetric.PlaytimeRecent),
      "Owners": this.gradingService.numberToGrade(dataThis.Owners, PopMetric.Owners)
    };
  }

  async onGameSelection(game: KaggleGame) {
    this.currentGame = game;
    this.currentGenre = this.currentGame.genre[0];
    
    const entry: GameEntry = await this.fetchService.fetchFromTree(this.currentGame.appid);

    const dataThis = this.calculateDataThisGame(entry);

    document.getElementById("likesAllComparison")!.textContent
      = `Likes: ${Math.round(dataThis.Likes * 100)}% /
        ${Math.round(this.gradingService.attributeUngraded("mean", PopMetric.Likes) * 100)}%`;

    document.getElementById("recentLikesAllComparison")!.textContent
      = `Recent Likes: ${Math.round(dataThis["Recent Likes"] * 100)}% /
        ${Math.round(this.gradingService.attributeUngraded("mean", PopMetric.LikesRecent) * 100)}%`;

    document.getElementById("playtimeAllComparison")!.textContent
      = `Playtime: ${(dataThis.Playtime / 60).toFixed(1)}h /
        ${(this.gradingService.attributeUngraded("mean", PopMetric.Playtime) / 60).toFixed(1)}h`;

    document.getElementById("recentPlaytimeAllComparison")!.textContent
      = `Recent Playtime: ${(dataThis["Recent Playtime"] / 60).toFixed(1)}h /
        ${(this.gradingService.attributeUngraded("mean", PopMetric.PlaytimeRecent) / 60).toFixed(1)}h`;

    document.getElementById("ownersAllComparison")!.textContent
      = `Owners: ~${this.formatOwnersAmount(dataThis.Owners)} /
        ${this.formatOwnersAmount(this.gradingService.attributeUngraded("mean", PopMetric.Owners))}`;

    const genreData = await this.fetchService.fetch("assets/aggregate/top_genres.json");
    const priceData: Record<string, number> = await this.fetchService.fetch("assets/aggregate/price_counts.json");

    const radarDataAll = {
      "Likes": this.gradingService.attributeToGrade("mean", PopMetric.Likes),
      "Recent Likes": this.gradingService.attributeToGrade("mean", PopMetric.LikesRecent),
      "Playtime": this.gradingService.attributeToGrade("mean", PopMetric.Playtime),
      "Recent Playtime": this.gradingService.attributeToGrade("mean", PopMetric.PlaytimeRecent),
      "Owners": this.gradingService.attributeToGrade("mean", PopMetric.Owners)
    };

    const radarDataThis = this.generateRadarDataThisGame(entry);

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

    const startingLikes = (entry.positive - entry["Up 30 Days"]);
    const startingDislikes = (entry.negative - entry["Down 30 Days"]);
    this.likesOverTimeLineContainer.clear();
    const likesOverTimeLineComp = this.likesOverTimeLineContainer.createComponent(LineComponent);
    const d1: LineData[] = entry["Like Histogram"].map(el => {return {"date": new Date(el.date * 1000), "value": el.recommendations_up };});
    const d2: LineData[] = entry["Like Histogram"].map(el => {return {"date": new Date(el.date * 1000), "value": el.recommendations_down};});
    d1.shift();
    d2.shift();
    likesOverTimeLineComp.instance.data =
    [[{"data":d1,"colour":"#2196F3", "label": "Likes"},
    {"data":d2,"colour":"#9C27B0", "label": "Dislikes"}], startingLikes];
    likesOverTimeLineComp.instance.width = 1400;
    // console.log(entry);
    const ccu_histogram: LineData[] = [];
    for (const el in entry["CCU Histogram"]) {
      ccu_histogram.push({"date": new Date(el), "value": entry["CCU Histogram"][el]});
    }
    this.ccuOverTimeLineContainer.clear();
    const ccuOverTimeLineComp = this.ccuOverTimeLineContainer.createComponent(LineComponent);
    ccuOverTimeLineComp.instance.data = [[{"data": ccu_histogram, "colour": "#2196F3", "label": "Players"}], 0];
    ccuOverTimeLineComp.instance.width = 1400;
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
    const completion_data = await this.fetchService.fetch("assets/aggregate/completion_genre.json");
    const like_genre = await this.fetchService.fetch("assets/aggregate/like_30_day_genre.json");
    const dataThis = this.calculateDataThisGame(entry);

    document.getElementById("likesGenreComparison")!.textContent
      = `Likes: ${Math.round(dataThis.Likes * 100)}% /
        ${Math.round(this.gradingService.attributeUngraded("mean", PopMetric.Likes, this.currentGenre) * 100)}%`;

    document.getElementById("recentLikesGenreComparison")!.textContent
      = `Recent Likes: ${Math.round(dataThis["Recent Likes"] * 100)}% /
        ${Math.round(this.gradingService.attributeUngraded("mean", PopMetric.LikesRecent, this.currentGenre) * 100)}%`;

    document.getElementById("playtimeGenreComparison")!.textContent
      = `Playtime: ${(dataThis.Playtime / 60).toFixed(1)}h /
        ${(this.gradingService.attributeUngraded("mean", PopMetric.Playtime, this.currentGenre) / 60).toFixed(1)}h`;

    document.getElementById("recentPlaytimeGenreComparison")!.textContent
      = `Recent Playtime: ${(dataThis["Recent Playtime"] / 60).toFixed(1)}h /
        ${(this.gradingService.attributeUngraded("mean", PopMetric.PlaytimeRecent, this.currentGenre) / 60).toFixed(1)}h`;

    document.getElementById("ownersGenreComparison")!.textContent
      = `Owners: ~${this.formatOwnersAmount(dataThis.Owners)} /
        ${this.formatOwnersAmount(this.gradingService.attributeUngraded("mean", PopMetric.Owners, this.currentGenre))}`;

    const radarDataGenre = {
      "Likes": this.gradingService.attributeToGrade("mean", PopMetric.Likes, this.currentGenre),
      "Recent Likes": this.gradingService.attributeToGrade("mean", PopMetric.LikesRecent, this.currentGenre),
      "Playtime": this.gradingService.attributeToGrade("mean", PopMetric.Playtime, this.currentGenre),
      "Recent Playtime": this.gradingService.attributeToGrade("mean", PopMetric.PlaytimeRecent, this.currentGenre),
      "Owners": this.gradingService.attributeToGrade("mean", PopMetric.Owners, this.currentGenre)
    };

    const radarDataThis = this.generateRadarDataThisGame(entry);

    this.genreCategoricalDataRadarContainer.clear();
    const genreCategoricalDataRadarComp = this.genreCategoricalDataRadarContainer.createComponent(RadarComponent);

    genreCategoricalDataRadarComp.instance.data = [[radarDataThis, radarDataGenre], this.popFeatures];
    genreCategoricalDataRadarComp.instance.centerVerticalOffset = 150;
    genreCategoricalDataRadarComp.instance.centerHorizontalOffset = 200;
    genreCategoricalDataRadarComp.instance.width = 400;
    genreCategoricalDataRadarComp.instance.height = 300;
    genreCategoricalDataRadarComp.instance.margin = 0;
    genreCategoricalDataRadarComp.instance.maxRadius = 120;
    genreCategoricalDataRadarComp.instance.labelTextSize = 13;
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
    genreCategoricalDataBoxComp.instance.labelTextSize = 13;



    this.completionPieContainer.clear();
    const completionPieComp = this.completionPieContainer.createComponent(DonutComponent);
    const compl = parseFloat (completion_data[this.currentGenre]["median"])
    completionPieComp.instance.data = [{"value": compl, "name": "completed"}, {"value": 100 - compl, "name": "not"}];
    completionPieComp.instance.displayText = compl.toFixed(1) + "%";
    // completionPieComp.instance.horizontalOffset = 180;
    completionPieComp.instance.radius = 100;
    completionPieComp.instance.width = 250;
    completionPieComp.instance.fontSize=40;
    // completionPieComp.instance.labelRadius = 110;
    // completionPieComp.instance.labelFontSize = 16;
    // completionPieComp.instance.legendSquareSize = 20;
    // completionPieComp.instance.legendHorizontalOffset = 130;
    // completionPieComp.instance.legendTextVerticalOffset = 15;
    // completionPieComp.instance.highlighted = index;


    this.genreLikes.clear();
    const likesOverTimeLineComp = this.genreLikes.createComponent(LineComponent);
    const d1: LineData[] = entry["Like Histogram"].map(el => {return {"date": new Date(el.date * 1000), "value": el.recommendations_down + el.recommendations_up == 0 ? 0 : el.recommendations_up/(el.recommendations_down + el.recommendations_up) };});
    const d2: LineData[] = like_genre[this.currentGenre].map(el => {return {"date": new Date(el["date"] * 1000), "value": el["val"]};});
    d1.shift();
    d2.shift();
    likesOverTimeLineComp.instance.data =
    [[{"data":d1,"colour":"#2196F3", "label": "Game Likes"},
    {"data":d2,"colour":"#9C27B0", "label": "Genre Median Likes"}], 0];
    likesOverTimeLineComp.instance.width = 1400;
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
