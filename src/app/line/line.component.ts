import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { getTooltip } from '../tooltip/tooltipUtil';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.sass']
})
export class LineComponent implements OnInit {
  
  private svg;
  private margin = 120;
  private h = 500;
  private w = 900;
  ngOnInit(): void {
    this.createSvg();
    this.drawLine(this.dset, 1500);
    
  }

  private createSvg(): void {
    this.svg = d3.select("figure#line")
    .append("svg")
    .attr("width", this.w + (this.margin * 2))
    .attr("height", this.h + (this.margin * 2) )
    .append("g")
    .style("user-select","none").attr("transform",
    "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawLine(data: any[], likes: number): void {
    console.log(data[0]);
    console.log(Date.now());
    data = data.map((el)=>{ likes = likes + el.recommendations_up - el.recommendations_down; return {
      "date": new Date(el.date*1000),
      "likes": likes
    }; });
    // data = data.map(d => d.date.toString());
    const max_el = data.reduce((acc, e1) => acc = acc > e1.date ? acc : e1.date, new Date(0));
    const min_el = data.reduce((acc, e1) => acc = acc < e1.date ? acc : e1.date, new Date());
    
    console.log(data[0]);
    console.log(max_el);
    console.log(min_el);
    const x = d3.scaleTime()
      .range([0, this.w])
      .domain([min_el,max_el]);
    this.svg.append("g")
      .attr("transform", "translate(0," + (this.h-10) + ")")
      .call(d3.axisBottom(x).ticks(15,"%d/%m/%Y %H:%M")).selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
    const y = d3.scaleLinear()
      .domain([0, data.reduce((acc, e1) => acc = acc > e1.likes ? acc : e1.likes, 0)])
      .range([ this.h, 0 ]);
    this.svg.append("g")
      .call(d3.axisLeft(y));

    this.svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line<any>()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.likes); })
      );
    const focus = this.svg
      .append('g')
      .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0);
    const focusText = this.svg
      .append('g')
      .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");
    
    
    this.svg
      .append('rect')
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('width', this.w)
      .attr('height', this.h)
      // .on('mouseover', () => return)
      .on('mousemove', (e) => {
        // recover coordinate we need
        const x0 = x.invert(e.layerX-1.5*this.margin);
        
        const bisect = d3.bisector((d: any) =>  {if(d == undefined){ return 0;} return d.date;}).left;
        const i =  bisect(data, x0);
       
        const selectedData = data[i];
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
        focus.attr("cx", x(selectedData.date))
          .attr("cy", y(selectedData.likes));
        focusText.html("Likes: "+selectedData.likes).attr("x", x(selectedData.date)+15)
        .attr("y", y(selectedData.likes)-30);
      
      })
      .on('mouseout', () =>{
        focusText.style("opacity", 0);
        focus.style("opacity", 0);
      });
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
  ];
}
