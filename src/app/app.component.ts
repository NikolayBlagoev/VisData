import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from "@angular/forms";
import {map, Observable, startWith} from "rxjs";
import initialGame from "../assets/initial_game.json";
import {BarComponent} from './bar/bar.component';
import {BarData} from './bar/barData';
import {BinScatterComponent} from './bin-scatter/bin-scatter.component';
import {BoxComponent} from "./box/box.component";
import {BoxData} from "./box/boxData";
import {GameEntry, KaggleGame, PopMetric, PopMetricData} from "./data-types";
import {DonutComponent} from './donut/donut.component';
import {FetchService} from "./fetch.service";
import {GradingService} from "./grading.service";
import {LineComponent} from "./line/line.component";
import {LineData} from './line/lineData';
import {PieComponent} from "./pie/pie.component";
import {PieData} from "./pie/pieData";
import {RadarComponent} from "./radar/radar.component";
import * as ttText from './tooltip-texts';
import * as utils from './utils';
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
  readonly utils          = utils;
  readonly optionsLength  = 50;

  // Commonly used colours
  readonly MATERIAL_BLUE_500    = "#2196F3";
  readonly MATERIAL_PURPLE_500  = "#9C27B0";

  // Data loading, filtering, and storage
  currentGame: KaggleGame = initialGame;
  currentGenre: string    = initialGame.genre[0];
  popFeatures             = ["Likes", "Recent Likes", "Playtime", "Recent Playtime", "Owners"];
  data: KaggleGame[]      = [];
  filteredData            = new Observable<KaggleGame[]>();
  searchControl           = new FormControl();
  
  // Component containers for component generation, data population and drawing
  @ViewChild("categoricalDataRadar", {read: ViewContainerRef}) categoricalDataRadarContainer!: ViewContainerRef;
  @ViewChild("categoricalDataBox", {read: ViewContainerRef}) categoricalDataBoxContainer!: ViewContainerRef;
  @ViewChild("gameReviews", {read: ViewContainerRef}) gameReviewContainer!: ViewContainerRef;
  @ViewChild("gameCompletionDonut", {read: ViewContainerRef}) gameCompletionDonutContainer!: ViewContainerRef;
  @ViewChild("likesOverTimeLine", {read: ViewContainerRef}) likesOverTimeLineContainer!: ViewContainerRef;
  @ViewChild("ccuOverTimeLine", {read: ViewContainerRef}) ccuOverTimeLineContainer!: ViewContainerRef;
  @ViewChild("genreCount", {read: ViewContainerRef}) genreCountContainer!: ViewContainerRef;
  @ViewChild("pricePie", {read: ViewContainerRef}) pricePieContainer!: ViewContainerRef;
  @ViewChild("genreReleaseTimeline", {read: ViewContainerRef}) genreReleaseTimelineContainer!: ViewContainerRef;
  @ViewChild("genreCategoricalDataRadar", {read: ViewContainerRef}) genreCategoricalDataRadarContainer!: ViewContainerRef;
  @ViewChild("genreCategoricalDataBox", {read: ViewContainerRef}) genreCategoricalDataBoxContainer!: ViewContainerRef;
  @ViewChild("genreCompletionDonut", {read: ViewContainerRef}) genreCompletionDonutContainer!: ViewContainerRef;
  @ViewChild("genreLikes", {read: ViewContainerRef}) genreLikes!: ViewContainerRef;
  @ViewChild("genreCcuTimeline", {read: ViewContainerRef}) genreCcuTimelineContainer!: ViewContainerRef;
  @ViewChild(BinScatterComponent) numericDataBinScatter!: BinScatterComponent; // Scatter plot handles its own data, so it doesn't need to be reloaded like the other components

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

  /* ========== UTILITIES BEGIN ========== */
  private generateRadarDataThisGame(entry: GameEntry): PopMetricData {
    const dataThis = this.utils.calculateDataThisGame(entry);
    return {
      "Likes": this.gradingService.numberToGrade(dataThis.Likes, PopMetric.Likes),
      "Recent Likes": this.gradingService.numberToGrade(dataThis["Recent Likes"], PopMetric.LikesRecent),
      "Playtime": this.gradingService.numberToGrade(dataThis.Playtime, PopMetric.Playtime),
      "Recent Playtime": this.gradingService.numberToGrade(dataThis["Recent Playtime"], PopMetric.PlaytimeRecent),
      "Owners": this.gradingService.numberToGrade(dataThis.Owners, PopMetric.Owners)
    };
  }

  private generateGrades(name: string, metric: PopMetric, genre?: string) : BoxData {
    return {
      label: name,
      min: this.gradingService.attributeToGrade("min", metric, genre),
      max: this.gradingService.attributeToGrade("max", metric, genre),
      median: this.gradingService.attributeToGrade("median", metric, genre),
      lower_quartile: this.gradingService.attributeToGrade("25th", metric, genre),
      upper_quartile: this.gradingService.attributeToGrade("75th", metric, genre)
    };
  }
  /* ========== UTILITIES END ========== */

  /* ========== GAME SECTION BEGIN ========== */
  private drawGamePopularityText(entry: GameEntry) {
    const dataThis = this.utils.calculateDataThisGame(entry);

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
      = `Owners: ~${this.utils.formatOwnersAmount(dataThis.Owners)} /
        ${this.utils.formatOwnersAmount(this.gradingService.attributeUngraded("mean", PopMetric.Owners))}`;
  }

  private drawGameRadarChart(radarDataThis: PopMetricData) {
    // Load general data
    const radarDataAll = {
      "Likes": this.gradingService.attributeToGrade("mean", PopMetric.Likes),
      "Recent Likes": this.gradingService.attributeToGrade("mean", PopMetric.LikesRecent),
      "Playtime": this.gradingService.attributeToGrade("mean", PopMetric.Playtime),
      "Recent Playtime": this.gradingService.attributeToGrade("mean", PopMetric.PlaytimeRecent),
      "Owners": this.gradingService.attributeToGrade("mean", PopMetric.Owners)
    };

    this.categoricalDataRadarContainer.clear();
    const categoricalDataRadarComp = this.categoricalDataRadarContainer.createComponent(RadarComponent);
    categoricalDataRadarComp.instance.data = [[radarDataThis, radarDataAll], this.popFeatures];
    categoricalDataRadarComp.instance.height                  = 400;
    categoricalDataRadarComp.instance.centerHorizontalOffset  = 225;
    categoricalDataRadarComp.instance.centerVerticalOffset    = 200;
    categoricalDataRadarComp.instance.maxRadius               = 150;
  }

  private drawGameBoxChart(radarDataThis: PopMetricData) {
    // Load aggregate data about all games
    const boxDataAll: BoxData[] = [
      this.generateGrades("Likes", PopMetric.Likes),
      this.generateGrades("Recent Likes", PopMetric.LikesRecent),
      this.generateGrades("Playtime", PopMetric.Playtime),
      this.generateGrades("Recent Playtime", PopMetric.PlaytimeRecent),
      this.generateGrades("Owners", PopMetric.Owners)];

    this.categoricalDataBoxContainer.clear();
    const categoricalDataBoxComp = this.categoricalDataBoxContainer.createComponent(BoxComponent);
    categoricalDataBoxComp.instance.data = [boxDataAll, new Map(Object.entries(radarDataThis))];
    categoricalDataBoxComp.instance.height            = 500;
    categoricalDataBoxComp.instance.width             = 550;
    categoricalDataBoxComp.instance.text_margin.left  = 150;
    categoricalDataBoxComp.instance.labelTextSize     = 14;
  }

  private drawGameReviews(entry: GameEntry) {
    // Load data; Check for existence of Metacritic data
    const reviewData: BarData[] = [];
    reviewData.push({"Name": "Steam", "Value": entry.positive / (entry.positive + entry.negative) * 100});
    if (entry["Meta Score"] != -1) reviewData.push({"Name": "Metacritic", "Value": parseInt(entry["Meta Score"])});
    if (entry["User Score"] != -1) reviewData.push({"Name": "Metacritic User", "Value": entry["User Score"] * 10});
    
    // Decide whether to draw multiple review bar chart or Steam review donut chart; Draw
    this.gameReviewContainer.clear();
    if (reviewData.length > 1) {
      const gameReviewBar = this.gameReviewContainer.createComponent(BarComponent);
      gameReviewBar.instance.data       = reviewData;
      gameReviewBar.instance.max_val    = 100;
      gameReviewBar.instance.height     = 310;
      gameReviewBar.instance.bar_margin = 70;
    } else {
      const gameReviewDonut = this.gameReviewContainer.createComponent(DonutComponent);
      gameReviewDonut.instance.data = [
        {"value": reviewData[0].Value, "name": "completed"},
        {"value": 100 - reviewData[0].Value, "name": "not"}];
      gameReviewDonut.instance.displayText    = reviewData[0].Value.toFixed(1) + "%";
      gameReviewDonut.instance.positiveValue  = reviewData[0].Value;
    }
  }

  private drawGameCompletion(entry: GameEntry) {
    this.gameCompletionDonutContainer.clear();
    const gameCompletionDonut = this.gameCompletionDonutContainer.createComponent(DonutComponent);

    // Draw completion if data is available, else provide stub
    if (entry.Completion == -1) {
      gameCompletionDonut.instance.data = [{"value": 0, "name": "Completed"}, {"value": 100, "name": "Not"}];
      gameCompletionDonut.instance.displayText    = "N/A";
      gameCompletionDonut.instance.positiveValue  = entry.Completion;
    } else {
      gameCompletionDonut.instance.data = [
        {"value": entry.Completion, "name": "Completed"},
        {"value": (100 - entry.Completion), "name": "Not"}];
      gameCompletionDonut.instance.displayText    = entry.Completion.toFixed(1) + "%";
      gameCompletionDonut.instance.positiveValue  = entry.Completion;
    }
  }

  private drawGameLikesOverTime(entry: GameEntry) {
    const d1: LineData[] = entry["Like Histogram"].map(el => {return {"date": new Date(el.date * 1000), "value": el.recommendations_up };});
    const d2: LineData[] = entry["Like Histogram"].map(el => {return {"date": new Date(el.date * 1000), "value": el.recommendations_down};});
    d1.shift();
    d2.shift();
    
    this.likesOverTimeLineContainer.clear();
    const likesOverTimeLineComp           = this.likesOverTimeLineContainer.createComponent(LineComponent);
    likesOverTimeLineComp.instance.data   = [
      {"data": d1, "colour": this.MATERIAL_BLUE_500, "label": "Likes"},
      {"data": d2, "colour": this.MATERIAL_PURPLE_500, "label": "Dislikes"}];
    likesOverTimeLineComp.instance.width  = 1400;
  }

  private drawGameCcuOverTime(entry: GameEntry) {
    const ccu_histogram: LineData[] = [];
    for (const el in entry["CCU Histogram"]) { ccu_histogram.push({"date": new Date(el), "value": entry["CCU Histogram"][el]});}

    this.ccuOverTimeLineContainer.clear();
    const ccuOverTimeLineComp           = this.ccuOverTimeLineContainer.createComponent(LineComponent);
    ccuOverTimeLineComp.instance.data   = [{"data": ccu_histogram, "colour": this.MATERIAL_BLUE_500, "label": "Players"}];
    ccuOverTimeLineComp.instance.width  = 1400;
  }

  private drawGameSection(entry: GameEntry) {
    // Load common data
    const radarDataThis = this.generateRadarDataThisGame(entry);

    // Draw specific components
    this.drawGamePopularityText(entry);
    this.drawGameRadarChart(radarDataThis);
    this.drawGameBoxChart(radarDataThis);
    this.drawGameReviews(entry);
    this.drawGameCompletion(entry);
    this.drawGameLikesOverTime(entry);
    this.drawGameCcuOverTime(entry);
  }
  /* ========== GAME SECTION END ========== */

  /* ========== ALL GAMES SECTION BEGIN ========== */
  private async drawGenreCount(entry: GameEntry) {
    const genreData                 = await this.fetchService.fetch("assets/aggregate/top_genres.json");
    const processedData: BarData[]  = [];
    for (const genre in genreData) { processedData.push({"Name": genre, "Value": genreData[genre]}); }

    this.genreCountContainer.clear();
    const genreComp                     = this.genreCountContainer.createComponent(BarComponent);
    genreComp.instance.to_sort          = true;
    genreComp.instance.data             = processedData;
    genreComp.instance.horizontalMargin = 90;
    genreComp.instance.highlighted      = entry.genre;
  }
  
  private async drawPriceDistributionPie(entry: GameEntry) {
    const priceData: Record<string, number> = await this.fetchService.fetch("assets/aggregate/price_counts.json");
    let pieData: PieData[] = Object.entries(priceData)
      .map(([key, value]) => { return {name: key, amount: value}; });
    const sumSmall = pieData.slice(-4)
      .map(x => x.amount)
      .reduce((prev, cur) => { return prev + cur; });

    pieData = pieData.slice(0, -5);
    pieData.push({name: "2000-x", amount: sumSmall});

    let index!: number;
    if (entry.price == "free") { index = 0; }
    else {
      const curPrice = parseInt(entry.price);

      pieData.forEach((datum, i) => {
        if (datum.name == "free") {return;}

        const [from, to] = datum.name.split("-").map(x => parseInt(x));
        if (curPrice >= from && (curPrice <= to || Number.isNaN(to))) { index = i; }
      });
    }

    pieData.map(value => {
      const name = value.name;
      if (name == "free") { return; }

      value.name = name
          .split("-")
          .map(number => {
            if (number == "x") { return "..."; }

            let num = parseInt(number);
            if (num[-1] == 9) { num++; }
            return "$" + (num / 100).toFixed();
          })
          .join(" - ");
      return value;
    });

    this.pricePieContainer.clear();
    const pricePieComp                            = this.pricePieContainer.createComponent(PieComponent);
    pricePieComp.instance.data                    = pieData;
    pricePieComp.instance.highlighted             = index;
    pricePieComp.instance.height                  = 432;
    pricePieComp.instance.legendHorizontalOffset  = 235;
  }

  private drawAllGamesSection(entry: GameEntry) {
    this.numericDataBinScatter.onSelectedGameChange(this.currentGame.appid); // Binned scatter plot manages its own data and drawing
    this.drawGenreCount(entry);
    this.drawPriceDistributionPie(entry);
  }
  /* ========== ALL GAMES SECTION END ========== */

  /* ========== GENRE SECTION BEGIN ========== */
  private async drawGenreReleaseTimeline(entry: GameEntry) {
    // https://stackoverflow.com/a/47994011/14247568
    const allReleases                         = await this.fetchService.fetch("assets/aggregate/release_count_year_genres.json");
    const genreReleases                       = allReleases[this.currentGenre];
    const gameReleaseYear                     = entry.release_date.slice(0, 4);
    const gameReleaseDateWrapper              = [new Date(`${gameReleaseYear}T00:00`)];
    const releaseFrequencies: Array<LineData> = [];
    for (const year in genreReleases) { releaseFrequencies.push({"date": new Date(`${year}T00:00`), value: genreReleases[year]});}

    this.genreReleaseTimelineContainer.clear();
    const genreReleaseTimeline          = this.genreReleaseTimelineContainer.createComponent(LineComponent);
    genreReleaseTimeline.instance.data  = [{
      "data": releaseFrequencies,
      "colour": this.MATERIAL_BLUE_500,
      "label": "Genre Releases",
      "highlight": gameReleaseDateWrapper}];
    genreReleaseTimeline.instance.width = 1400;
  }
  
  private drawGenrePopularityText(entry: GameEntry) {
    const dataThis = this.utils.calculateDataThisGame(entry);

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
      = `Owners: ~${this.utils.formatOwnersAmount(dataThis.Owners)} /
        ${this.utils.formatOwnersAmount(this.gradingService.attributeUngraded("mean", PopMetric.Owners, this.currentGenre))}`;
  }

  private drawGenreRadarChart(radarDataThis: PopMetricData) {
    // Load genre data
    const radarDataGenre = {
      "Likes": this.gradingService.attributeToGrade("mean", PopMetric.Likes, this.currentGenre),
      "Recent Likes": this.gradingService.attributeToGrade("mean", PopMetric.LikesRecent, this.currentGenre),
      "Playtime": this.gradingService.attributeToGrade("mean", PopMetric.Playtime, this.currentGenre),
      "Recent Playtime": this.gradingService.attributeToGrade("mean", PopMetric.PlaytimeRecent, this.currentGenre),
      "Owners": this.gradingService.attributeToGrade("mean", PopMetric.Owners, this.currentGenre)};

    this.genreCategoricalDataRadarContainer.clear();
    const genreCategoricalDataRadarComp = this.genreCategoricalDataRadarContainer.createComponent(RadarComponent);
    genreCategoricalDataRadarComp.instance.data = [[radarDataThis, radarDataGenre], this.popFeatures];
    genreCategoricalDataRadarComp.instance.centerVerticalOffset   = 150;
    genreCategoricalDataRadarComp.instance.centerHorizontalOffset = 200;
    genreCategoricalDataRadarComp.instance.width                  = 400;
    genreCategoricalDataRadarComp.instance.height                 = 300;
    genreCategoricalDataRadarComp.instance.margin                 = 0;
    genreCategoricalDataRadarComp.instance.maxRadius              = 120;
    genreCategoricalDataRadarComp.instance.labelTextSize          = 13;
    genreCategoricalDataRadarComp.instance.attrDotRadius          = 4;
  }

  private drawGenreBoxChart(radarDataThis: PopMetricData) {
    // Load genre data
    const boxDataGenre: BoxData[] = [
      this.generateGrades("Likes", PopMetric.Likes, this.currentGenre),
      this.generateGrades("Recent Likes", PopMetric.LikesRecent, this.currentGenre),
      this.generateGrades("Playtime", PopMetric.Playtime, this.currentGenre),
      this.generateGrades("Recent Playtime", PopMetric.PlaytimeRecent, this.currentGenre),
      this.generateGrades("Owners", PopMetric.Owners, this.currentGenre)];

    this.genreCategoricalDataBoxContainer.clear();
    const genreCategoricalDataBoxComp                   = this.genreCategoricalDataBoxContainer.createComponent(BoxComponent);
    genreCategoricalDataBoxComp.instance.data           = [boxDataGenre, new Map(Object.entries(radarDataThis))];
    genreCategoricalDataBoxComp.instance.height         = 400;
    genreCategoricalDataBoxComp.instance.width          = 500;
    genreCategoricalDataBoxComp.instance.boxHeight      = 35;
    genreCategoricalDataBoxComp.instance.margin         = {top: 40, right: 40, bottom: 40, left: 0};
    genreCategoricalDataBoxComp.instance.scaleTextSize  = 11;
    genreCategoricalDataBoxComp.instance.labelTextSize  = 13;
  }

  private async drawGenreCompletionDonut(entry: GameEntry) {
    const completionData  = await this.fetchService.fetch("assets/aggregate/completion_genre.json");
    const compl           = parseFloat(completionData[this.currentGenre]["median"]);

    this.genreCompletionDonutContainer.clear();
    const genreCompletionDonutComp = this.genreCompletionDonutContainer.createComponent(DonutComponent);
    genreCompletionDonutComp.instance.data        = [{"value": compl, "name": "completed"}, {"value": 100 - compl, "name": "not"}];
    genreCompletionDonutComp.instance.displayText = compl.toFixed(1) + "%";
    genreCompletionDonutComp.instance.radius      = 100;
    genreCompletionDonutComp.instance.width       = 250;
    genreCompletionDonutComp.instance.fontSize    = 40;
  }

  private async drawGenreLikeTimeline(entry: GameEntry) {
    // Construct game and genre data
    const likeTimelineGenre = await this.fetchService.fetch("assets/aggregate/like_30_day_genre.json");
    const d1: LineData[]    = entry["Like Histogram"].map(el => {return {
      "date":   new Date(el.date * 1000),
      "value":  el.recommendations_down + el.recommendations_up == 0  ?
                0                                                     :
                el.recommendations_up/(el.recommendations_down + el.recommendations_up) };});
    const d2: LineData[]    = likeTimelineGenre[this.currentGenre].map(el => {return {
      "date":   new Date(el["date"] * 1000),
      "value":  el["val"]};});
    d1.shift();
    d2.shift();

    this.genreLikes.clear();
    const likesOverTimeLineComp           = this.genreLikes.createComponent(LineComponent);
    likesOverTimeLineComp.instance.data   = [
      {"data":d1,"colour":this.MATERIAL_BLUE_500, "label": "Game Likes"},
      {"data":d2,"colour":this.MATERIAL_PURPLE_500, "label": "Genre Median Likes"}];
    likesOverTimeLineComp.instance.width  = 1400;
  }

  private async drawGenreCcuTimeline(entry: GameEntry) {
    // Consutrct game and genre data
    const genreCcuData                      = await this.fetchService.fetch("assets/aggregate/steamspy_daily_ccu_per_genre.json");
    const gameCcuLineData: Array<LineData>  = [];
    const genreCcuLineData: Array<LineData> = [];
    for (const el in entry["CCU Histogram"]) {
      gameCcuLineData.push({"date": new Date(el), "value": entry["CCU Histogram"][el]});
      genreCcuLineData.push({"date": new Date(el), "value": genreCcuData[this.currentGenre][el]["mean"]});
    }

    this.genreCcuTimelineContainer.clear();
    const genreCcuTimeline              = this.genreCcuTimelineContainer.createComponent(LineComponent);
    genreCcuTimeline.instance.data      = [
      {"data": genreCcuLineData, "colour": this.MATERIAL_BLUE_500, "label": "Genre"},
      {"data": gameCcuLineData,  "colour": this.MATERIAL_PURPLE_500, "label": "Game"}];
    genreCcuTimeline.instance.width = 1400;
  }

  private drawGenreSection(entry: GameEntry) {
    // Load common daata
    const radarDataThis = this.generateRadarDataThisGame(entry);

    this.drawGenrePopularityText(entry);
    this.drawGenreReleaseTimeline(entry);
    this.drawGenreRadarChart(radarDataThis);
    this.drawGenreBoxChart(radarDataThis);
    this.drawGenreCompletionDonut(entry);
    this.drawGenreLikeTimeline(entry);
    this.drawGenreCcuTimeline(entry);
  }
  /* ========== GENRE SECTION END ========== */

  async onGameSelection(game: KaggleGame) {
    // Change active game and genre; load game data
    this.currentGame                        = game;
    this.currentGenre                       = this.currentGame.genre[0];
    const entry: GameEntry                  = await this.fetchService.fetchFromTree(this.currentGame.appid);

    this.drawGameSection(entry);
    this.drawAllGamesSection(entry);
    this.drawGenreSection(entry);
  }

  async onGenreSelection(newGenreSelection: string) {
    this.currentGenre       = newGenreSelection;
    const entry: GameEntry  = await this.fetchService.fetchFromTree(this.currentGame.appid);

    this.drawGenreSection(entry);
  }

  private _filter(value: string): KaggleGame[] {
    // noinspection SuspiciousTypeOfGuard
    if (typeof value !== "string") {
      console.log("TODO: fix this issue");
      return [];
    }

    let result: KaggleGame[];
    if (value === "") { result = this.data.slice(0, this.optionsLength); }
    else {
      const filterValue = value.toLowerCase();
      result = this.data
        .filter(game => game.name.toLowerCase().includes(filterValue))
        .slice(0, this.optionsLength);
    }

    return result;
  }
}
