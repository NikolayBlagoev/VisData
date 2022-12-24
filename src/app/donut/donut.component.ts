import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { IdService } from '../id.service';
import { DonutData } from './donutData';

@Component({
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class DonutComponent implements AfterViewInit {
  @Input() data: Array<DonutData> = [{"value": 80, "name": "completed"}, {"value": 20, "name": "not"}];
  @Input() displayText = "80%";
  @Input() pos_val =  80;
  instanceId!: string;
  constructor(private idService: IdService) {
    this.instanceId = idService.generateId();
  }

  private svg;
  @Input() horizontalMargin = 20;
  @Input() verticalMargin   = 20;
  @Input() width            = 525;
  @Input() height           = 300;

  // Drawing parameters
  @Input() radius         = 150;
  @Input() fontSize       = 80;
  @Input() ringThickness  = 30;

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
    
    const pie   = d3.pie().sort((d:any)=>{
      // if()
      return -1;
    });
    const data  = pie(this.data.map(elem => elem.value));
    // if(data[0].value != this.data[0].value){
    //   let buff = data[1];
    //   data[1] = data[0];
    //   data[0] = buff;
     
    // }
    // console.log(data);
    // console.log(this.data);
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
            .attr('fill', (d) =>{
              console.log(d);
              
              if(d.data == this.pos_val){
                return this.positiveColor;
              }else{
                return this.negativeColor;
              }
            })
            .classed('donut-arc', true);
    
    this.svg.append("text")
            .attr("x", this.width/2)
            .attr("y", this.height/2)
            .attr("font-size", this.fontSize + "px")
            .text(this.displayText)
            .classed("donut-text", true);           
  }
}
