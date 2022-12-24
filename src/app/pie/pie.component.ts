import {AfterViewInit, Component, Input} from '@angular/core';
import * as d3 from 'd3';
import {PieArcDatum} from 'd3';
import {IdService} from "../id.service";
import {TooltipComponent} from "../tooltip/tooltip.component";
import {PieData} from './pieData';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.sass']
})

export class PieComponent implements AfterViewInit {

  @Input() data!: PieData[];
  instanceId: string;

  constructor(private idService: IdService) {
    this.instanceId = idService.generateId();
  }

  ngAfterViewInit(): void {
    if (this.data == undefined) {
      this.data = [
        {name: "Alex", ratio: Math.random()},
        {name: "Shelly", ratio: Math.random()},
        {name: "Clark", ratio: Math.random()},
        {name: "Matt", ratio: Math.random()},
        {name: "Jolene", ratio: Math.random()}
      ];
    }
    this.drawPie();
  }

  @Input() width  = 500;
  @Input() height = 500;

  // Margining parameters
  @Input() horizontalMargin       = 600;
  @Input() verticalMargin         = 300;
  @Input() legendHorizontalOffset = 250;
  @Input() legendVerticalOffset   = 20;

  drawPie(): void {
    let sum = 0;
    for (const datum of this.data) { sum += datum.ratio; }

    this.data.map((x) => {
      let newRatio = x.ratio / sum;
      newRatio = parseFloat((newRatio * 100).toFixed(1));
      x.ratio = newRatio;
      return x;
    });

    const color = d3.scaleOrdinal()
      .domain((d3.extent(this.data, (d) => d.name) as unknown) as string)
      .range(d3.schemeCategory10);

    const svg = d3.select("svg." + this.instanceId);

    const arcGroup = svg.append("g")
      .attr("transform", `translate(${this.horizontalMargin / 2}, ${this.verticalMargin / 2})`);

    const pie = d3.pie<PieData>()
      .sort(null)
      .value((d) => d.ratio);

    const path = d3.arc<PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(85);

    const arcs = arcGroup.selectAll("arc")
      .data(pie(this.data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("fill", (d) => color(d.data.name) as string)
      .attr("d", path);

    arcs.append("text")
      .text((d) => d.data.ratio)
      .attr("transform", function (d) {
        const translation = path.centroid(d);
        if (d.data.ratio < 5) {
          translation[0] *= 2.3;
          translation[1] *= 2.3;
        }
        translation[0] -= this.getBBox().width / 2;
        translation[1] += 5;
        return `translate(${translation})`;
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
      .attr("transform", `translate(${this.legendHorizontalOffset}, ${this.legendVerticalOffset})`);

    legendGroup.selectAll("labelSquare")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("y", (d, i) => i * 15)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => color(d.name) as string);

    legendGroup.selectAll("labelName")
      .data(this.data)
      .enter()
      .append("text")
      .attr("x", 15)
      .attr("y", (d, i) => i * 15 + 9.5)
      .text((d) => d.name);
  }
}
