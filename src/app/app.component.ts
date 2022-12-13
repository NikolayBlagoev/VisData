import {Component, ElementRef, EventEmitter, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatOption} from '@angular/material/core';
import {MatList} from '@angular/material/list';
import {map, Observable, startWith} from "rxjs";
import {KaggleGame} from "./data-types";
import {PieComponent} from "./pie/pie.component";
import initialGame from "../assets/initial_game.json";
import { MatSelectChange } from '@angular/material/select';

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
  hasMetaDummy: boolean = true; // TODO: This is only for testing; Replace when collected data processing is finalised

  searchControl = new FormControl();
  filteredData = new Observable<KaggleGame[]>();

  @ViewChild("pieContainer", {read: ViewContainerRef}) containerRef!: ViewContainerRef;

  showPie() { this.containerRef.createComponent(PieComponent); }

  onGameSelection(option: MatOption<KaggleGame>) {
    this.currentGame = option.value;
    this.currentGenre = this.currentGame.genre[0];
  }

  onGenreSelection(newGenreSelection: string) { 
    console.log(newGenreSelection);
    this.currentGenre = newGenreSelection; }

  supportToIconName(isSupported: boolean) { return isSupported ? "check" : "cancel"; }

  extractGameName(game: KaggleGame) { return game.name; }

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

  private _filter(value: string): KaggleGame[] {
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
