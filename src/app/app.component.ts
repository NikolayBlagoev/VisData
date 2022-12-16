import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from "@angular/forms";
import {map, Observable, startWith} from "rxjs";
import {KaggleGame} from "./data-types";
import {EntryTreeService} from "./entry-tree.service";
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

  searchControl = new FormControl();
  filteredData = new Observable<KaggleGame[]>();

  @ViewChild("pieContainer", {read: ViewContainerRef}) containerRef!: ViewContainerRef;

  constructor(private entryTree: EntryTreeService) {}

  showPie() {
    this.containerRef.createComponent(PieComponent);
  }

  async ngOnInit() {
    this.entryTree.getEntryPath(1223210).then(res => console.log(res));

    const start = Date.now();

    const res = await fetch("assets/kaggle_data.json");
    const value = await res.text();

    this.data = JSON.parse(value);
    this.data = this.data.sort((a, b) => {
      return -(a.positive - b.positive);
    });
    console.log(this.data[0]);

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
