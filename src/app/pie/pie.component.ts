import {AfterViewInit, Component, Input, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {PieArcDatum} from 'd3';
import {IdService} from "../id.service";
import {TooltipComponent} from "../tooltip/tooltip.component";
import {PieData} from './pieData';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class PieComponent implements AfterViewInit {

  @Input() data!: PieData[];
  @Input() highlighted!: number;
  instanceId: string;

  constructor(private idService: IdService) {
    this.instanceId = idService.generateId();
  }

  ngAfterViewInit(): void {
    this.drawPie();
  }

  @Input() width  = 600;
  @Input() height = 400;

  // Margining parameters
  @Input() horizontalOffset       = 250;
  @Input() verticalOffset         = 200;
  @Input() legendHorizontalOffset = 250;
  @Input() legendVerticalOffset   = 0;

  // Drawing parameters
  @Input() radius                 = 140;
  @Input() labelRadius            = 160;
  @Input() labelFontSize          = 20;
  @Input() legendSquareSize       = 25;
  @Input() legendFontSize         = 16;
  @Input() legendTextHorizontalOffset = 30;
  @Input() legendTextVerticalOffset   = 20;

  readonly highlightColor = "#F44336";

  drawPie(): void {
    let sum = 0;
    for (const datum of this.data) {
      sum += datum.amount;
    }

    this.data.map((x) => {
      let ratio = x.amount / sum;
      ratio = parseFloat((ratio * 100).toFixed(1));
      x.amount = ratio;
      return x;
    });

    const color = d3.scaleOrdinal()
      .domain((d3.extent(this.data, (d) => d.name) as unknown) as string)
      .range(d3.schemePuOr[10]);

    const svg = d3.select("svg." + this.instanceId);

    const arcGroup = svg.append("g")
      .attr("transform", `translate(${this.horizontalOffset}, ${this.verticalOffset})`);

    const pie = d3.pie<PieData>()
      .sort(null)
      .value((d) => d.amount);

    const path = d3.arc<PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(this.radius);

    const arcs = arcGroup.selectAll("arc")
      .data(pie(this.data))
      .enter()
      .append("g");

    arcs.append("path")
      .attr("fill", (d, i) => {
        if (i == this.highlighted) return this.highlightColor;
        return color(d.data.name) as string;
      })
      .attr("d", path)
      .classed("pie-slice", true);

    const labelRadius = this.labelRadius;
    arcs.append("text")
      .text((d) => `${d.data.amount}%`)
      .attr("font-size", `${this.labelFontSize}px`)
      .attr("font-weight", 600)
      .attr("transform", function (d) {
        // Pythagorean theorem for hypotenuse
        const c = path.centroid(d);
        const x = c[0];
        const y = c[1];
        const h = Math.sqrt((x * x) + (y * y));
        return `translate(${(x / h) * labelRadius}, ${(y / h) * labelRadius})`;
      })
      .attr("text-anchor", function(d) {
        // Are we past the center?
        return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
      });

    const tooltip = new TooltipComponent();

    arcs.on("mouseenter", function (event, d) {
        tooltip.setVisible();
        tooltip.setText(d.data.name);

        d3.select(this)
          .transition()
          .duration(150)
          .attr("transform", `translate(${path.centroid(d).map(x => x / 4)})`);
      })
      .on("mouseleave", function () {
        tooltip.setHidden();

        d3.select(this)
          .transition()
          .duration(100)
          .attr("transform", "translate(0,0)");
      });

    const legendGroup = svg.append("g")
      .attr("transform", `translate(${this.horizontalOffset + this.legendHorizontalOffset}, ${this.legendVerticalOffset})`);

    legendGroup.selectAll("labelSquare")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("y", (d, i) => i * this.legendSquareSize)
      .attr("width", this.legendSquareSize)
      .attr("height", this.legendSquareSize)
      .attr("fill", (d) => color(d.name) as string)
      .classed("pie-legend-square", true);

    legendGroup.selectAll("labelName")
      .data(this.data)
      .enter()
      .append("text")
      .attr("x", this.legendTextHorizontalOffset)
      .attr("y", (d, i) => i * this.legendSquareSize + this.legendTextVerticalOffset)
      .attr("font-size", `${this.legendFontSize}px`)
      .text((d) => d.name);
  }
}
