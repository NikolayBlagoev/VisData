import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.sass']
})
export class RadarComponent implements OnInit {
  private data = [{"Likes": 3, "Likes_recent": 3,"Playtime": 2, "AVGPlaytime": 10, "Owners": 2},
  {"Likes": 7, "Likes_recent": 7, "Playtime": 8, "AVGPlaytime": 6, "Owners": 10}];
  private features = ["Likes", "Likes_recent","Playtime", "AVGPlaytime", "Owners"];
  private svg;
  private margin = 80;
  private w = 1200 - (this.margin * 2);
  private h = 600 - (this.margin * 2);

  ngOnInit(): void {
    this.createSvg();
    this.drawRadar(this.data, this.features);
  }

  private createSvg(): void {
    
    this.svg = d3.select("figure#radar")
    .append("svg")
    .attr("width", this.w + (this.margin * 2))
    .attr("height", this.h + (this.margin * 2) )
    .append("g")
    .style("user-select","none").attr("transform",
    "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawRadar(data: any[], features: any[]): void{
    const rscale = d3.scaleLinear()
                  .domain([0,10])
                  .range([0,200]);

    [1,2.5, 5, 7.5, 10].forEach(t => this.svg.append("circle")
                                  .attr("cx", 300)
                                  .attr("cy", 300)
                                  .attr("fill", "none")
                                  .attr("stroke", "gray")
                                  .attr("r", rscale(t))
                                  .attr("stroke", "black")
                                  .style("stroke-width", t%5==0? "3px":"1px"))
    
     const angler = (angle, value) =>{
                        let x = Math.cos(angle) * rscale(value);
                        let y = Math.sin(angle) * rscale(value);
                        return {"x": 300 + x, "y": 300 - y};
                      }
      
      for (var i = 0; i < features.length; i++) {
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let line_coordinate = angler(angle, 10);
        let label_coordinate = angler(angle, 10.5);
    
        
        this.svg.append("line")
        .attr("x1", 300)
        .attr("y1", 300)
        .attr("x2", line_coordinate.x)
        .attr("y2", line_coordinate.y)
        .attr("stroke","black");
        
        this.svg.append("text")
        .attr("x", label_coordinate.x)
        .attr("y", label_coordinate.y)
        .attr("text-anchor", i > (features.length/2)? "left" : "end")
        .text(ft_name);
    }
    const line = d3.line<any>()
                   .x(d => d.x)
                   .y(d => d.y);
    // a]

    const shape_maker = (d) => {
      const coordinates: any = [];
      for(var i = 0; i < features.length; i++){
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angler(angle,d[features[i]]));
      }
      return coordinates;
    }

    data.forEach(d=>{
      
      let color = "green";
      let coordinates = shape_maker(d);
  
      this.svg.append("path")
        .datum(coordinates)
        .attr("d",line)
        .attr("stroke-width", 3)
        .attr("stroke", color)
        .attr("fill", color)
        .attr("opacity", 0.5)
        .attr("stroke-opacity", 1);

      this.svg.selectAll("dot")
        .data(coordinates).enter()
        .append("circle")
        .attr("cx", function (d) { return d.x } )
        .attr("cy", function (d) { return d.y } )
        .attr("r", 3)
        .style("fill", "green");
    });
  

      
                                                              
  }

}
