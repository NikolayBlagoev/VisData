import {AfterViewInit, Component, Input, ViewChild, ViewContainerRef} from '@angular/core';

import {PieComponent} from "../pie/pie.component";

@Component({
  selector: 'app-scroll-list',
  templateUrl: './scroll-list.component.html',
  styleUrls: ['./scroll-list.component.sass']
})

export class ScrollListComponent implements AfterViewInit {

  @Input() instanceId!: string;
  @ViewChild("scrollContainer", {read: ViewContainerRef}) containerRef!: ViewContainerRef;

  ngAfterViewInit(): void {

    const list = document.querySelector("#" + this.instanceId + "ScrollList")!;

    for (let i = 20; i > 0; i--) {
      const element = document.createElement("li");
      const textHolder = document.createElement("h2");

      textHolder.textContent = i.toString();

      element.append(textHolder);

      list?.prepend(element);
    }
  }

  addItems() {
    const {clientHeight, scrollHeight, scrollTop}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      = document.querySelector("#" + this.instanceId + "ScrollContainer")!;

    const distToBottom = scrollHeight - scrollTop - clientHeight;
    if (distToBottom < 400) {
      const pieRef = this.containerRef.createComponent(PieComponent);
      pieRef.instance.data = [
        {name: "Alex", ratio: Math.random()},
        {name: "Shelly", ratio: Math.random()},
        {name: "Clark", ratio: Math.random()},
        {name: "Matt", ratio: Math.random()},
        {name: "Jolene", ratio: Math.random()}
      ];
    }
  }

}
