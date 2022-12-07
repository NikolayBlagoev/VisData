import {Component, OnInit} from '@angular/core';
import {getTooltip} from "./tooltipUtil";

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.sass']
})

export class TooltipComponent implements OnInit {

  public tooltip = getTooltip();

  ngOnInit(): void {
    document.onmousemove = (event) => {
      getTooltip()
        .style("top", (event.clientY - 10) + "px")
        .style("left",(event.clientX + 15) + "px");
    };
  }

  setVisible() {
    this.tooltip.style("visibility", "visible");
    return this;
  }

  setHidden() {
    this.tooltip.style("visibility", "hidden");
    return this;
  }

  setText(text: string) {
    this.tooltip.text(text);
    return this;
  }

}
