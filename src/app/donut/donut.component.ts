import { Component, AfterViewInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { DonutData } from './donutData';

@Component({
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.sass']
})
export class DonutComponent implements AfterViewInit {
  private data = [{"val": 80, "name": "completed"}, {"val": 20, "name": "not"}];

  @Input() instanceId!: string;
  private svg;
  @Input() margin!: number;
  @Input() w !: number;
  @Input() h!: number;

  // Control width, height, margin
  public setValues(width, height, margin): void {
    this.margin = margin;
    this.w = width - (this.margin * 2);
    this.h = height - (this.margin * 2);
  }

  ngAfterViewInit(): void {
    this.w = this.w - (this.margin * 2);
    this.h = this.h - (this.margin * 2);
    this.createSvg();
    this.drawDonut(this.data, 150, this.data[0].val+"%", 100, "not");
  }

  private createSvg(): void {
    this.svg = d3.select("figure#" + this.instanceId)
    .append("svg")
    .attr("width", this.w + (this.margin * 2))
    .attr("height", this.h + (this.margin * 2) )
    .append("g")
    .style("user-select","none").attr("transform",
    "translate(" + this.margin + "," + this.margin + ")");
  }

  
  private drawDonut(data: any[], radius: number, displayText: string, font_size: number, name_of_red: string): void {
    
    // CAN BE USED TO MAKE THE COLOURS DIFFERENT!!
    const color = d3.scaleOrdinal()
                  .domain(data)
                  .range(["green","red"]);
    
    const pie = d3.pie()
      .value((d:any) => d.val);

    data = pie(data);

    this.svg.append("g")
            .attr("transform", "translate(" + this.w / 2 + "," + this.h / 2 + ")")
            .selectAll('pieses')
            .data(data)
            .enter()
            .append('path')
            .attr('d', d3.arc()
              .innerRadius(radius-10)         // This is the size of the donut hole
              .outerRadius(radius)
            )
            .attr('fill', (d) => d.data.name == name_of_red? "red":"green" )
            .style("stroke-width", "0px")
            .style("opacity", 0.7);
    
    this.svg.append("text")
            .attr("x", this.w/2)
            .attr("y", this.h/2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central") 
            .attr("font-size", font_size + "px")
            .text(displayText);
           
  }
}
