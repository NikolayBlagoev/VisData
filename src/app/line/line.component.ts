import {AfterViewInit, Component, Input, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {TooltipComponent} from '../tooltip/tooltip.component';
import {LineData, LineDataIn, dset} from './lineData';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class LineComponent implements AfterViewInit {
  @Input() instanceId!: string;
  private svg;

  @Input() horizontalMargin: number = 100;
  @Input() verticalMargin: number   = 75;
  @Input() height: number           = 500;
  @Input() width: number            = 1200;

  // Drawing parameters
  @Input() dataLabel: string      = "Likes";
  @Input() circleRadius: number   = 7;
  readonly circleColor            = "#2196F3";
  readonly highlightedCircleColor = "#9C27B0";
  

  ngAfterViewInit(): void {
    this.width  = this.width - (this.horizontalMargin * 2);
    this.height = this.height - (this.verticalMargin * 2);
    this.createSvg();
    this.drawLine(dset, 1500);
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

  private drawLine(data_in: LineDataIn[], initial_likes: number): void {
    const data: LineData[] = data_in.map((el) => {
      initial_likes = initial_likes + el.recommendations_up - el.recommendations_down;
      return {
        "date": new Date(el.date * 1000),
        "value": initial_likes
      };
    });
    const max_el = data.reduce((acc, e1) => acc = acc > e1.date ? acc : e1.date, new Date(0));
    const min_el = data.reduce((acc, e1) => acc = acc < e1.date ? acc : e1.date, new Date());

    const x = d3.scaleTime()
      .range([0, this.width])
      .domain([min_el, max_el]);
    this.svg.append("g")
      .attr("transform", `translate(0, ${this.height})`)
      .call(d3.axisBottom(x).ticks(15, "%d/%m/%Y %H:%M")).selectAll("text")
      .attr("transform", "translate(-10, 0) rotate(-45)")
      .style("text-anchor", "end");
    const y = d3.scaleLinear()
      .domain([data.reduce((acc, e1) => acc = acc < e1.value ? acc : e1.value - 500, 0),
              data.reduce((acc, e1) => acc = acc > e1.value ? acc : e1.value, 0)])
      .range([this.height, 0]);
    this.svg.append("g")
      .call(d3.axisLeft(y));

    const tooltip = new TooltipComponent();

    this.svg.append("path")
      .datum(data)
      .attr("d", d3.line<any>()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); }))
      .classed("line-segment", true);
    this.svg.selectAll("dot")
        .data(data).enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.date); } )
        .attr("cy", function (d) { return y(d.value); } )
        .attr("r", this.circleRadius)
        .attr("fill", this.circleColor)
        .classed("line-dots", true)
        .on("mouseover", (e, d) => {
          tooltip.setText(`${this.dataLabel}: ${d.value}`)
                 .setVisible();
          d3.select(e.target).attr("fill", this.highlightedCircleColor);
        })
        .on("mouseout", (e, _) => {
          tooltip.setHidden();
          d3.select(e.target).attr("fill", this.circleColor);
        });
  }
}
