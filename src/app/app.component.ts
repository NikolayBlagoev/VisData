import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from "@angular/forms";
import {map, Observable, startWith} from "rxjs";
import initialGame from "../assets/initial_game.json";
import {BoxComponent} from "./box/box.component";
import {BoxData} from "./box/boxData";
import {GameEntry, KaggleGame} from "./data-types";
import { DonutComponent } from './donut/donut.component';
import {FetchService} from "./fetch.service";
import {LineComponent} from "./line/line.component";
import { LineData } from './line/lineData';
import { PieComponent } from './pie/pie.component';
import {RadarComponent} from "./radar/radar.component";
import {TooltipComponent} from './tooltip/tooltip.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit {
  title = 'VisData';
  t = new TooltipComponent();
  readonly optionsLength = 50;

  data: KaggleGame[] = [];

  currentGame: KaggleGame = initialGame;
  currentGenre: string = initialGame.genre[0];

  hasMetaDummy = true; // TODO: This is only for testing; Replace when collected data processing is finalised

  searchControl = new FormControl();
  filteredData = new Observable<KaggleGame[]>();

  @ViewChild("categoricalDataRadar", {read: ViewContainerRef}) categoricalDataRadarContainer!: ViewContainerRef;
  @ViewChild("categoricalDataBox", {read: ViewContainerRef}) categoricalDataBoxContainer!: ViewContainerRef;
  @ViewChild("gameCompletionDonut", {read: ViewContainerRef}) gameCompletionDonutContainer!: ViewContainerRef;
  @ViewChild("likesOverTimeLine", {read: ViewContainerRef}) likesOverTimeLineContainer!: ViewContainerRef;
  @ViewChild("ccuOverTimeLine", {read: ViewContainerRef}) ccuOverTimeLineContainer!: ViewContainerRef;

  constructor(private fetchService: FetchService) {}

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
  }

  onGenreSelection(newGenreSelection: string) {
    console.log(newGenreSelection);
    this.currentGenre = newGenreSelection;
  }

  supportToIconName(isSupported: boolean) { return isSupported ? "check" : "close"; }

  extractGameName(game: KaggleGame) {
    return game?.name;
  }

  async onGameSelection(game: KaggleGame) {
    this.currentGame = game;
    // console.log(option.value.name);
    this.currentGenre = this.currentGame.genre[0];
    // this.filteredData = this.searchControl.valueChanges.pipe(
    //   startWith(game.name),
    //   map(value => this._filter(value))
    // );

    const entry: GameEntry = await this.fetchService.fetchFromTree(this.currentGame.appid);

    const features = ["Likes", "Recent Likes", "Playtime", "Average Playtime", "Owners"];
    const ownerMap = await this.fetchService.fetch("assets/aggregate/unique_owners.json");

    const likeAvg = await this.fetchService.fetch("assets/aggregate/total_likes.json");
    // seems wrong \/
    const recentLikeAvg = await this.fetchService.fetch("assets/aggregate/30_days_likes.json");

    const radarDataAll = {
      "Likes": likeAvg["mean"] * 10,
      "Recent Likes": recentLikeAvg["mean"] * 10,
      "Playtime": 0,
      "Average Playtime": 0,
      "Owners": 0
    };

    const radarDataThis = {
      "Likes": entry.positive / (entry.positive + entry.negative) * 10,
      "Recent Likes": entry["Up 30 Days"] / (entry["Up 30 Days"] + entry["Down 30 Days"]) * 10,
      "Playtime": 0,
      "Average Playtime": 0,
      "Owners": ownerMap[entry.owners]
    };
    this.gameCompletionDonutContainer.clear();
    const gameComplDonut = this.gameCompletionDonutContainer.createComponent(DonutComponent);
    if(entry.Completion == -1){
      gameComplDonut.instance.data =  [{"value": 0, "name": "completed"}, {"value": 100, "name": "not"}];
      gameComplDonut.instance.displayText = "N/A";
      gameComplDonut.instance.pos_val = entry.Completion;
    }else{
      
      gameComplDonut.instance.data =  [{"value": entry.Completion, "name": "completed"}, {"value": 100-entry.Completion, "name": "not"}];
      gameComplDonut.instance.displayText = entry.Completion.toFixed(1)+"%";
      gameComplDonut.instance.pos_val = entry.Completion;
    }
   
    this.categoricalDataRadarContainer.clear();
    const categoricalDataRadarComp = this.categoricalDataRadarContainer.createComponent(RadarComponent);
    

    categoricalDataRadarComp.instance.data = [[radarDataAll, radarDataThis], features];
    categoricalDataRadarComp.instance.height = 400;
    categoricalDataRadarComp.instance.centerHorizontalOffset = 225;
    categoricalDataRadarComp.instance.centerVerticalOffset = 200;
    categoricalDataRadarComp.instance.maxRadius = 150;

    const boxDataAll: BoxData[] = [
      {
        label: "Likes",
        min: likeAvg["min"] * 100,
        max: likeAvg["max"] * 100,
        median: likeAvg["median"] * 100,
        lower_quartile: likeAvg["25th"] * 100,
        upper_quartile: likeAvg["75th"] * 100
      },
      {
        label: "Recent Likes",
        min: recentLikeAvg["min"] * 100,
        max: recentLikeAvg["max"] * 100,
        median: recentLikeAvg["median"] * 100,
        lower_quartile: recentLikeAvg["25th"] * 100,
        upper_quartile: recentLikeAvg["75th"] * 100
      },
      {
        label: "Playtime",
        min: 1,
        max: 10,
        median: 5,
        lower_quartile: 2,
        upper_quartile: 7
      },
      {
        label: "Average Playtime",
        min: 1,
        max: 10,
        median: 5,
        lower_quartile: 2,
        upper_quartile: 7
      },
      {
        label: "Owners",
        min: 0,
        max: 10,
        median: 5,
        lower_quartile: 2,
        upper_quartile: 7
      }
    ];

    const boxDataThis: Map<string, number> = new Map(Object.entries(radarDataThis));
    boxDataThis.set("Likes", boxDataThis.get("Likes")! * 10);
    boxDataThis.set("Recent Likes", boxDataThis.get("Recent Likes")! * 10);

    this.categoricalDataBoxContainer.clear();
    const categoricalDataBoxComp = this.categoricalDataBoxContainer.createComponent(BoxComponent);
    categoricalDataBoxComp.instance.data = [boxDataAll, boxDataThis];
    categoricalDataBoxComp.instance.height = 500;
    categoricalDataBoxComp.instance.width = 550;

    const startingLikes = (entry.positive - entry["Up 30 Days"]) - (entry.negative - entry["Down 30 Days"]);

    this.likesOverTimeLineContainer.clear();
    const likesOverTimeLineComp = this.likesOverTimeLineContainer.createComponent(LineComponent);
    likesOverTimeLineComp.instance.data = [likesOverTimeLineComp.instance.fix_data(entry["Like Histogram"]), startingLikes];
    likesOverTimeLineComp.instance.width = 1450;
    // console.log(entry);
    const ccu_histogram: LineData[] = []
    for(let el in entry["CCU Histogram"]){
      ccu_histogram.push({"date": new Date(el), "value": entry["CCU Histogram"][el]})
    }
    this.ccuOverTimeLineContainer.clear();
    const ccuOverTimeLineComp = this.ccuOverTimeLineContainer.createComponent(LineComponent);
    ccuOverTimeLineComp.instance.data = [ccu_histogram, 0];
    ccuOverTimeLineComp.instance.width = 1450;
    ccuOverTimeLineComp.instance.dataLabel = "Players";
  }

  onEnterGameReviews() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width","400px");
    t.setText("Shows positive reviews as percentage of total reviews for Steam user scores, Metacritic critic scores, and Metacritic user scores");
  }

  onEnterLikes30Days() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width","400px");
    t.setText("Shows ????");
  }

  onEnterGenreCount() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width","400px");
    t.setText("Shows the number of games made per genre (limited to genres above a certain threshold). Highlighted are the genres of the selected game\r\nNOTE: A game can be in multiple genres");
  }

  onEnterCCU30Days() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width","400px");
    t.setText("Shows peak active players for each day for the given time period");
  }

  onEnterGameCompletion() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width","400px");
    t.setText("Shows the heuristically determined percentage of total players who have completed the game");
  }

  onEnterNumericData() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width","400px");
    t.setText("Shows two selected pieces of numeric data plotted against each other. Used for finding correlations between quantities");
  }

  onEnterPriceBrackets() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width","400px");
    t.setText("Shows the price distribution of games on Steam");
  }

  onLeaveSectionInfo(){
    const t = new TooltipComponent();
    t.setHidden();
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
