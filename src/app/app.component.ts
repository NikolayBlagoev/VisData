import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatOption} from '@angular/material/core';
import {map, Observable, startWith} from "rxjs";
import initialGame from "../assets/initial_game.json";
import {GameEntry, KaggleGame} from "./data-types";
import {EntryTreeService} from "./entry-tree.service";
import {LineComponent} from "./line/line.component";
import {PieComponent} from "./pie/pie.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit {
  title = 'VisData';

  readonly optionsLength = 50;

  data: KaggleGame[] = [];

  currentGame: KaggleGame = initialGame;
  currentGenre: string = initialGame.genre[0];

  hasMetaDummy = true; // TODO: This is only for testing; Replace when collected data processing is finalised

  searchControl = new FormControl();
  filteredData = new Observable<KaggleGame[]>();

  @ViewChild("test", {read: ViewContainerRef}) lineContainer!: ViewContainerRef;

  bla() {
    this.lineContainer.clear();
    this.lineContainer.createComponent(PieComponent);
  }

  constructor(private entryTree: EntryTreeService) {}

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
  }

  onGenreSelection(newGenreSelection: string) {
    console.log(newGenreSelection);
    this.currentGenre = newGenreSelection;
  }

  supportToIconName(isSupported: boolean) { return isSupported ? "check" : "cancel"; }

  test() {console.log("test");}

  extractGameName(game: KaggleGame) {
    return game?.name;
  }

  async onGameSelection(option: MatOption<KaggleGame>) {
    this.currentGame = option.value;
    // console.log(option.value.name);
    this.currentGenre = this.currentGame.genre[0];
    this.filteredData = this.searchControl.valueChanges.pipe(
      startWith(option.value.name),
      map(value => this._filter(value))
    );

    const path = await this.entryTree.getEntryPath(this.currentGame.appid);

    const resp = await fetch(path);
    const entry: GameEntry = JSON.parse(await resp.text());

    const lineComponent = this.lineContainer.createComponent(LineComponent);
    lineComponent.instance.data = entry["Like Histogram"];
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
