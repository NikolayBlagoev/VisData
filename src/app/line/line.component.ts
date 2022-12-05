import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.sass']
})
export class LineComponent implements OnInit {
  
  private svg;
  private margin = 80;
  private h = 500;
  private w = 900;
  ngOnInit(): void {
    this.createSvg();
    this.drawLine(this.dset);
    
  }

  private createSvg(): void {
    this.svg = d3.select("figure#line")
    .append("svg")
    .attr("width", this.w)
    .attr("height", this.h )
    .append("g")
    .style("user-select","none");
  }

  private drawLine(data: any[]): void {

    data = data.map(d => d.date.toString());
    const max_el = data.reduce((acc, e1) => acc = acc > e1.date ? acc : e1.date, -1000);
    const min_el = data.reduce((acc, e1) => acc = acc < e1.date ? acc : e1.date, 100000000000000);
    // console.log(data[0]);
    const x = d3.scaleTime()
      .range([0, this.w])
      .domain([d3.timeFormat("%d-%m-%Y")(min_el),max_el]);
    this.svg.append("g")
      .attr("transform", "translate(0," + (this.h-100) + ")")
      .call(d3.axisBottom(x));
  }
  private dset = [
    {
      "date": 1667260800,
      "recommendations_up": 20,
      "recommendations_down": 2
    },
    {
      "date": 1667347200,
      "recommendations_up": 21,
      "recommendations_down": 0
    },
    {
      "date": 1667433600,
      "recommendations_up": 27,
      "recommendations_down": 3
    },
    {
      "date": 1667520000,
      "recommendations_up": 19,
      "recommendations_down": 1
    },
    {
      "date": 1667606400,
      "recommendations_up": 23,
      "recommendations_down": 0
    },
    {
      "date": 1667692800,
      "recommendations_up": 32,
      "recommendations_down": 1
    },
    {
      "date": 1667779200,
      "recommendations_up": 24,
      "recommendations_down": 2
    },
    {
      "date": 1667865600,
      "recommendations_up": 20,
      "recommendations_down": 2
    },
    {
      "date": 1667952000,
      "recommendations_up": 18,
      "recommendations_down": 0
    },
    {
      "date": 1668038400,
      "recommendations_up": 20,
      "recommendations_down": 0
    },
    {
      "date": 1668124800,
      "recommendations_up": 27,
      "recommendations_down": 2
    },
    {
      "date": 1668211200,
      "recommendations_up": 32,
      "recommendations_down": 1
    },
    {
      "date": 1668297600,
      "recommendations_up": 29,
      "recommendations_down": 0
    },
    {
      "date": 1668384000,
      "recommendations_up": 34,
      "recommendations_down": 1
    },
    {
      "date": 1668470400,
      "recommendations_up": 27,
      "recommendations_down": 2
    },
    {
      "date": 1668556800,
      "recommendations_up": 30,
      "recommendations_down": 0
    },
    {
      "date": 1668643200,
      "recommendations_up": 21,
      "recommendations_down": 1
    },
    {
      "date": 1668729600,
      "recommendations_up": 28,
      "recommendations_down": 0
    },
    {
      "date": 1668816000,
      "recommendations_up": 32,
      "recommendations_down": 2
    },
    {
      "date": 1668902400,
      "recommendations_up": 27,
      "recommendations_down": 3
    },
    {
      "date": 1668988800,
      "recommendations_up": 28,
      "recommendations_down": 3
    },
    {
      "date": 1669075200,
      "recommendations_up": 462,
      "recommendations_down": 8
    },
    {
      "date": 1669161600,
      "recommendations_up": 903,
      "recommendations_down": 10
    },
    {
      "date": 1669248000,
      "recommendations_up": 569,
      "recommendations_down": 7
    },
    {
      "date": 1669334400,
      "recommendations_up": 405,
      "recommendations_down": 4
    },
    {
      "date": 1669420800,
      "recommendations_up": 415,
      "recommendations_down": 6
    },
    {
      "date": 1669507200,
      "recommendations_up": 371,
      "recommendations_down": 6
    },
    {
      "date": 1669593600,
      "recommendations_up": 279,
      "recommendations_down": 6
    },
    {
      "date": 1669680000,
      "recommendations_up": 210,
      "recommendations_down": 3
    },
    {
      "date": 1669766400,
      "recommendations_up": 22,
      "recommendations_down": 1
    }
  ]
}
