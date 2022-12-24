import {AfterViewInit, Component, Input, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {HistogramData} from "../data-types";
import {IdService} from "../id.service";
import {TooltipComponent} from '../tooltip/tooltip.component';
import {LineData} from "./lineData";

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class LineComponent implements AfterViewInit {

  instanceId!: string;
  @Input() data!: [LineData[], number];
  @Input() max_render: number = -1;
  private svg;

  constructor(private idService: IdService) {
    this.instanceId = idService.generateId();
  }

  @Input() horizontalMargin = 100;
  @Input() verticalMargin   = 75;
  @Input() height           = 500;
  @Input() width            = 1200;

  // Drawing parameters
  @Input() dataLabel              = "Likes";
  @Input() circleRadius           = 7;
  readonly circleColor            = "#2196F3";
  readonly highlightedCircleColor = "#9C27B0";

  ngAfterViewInit(): void {
    this.width  = this.width - (this.horizontalMargin * 2);
    this.height = this.height - (this.verticalMargin * 2);
    this.createSvg();
    this.drawLine(this.data[0], this.data[1]);
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
  public fix_data(in_data: HistogramData[]){
    if (in_data[0].recommendations_up + in_data[0].recommendations_down == 0) {
      in_data = in_data.slice(1);
    }

    // let currentValue = initialLikes;

    // Map histogram to proper data
    const data: LineData[] = in_data.map((el) => {
      // currentValue = currentValue + el.recommendations_up - el.recommendations_down;
      const up = el.recommendations_up;
      const down = el.recommendations_down;
      const total = Math.max(1, up + down);
      const currentValue = (up / total) * 100;

      return {
        "date": new Date(el.date * 1000),
        "value": currentValue
      };
    });
    return data;
  }
  private drawLine(data: LineData[], initialLikes: number) {
    let yRange = [0];
    if(this.max_render!=-1){
      yRange = [0, this.max_render];
    }else{
      yRange = [0,
        data.reduce((acc, e1) => acc > e1.value ? acc : e1.value, Number.MIN_SAFE_INTEGER)];
  
    }
    // const yRange = [data.reduce((acc, e1) => acc < e1.value ? acc: e1.value, Number.MAX_SAFE_INTEGER),
    //   data.reduce((acc, e1) => acc > e1.value ? acc : e1.value, Number.MIN_SAFE_INTEGER)];

   

    // data = data.map(d => d.date.toString());
    const max_el = data.reduce((acc, e1) => acc > e1.date ? acc : e1.date, new Date(0));
    const min_el = data.reduce((acc, e1) => acc < e1.date ? acc : e1.date, new Date());
    
    const x = d3.scaleTime()
      .range([0, this.width])
      .domain([min_el, max_el]);
    this.svg.append("g")
      .attr("transform", `translate(0, ${this.height})`)
      .call(d3.axisBottom(x).ticks(15, "%d/%m/%Y")).selectAll("text")
      .attr("transform", "translate(-10, 0) rotate(-45)")
      .style("text-anchor", "end");
    const y = d3.scaleLinear()
      .domain(yRange)
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
