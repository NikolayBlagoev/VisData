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
        {name: "Alex", amount: Math.random()},
        {name: "Shelly", amount: Math.random()},
        {name: "Clark", amount: Math.random()},
        {name: "Matt", amount: Math.random()},
        {name: "Jolene", amount: Math.random()}
      ];
    }
  }

}
