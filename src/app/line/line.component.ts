import {AfterViewInit, Component, Input, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {IdService} from "../id.service";
import {TooltipComponent} from '../tooltip/tooltip.component';
import {LineContainer, LineData} from "./lineData";

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class LineComponent implements AfterViewInit {
  instanceId!: string;
  @Input() data!: LineContainer[];
  @Input() max_render = -1;
  
  // SVG container and dimension specification
  private svg;
  @Input() horizontalMargin = 100;
  @Input() verticalMargin   = 75;
  @Input() height           = 500;
  @Input() width            = 1200;

  // Drawing parameters
  @Input() circleRadius           = 7;
  readonly highlightedCircleColor = "#9C27B0";
  readonly selectedCircleColor    = "#FF9800";

  constructor(private idService: IdService) { this.instanceId = idService.generateId(); }

  ngAfterViewInit(): void {
    this.width  = this.width - (this.horizontalMargin * 2);
    this.height = this.height - (this.verticalMargin * 2);
    this.createSvg();
    
    this.drawLine(this.data);
  }

  private createSvg(): void {
    this.svg = d3.select(`figure#${this.instanceId}Line`)
      .append("svg")
      .attr("width", this.width + (this.horizontalMargin * 2))
      .attr("height", this.height + (this.verticalMargin * 2))
      .append("g")
      .style("user-select", "none")
      .attr("transform", `translate(${this.horizontalMargin / 2}, ${this.verticalMargin / 2})`);
  }

  private drawLine(inp: LineContainer[]) {
    let yRange = [0];
    let y_max = Number.MIN_SAFE_INTEGER;
    if (this.max_render != -1) { yRange = [0, this.max_render]; }
    else {
      inp.forEach(el => {
        const res = el.data.reduce((acc, e1) => acc > e1.value ? acc : e1.value, Number.MIN_SAFE_INTEGER);
        y_max = y_max > res ? y_max : res;
      });
      yRange = [0,y_max];
    }

    const max_el = inp[0].data.reduce((acc, e1) => acc > e1.date ? acc : e1.date, new Date(0));
    const min_el = inp[0].data.reduce((acc, e1) => acc < e1.date ? acc : e1.date, new Date());

    const xScale = d3.scaleTime()
      .range([0, this.width])
      .domain([min_el, max_el]);
    this.svg.append("g")
      .attr("transform", `translate(0, ${this.height})`)
      .call(d3.axisBottom(xScale).ticks(15, "%d/%m/%Y")).selectAll("text")
      .attr("transform", "translate(-10, 0) rotate(-45)")
      .style("text-anchor", "end");
    const yScale = d3.scaleLinear()
      .domain(yRange)
      .range([this.height, 0]);
    this.svg.append("g")
      .call(d3.axisLeft(yScale));

    const tooltip = new TooltipComponent();
    inp.forEach((container, containerIdx) => {
      this.svg.append("path")
        .datum(container.data)
        .attr("d", d3.line<any>()
                     .x(function(d) { return xScale(d.date); })
                     .y(function(d) { return yScale(d.value); }))
        .attr("stroke", container.colour)
        .classed("line-segment", true);
      this.svg.selectAll("dot")
          .data(container.data).enter()
          .append("circle")
          .attr("cx", function (d) { return xScale(d.date); } )
          .attr("cy", function (d) { return yScale(d.value); } )
          .attr("r", this.circleRadius)
          .attr("fill", (d) => {
            if (container.highlight !== undefined && this.inHighlights(d.date, containerIdx)) { return this.highlightedCircleColor; }
            else { return container.colour; }
          })
          .classed("line-dots", true)
          .on("mouseover", (e, d) => {
            tooltip.setText(`${container.label}: ${d.value}`)
                  .setVisible();
            d3.select(e.target).attr("fill", this.selectedCircleColor);
          })
          .on("mouseout", (e, _) => {
            tooltip.setHidden();
            d3.select(e.target).attr("fill", container.colour);
          });
        });
  }

  /**
   * Check if the given date should be highlighted on a specific line
   * @param date Date to check for presence
   * @param containerIdx Index of the container in `this.data` to check for presence
   */
  private inHighlights(date: Date, containerIdx: number): boolean {
    if (this.data[containerIdx].highlight === undefined) { return false; }
    
    for (const currentDate of this.data[containerIdx].highlight!) {
      if (currentDate.getTime() == date.getTime()) { return true; }
    }
    return false;
  }
}
