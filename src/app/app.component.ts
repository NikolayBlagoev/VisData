import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {PieComponent} from "./pie/pie.component";
import {FormControl} from "@angular/forms";
import {IdService} from "./id.service";
import {map, Observable, startWith} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit {
  title = 'VisData';

  searchControl = new FormControl();
  options: string[] = [];
  filteredOptions= new Observable<string[]>();

  @ViewChild("pieContainer", {read: ViewContainerRef}) containerRef!: ViewContainerRef;

  constructor(private idService: IdService) {
    const start = Date.now();
    for (let i = 0; i < 56000; i++) {
      this.options.push(idService.generateId());
    }
    this.options.sort();
    console.log(`Generation took: ${Date.now() - start}ms`);
  }

  showPie() {
    this.containerRef.createComponent(PieComponent);
  }

  ngOnInit() {
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(""),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {

    let result: string[];
    if (value === "") {
      result = this.options.slice(0, 20);
    } else {
      const filterValue = value.toLowerCase();

      result = this.options
        .filter(option => {
          console.log("test");
          option.toLowerCase().includes(filterValue);
        })
        .splice(20);
    }

    return result;
  }
}
