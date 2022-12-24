import {AfterViewInit, Component, Input} from '@angular/core';
import * as d3 from 'd3';
import {IdService} from "../id.service";
import {TooltipComponent} from '../tooltip/tooltip.component';


@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.sass']
})
export class RadarComponent implements AfterViewInit {
  // private dset = [{"Likes": 3, "Likes_recent": 3,"Playtime": 2, "AVGPlaytime": 10, "Owners": 2},
  // {"Likes": 7, "Likes_recent": 7, "Playtime": 8, "AVGPlaytime": 6, "Owners": 10}];
  // private features = ["Likes", "Likes_recent","Playtime", "AVGPlaytime", "Owners"];

  @Input() instanceId!: string;

  @Input() data!: [[any, any], string[]];

  private svg;
  private margin = 80;
  private w = 1200 - (this.margin * 2);
  private h = 600 - (this.margin * 2);

  constructor(private idService: IdService) {
    this.instanceId = idService.generateId();
  }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawRadar(this.data[0], this.data[1]);
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

  // features contains an array of the name of the features
  // data is n array of elements, with each element having a field for each feature, each having a value between 0 and 10
  // e.g. features = ["likes", "dislikes"]
  // data = [{"likes": 4, "dislikes": 2}, {"likes": 5, "dislikes": 6}]
  // private drawRadar(data: [Map<string, number>, Map<string, number>]) {
  private drawRadar(data: [any, any], features: string[]): void{

    // const features: string[] = Array.from(data[0].keys());

    const rscale = d3.scaleLinear()
                  .domain([0,10])
                  .range([0,200]);

    const angler = (angle, value, name, attr_value) =>{
                    const x = Math.cos(angle) * rscale(value);
                    const y = Math.sin(angle) * rscale(value);
                    return {"x": 300 + x, "y": 300 - y, "name": name, "val": attr_value};
    };

    const shape_maker = (d: Map<string, number>) => {
      const coordinates: any = [];
      for(let i = 0; i < features.length; i++){
        const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angler(angle,d[features[i]], features[i], d[features[i]]));
      }
      return coordinates;
    };

    const line = d3.line<any>()
                   .x(d => d.x)
                   .y(d => d.y);

    [1, 2.5, 5, 7.5, 10].forEach(t =>{
                                  const coordinates: any = [];
                                  for(let i = 0; i < features.length; i++){
                                    const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
                                    coordinates.push(angler(angle,t, features[i],0));
                                  }
                                  coordinates.push(coordinates[0]);
                                    this.svg.append("path")
                                    .datum(coordinates)
                                    .attr("d",line)
                                    .attr("stroke-width",  t%5==0? "3px":"1px")
                                    .attr("stroke", "black")
                                    .attr("fill", "none")
                                    .attr("stroke-opacity", 1);

                                    // this.svg.append("circle")
                                    // .attr("cx", 300)
                                    // .attr("cy", 300)
                                    // .attr("fill", "none")
                                    // .attr("stroke", "gray")
                                    // .attr("r", rscale(t))
                                    // .attr("stroke", "black")
                                    // .style("stroke-width", t%5==0? "3px":"1px");

                                  });



      for (let i = 0; i < features.length; i++) {
        const ft_name = features[i];
        const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        const line_coordinate = angler(angle, 10, features[i],0);
        const label_coordinate = angler(angle, 10.5, features[i],0);


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

    // a]

    const tooltip = new TooltipComponent();

    data.forEach((d) => {

      const color = "green";
      const coordinates = shape_maker(d);

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
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 3)
        .style("fill", "green")
        .on("mouseover", (_,d) => {

          tooltip.setText(`${d.name}: ${d.val}`).setVisible();
        })
        .on("mouseout",  (_) =>{
          tooltip.setHidden();

        });
    });




  }

}
