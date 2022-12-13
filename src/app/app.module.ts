import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BarComponent} from './bar/bar.component';
import {BinScatterComponent} from './bin-scatter/bin-scatter.component';
import {RadarComponent} from './radar/radar.component';
import {PieComponent} from './pie/pie.component';
import {TooltipComponent} from './tooltip/tooltip.component';
import {ScrollListComponent} from './scroll-list/scroll-list.component';
import {LineComponent} from './line/line.component';
import {BoxComponent} from './box/box.component';
import {DonutComponent} from './donut/donut.component';

import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {MatGridListModule} from "@angular/material/grid-list";

@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    BinScatterComponent,
    BoxComponent,
    RadarComponent,
    PieComponent,
    TooltipComponent,
    ScrollListComponent,
    LineComponent,
    DonutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatCardModule,
    MatListModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
