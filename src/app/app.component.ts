import {Component, ViewChild, ViewContainerRef} from '@angular/core';
import {PieComponent} from "./pie/pie.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'VisData';

  @ViewChild("pieContainer", {read: ViewContainerRef}) containerRef!: ViewContainerRef;

  showPie() {
    this.containerRef.createComponent(PieComponent);
  }
}
