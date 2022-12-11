import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.sass']
})
export class DonutComponent implements OnInit {
  private data = [{"val": 80, "name": "completed"}, {"val": 20, "name": "not"}];
  private svg;
  private margin = 80;
  private w = 1200 - (this.margin * 2);
  private h = 600 - (this.margin * 2);

  ngOnInit(): void {
    this.createSvg();
    this.drawDonut(this.data, 200);
  }

  private createSvg(): void {
    this.svg = d3.select("figure#donut")
    .append("svg")
    .attr("width", this.w + (this.margin * 2))
    .attr("height", this.h + (this.margin * 2) )
    .append("g")
    .style("user-select","none").attr("transform",
    "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawDonut(data: any[], radius: number): void {
    const color = d3.scaleOrdinal()
                  .domain(data)
                  .range(["green","red"])
    const pie = d3.pie()
      .value((d:any) => d.val);
    data = pie(data);
    console.log("YEE");
    console.log(data);

    this.svg.append("g")
            .attr("transform", "translate(" + this.w / 2 + "," + this.h / 2 + ")")
            .selectAll('pies')
            .data(data)
            .enter()
            .append('path')
            .attr('d', d3.arc()
              .innerRadius(radius-10)         // This is the size of the donut hole
              .outerRadius(radius)
            )
            .attr('fill', (d) => d.data.name == "not"? "red":"green" )
            .attr("stroke", "black")
            .style("stroke-width", "0px")
            .style("opacity", 0.7)
    this.svg.append("text")
            .attr("x", this.w/2)
            .attr("y", this.h/2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central") 
            .attr("font-size", "130px")
            .text(data[0].data.val+"%");
           
  }
}
