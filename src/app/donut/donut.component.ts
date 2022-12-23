import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { DonutData } from './donutData';

@Component({
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class DonutComponent implements AfterViewInit {
  @Input() data: Array<DonutData> = [{"value": 80, "name": "completed"}, {"value": 20, "name": "not"}];
  @Input() displayText: string = "80%";
  @Input() instanceId!: string;

  private svg;
  @Input() horizontalMargin: number = 20;
  @Input() verticalMargin: number   = 20;
  @Input() width: number            = 300;
  @Input() height: number           = 300;

  // Drawing parameters
  @Input() radius: number         = 150;
  @Input() fontSize: number       = 72;
  @Input() ringThickness: number  = 25;

  readonly positiveColor = "#2196F3";
  readonly negativeColor = "#9C27B0";


  ngAfterViewInit(): void {
    this.width = this.width - (this.horizontalMargin * 2);
    this.height = this.height - (this.verticalMargin * 2);
    this.createSvg();
    this.drawDonut();
  }

  private createSvg(): void {
    this.svg = d3.select("figure#" + this.instanceId)
    .append("svg")
    .attr("width", this.width + (this.horizontalMargin * 2))
    .attr("height", this.height + (this.verticalMargin * 2) )
    .append("g")
    .style("user-select","none")
    .attr("transform", `translate(${this.horizontalMargin}, ${this.verticalMargin})`);
  }
  
  private drawDonut(): void {
    // CAN BE USED TO MAKE THE COLOURS DIFFERENT!!
    const color = d3.scaleOrdinal()
                  .domain(this.data.map(elem => elem.name))
                  .range([this.positiveColor, this.negativeColor]);
    
    const pie   = d3.pie()
    const data  = pie(this.data.map(elem => elem.value));

    this.svg.append("g")
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")
            .selectAll('pieses')
            .data(data)
            .enter()
            .append('path')
            .attr('d', d3.arc()
              .innerRadius(this.radius - this.ringThickness) // This is the size of the donut hole
              .outerRadius(this.radius)
            )
            .attr('fill', (d) => color(d))
            .style("stroke-width", "0px")
            .style("opacity", 0.7);
    
    this.svg.append("text")
            .attr("x", this.width/2)
            .attr("y", this.height/2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central") 
            .attr("font-size", this.fontSize + "px")
            .text(this.displayText);           
  }
}
