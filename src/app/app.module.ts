import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BarComponent} from './bar/bar.component';
import {BinScatterComponent} from './bin-scatter/bin-scatter.component';
import {RadarComponent} from './radar/radar.component';
import {PieComponent} from './pie/pie.component';
import {ReactiveFormsModule} from "@angular/forms";
import {TooltipComponent} from './tooltip/tooltip.component';
import {ScrollListComponent} from './scroll-list/scroll-list.component';
import {LineComponent} from './line/line.component';
import {BoxComponent} from './box/box.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";

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
    LineComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule,
        MatInputModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
