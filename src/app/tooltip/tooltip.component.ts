import {Component, OnInit} from '@angular/core';
import {getTooltip} from "./tooltipUtil";
import * as d3 from "d3";

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
        .style("top", (event.clientY-10)+"px")
        .style("left",(event.clientX+10)+"px");
    };
  }

  setVisible() {
    this.tooltip.style("visibility", "visible");
  }

  setInvisible() {
    this.tooltip.style("visibility", "hidden");
  }

  setText(text: string) {
    this.tooltip.text(text);
  }

}
