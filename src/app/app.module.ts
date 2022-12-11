import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BarComponent } from './bar/bar.component';
import { BinScatterComponent } from './bin-scatter/bin-scatter.component';
import { RadarComponent } from './radar/radar.component';
import { PieComponent } from './pie/pie.component';
import {ReactiveFormsModule} from "@angular/forms";
import { TooltipComponent } from './tooltip/tooltip.component';
import { ScrollListComponent } from './scroll-list/scroll-list.component';
import { LineComponent } from './line/line.component';
import { BoxComponent } from './box/box.component';

import { DonutComponent } from './donut/donut.component';

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
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
