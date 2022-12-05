import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {TooltipComponent} from "../tooltip/tooltip.component";

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.sass']
})
export class BarComponent implements OnInit {

  private data = [
   {"Genre" :  "Action" , "Count" : 23759},
   {"Genre" : "Adventure", "Count" : 21431},
   {"Genre" : "Indie", "Count" : 39681},
   {"Genre" : "RPG", "Count" : 9534},
   {"Genre" : "Strategy", "Count" : 10895},
   {"Genre" : "Simulation", "Count" : 10836},
   {"Genre" : "Casual", "Count" : 22086},
   {"Genre" : "Free to Play", "Count" : 3393},
   {"Genre" : "Massively Multiplayer", "Count" : 1460},
   {"Genre" : "Early Access", "Count" : 6145},
   {"Genre" : "Education", "Count" : 317},
   {"Genre" : "Racing", "Count" : 2155},
   {"Genre" : "Sports", "Count" : 2666},
   {"Genre" : "Animation & Modeling", "Count" : 322},
   {"Genre" : "Utilities", "Count" : 682},
   {"Genre" : "Audio Production", "Count" : 195},
   {"Genre" : "Video Production", "Count" : 247},
   {"Genre" : "Game Development", "Count" : 159},
   {"Genre" : "Design & Illustration", "Count" : 406},
   {"Genre" : "Software Training", "Count" : 164},
   {"Genre" : "Web Publishing", "Count" : 89},
   {"Genre" : "Photo Editing", "Count" : 105},
   {"Genre" : "", "Count" : 160},
   {"Genre" : "Accounting", "Count" : 16},
   {"Genre" : "Violent", "Count" : 168},
   {"Genre" : "Gore", "Count" : 99},
   {"Genre" : "Nudity", "Count" : 45},
   {"Genre" : "Sexual Content", "Count" : 54},
   {"Genre" : "Movie", "Count" : 1}
  ];
  private svg;
  private margin = 80;
  private width = 1200 - (this.margin * 2);
  private height = 600 - (this.margin * 4);

  ngOnInit(): void {
    this.createSvg();
    this.drawBars(this.data, ["Indie", "Strategy"]);
  }

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 4))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")").style("user-select","none");
}
  private drawBars(data: any[], genres: any[]): void {
    data.sort((e1, e2) => e2.Count - e1.Count);
    const max_el = data.reduce((acc, e1) => acc = acc > e1.Count ? acc : e1.Count, -1000);
    // Create the X-axis band scale
    const x = d3.scaleBand()
    .range([0, this.width])
    .domain(data.map(d => d.Genre))
    .padding(0.1);

    // Draw the X-axis on the DOM
    this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(x).ticks(10))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end").attr("font-weight", d =>{

      if(genres.includes(d)){
        return "bold";
      }else{
        return "normal";
      }
    });


    // Create the Y-axis band scale
    const y = d3.scaleLinear()
    .domain([0, max_el])
    .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
    .call(d3.axisLeft(y));

    const tooltip = new TooltipComponent();

    // Create and fill the bars
    this.svg.selectAll("bars")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.Genre))
    .attr("y", d => y(d.Count))
    .attr("width", x.bandwidth())
    .attr("height", d => this.height - y(d.Count))
    .attr("fill", function (d){
      if(genres.includes(d.Genre)){
        return "#001f80";
      }else{
        return "#859ec7";
      }
    }).on("mouseover", (e,d) =>{
        tooltip
          .setText(`Count: ${d.Count}`)
          .setVisible();

        // console.log(d);
        d3.select(e.target).attr("fill", "red");
      })
    .on("mouseout",  (e,d) =>{
      tooltip.setHidden();

      if(genres.includes(d.Genre)){
        d3.select(e.target).attr("fill", "#001f80");
      }else{
        d3.select(e.target).attr("fill", "#859ec7");

      }

    });

  }
}
