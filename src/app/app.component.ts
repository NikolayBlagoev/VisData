import {AfterViewInit, Component, NgZone, OnInit, QueryList, ViewChild, ViewContainerRef} from '@angular/core';
import {PieComponent} from "./pie/pie.component";
import {FormControl} from "@angular/forms";
import {IdService} from "./id.service";
import {map, Observable, startWith} from "rxjs";
import {CdkScrollable, ScrollDispatcher} from "@angular/cdk/overlay";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit { //, AfterViewInit {
  title = 'VisData';

  searchControl = new FormControl();
  options: string[] = [];
  filteredOptions= new Observable<string[]>();

  @ViewChild("pieContainer", {read: ViewContainerRef}) containerRef!: ViewContainerRef;

  constructor(private idService: IdService) {
              // private scrollDispatcher: ScrollDispatcher,
              // private ngZone: NgZone) {
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

  // ngAfterViewInit() {
  //   this.scrollDispatcher.scrolled().pipe(
  //
  //   ).subscribe((value: CdkScrollable | void) => {
  //     console.log(value);
  //   });
  //
  //   this.ngZone.run(() => console.log("test"));
  // }

  private _filter(value: string): string[] {
    let result: string[];

    if (value === "") {
      result = this.options.slice(0, 50);
    }
    else {
      const filterValue = value.toLowerCase();

      result = this.options
        .filter(option => option.toLowerCase().includes(filterValue))
        .slice(0, 50);
    }

    return result;
  }
}
