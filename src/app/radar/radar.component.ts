import {AfterViewInit, Component, Input, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {IdService} from "../id.service";
import {TooltipComponent} from '../tooltip/tooltip.component';


@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class RadarComponent implements AfterViewInit {

  // private dset = [{"Likes": 3, "Likes_recent": 3,"Playtime": 2, "AVGPlaytime": 10, "Owners": 2},
  // {"Likes": 7, "Likes_recent": 7, "Playtime": 8, "AVGPlaytime": 6, "Owners": 10}];
  // private features = ["Likes", "Likes_recent","Playtime", "AVGPlaytime", "Owners"];

  instanceId!: string;
  @Input() data!: [[any, any], string[]];

  @Input() margin     = 80;
  @Input() width      = 1200;
  @Input() height     = 600;

  // Drawing parameters
  @Input() attrDotRadius              = 5;
  @Input() scaleStrokeWidth           = 2;
  @Input() scaleHighlightStrokeWidth  = 3;
  @Input() maxRadius                  = 100;
  @Input() centerHorizontalOffset     = 300;
  @Input() centerVerticalOffset       = 300;
  @Input() labelTextSize              = 15;
  readonly fillColors                  = ["#9C27B0", "#2196F3", "#009688", "FF9800"];
  readonly pointColors                 = ["#4A148C", "#0D47A1", "#004D40", "E65100"];

  private svg;

  constructor(private idService: IdService) {
    this.instanceId = idService.generateId();
  }

  ngAfterViewInit(): void {
    // Account for margin
    this.width = this.width - (this.margin * 2);
    this.height = this.height - (this.margin * 2);

    this.createSvg();
    this.drawRadar(this.data[0], this.data[1]);
  }

  private createSvg(): void {
    this.svg = d3.select("figure#" + this.instanceId)
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2) )
    .append("g")
    .style("user-select","none").attr("transform",
    "translate(" + this.margin*3/4 + "," + -10 + ")");
  }

  /**
   *
   * @param data Array of n elements, with each element having a field for each feature,
   * each having a value between 0 and 10
   * (e.g. data = [{"likes": 4, "dislikes": 2}, {"likes": 5, "dislikes": 6}])
   * @param features Array of the name of the features
   * (e.g. features = ["likes", "dislikes"])
   */
  private drawRadar(data: any[], features: any[]): void{
    const rscale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, this.maxRadius]);
    const angler = (angle, value, name, attr_value) => {
        const x = Math.cos(angle) * rscale(value);
        const y = Math.sin(angle) * rscale(value);
        return {"x": this.centerHorizontalOffset + x, "y": this.centerVerticalOffset - y,
                "name": name, "val": attr_value};
    };
    const shape_maker = (d) => {
        const coordinates: any = [];
        for (let i = 0; i <= features.length; i++){
          const iMod = i % features.length; // Allows for first point to be added again to circularly connect path for styling
          const angle = (Math.PI / 2) + (2 * Math.PI * iMod / features.length);
          coordinates.push(angler(angle,d[features[iMod]], features[iMod], d[features[iMod]]));
        }
        return coordinates;
      };
    const line = d3.line<any>()
                   .x(d => d.x)
                   .y(d => d.y);
    [1, 2.5, 5, 7.5, 10].forEach(t => {
        const coordinates: any = [];
        for (let i = 0; i < features.length; i++) {
          const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
          coordinates.push(angler(angle,t, features[i],0));
        }
        coordinates.push(coordinates[0]);
        this.svg.append("path")
          .datum(coordinates)
          .attr("d",line)
          .attr("stroke-width", (t % 5) == 0 ? this.scaleHighlightStrokeWidth : this.scaleStrokeWidth)
          .classed("poly-outlines", true);
      });


      for (let i = 0; i < features.length; i++) {
        const ft_name = features[i];
        const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        const line_coordinate = angler(angle, 10, features[i],0);
        const label_coordinate = angler(angle, 10.5, features[i],0);

        this.svg.append("line")
        .attr("x1", this.centerHorizontalOffset)
        .attr("y1", this.centerVerticalOffset)
        .attr("x2", line_coordinate.x)
        .attr("y2", line_coordinate.y)
        .classed("axes", true);

        this.svg.append("text")
        .attr("x", label_coordinate.x)
        .attr("y", label_coordinate.y)
        .attr("text-anchor", i > (features.length/2)? "left" : "end")
        .style("font-size", this.labelTextSize)
        .text(ft_name);
    }

    const tooltip = new TooltipComponent();

    data.forEach((d, i) => {
      const coordinates = shape_maker(d);
      const fillColor   = this.fillColors[i % this.fillColors.length];
      const pointColor  = this.pointColors[i % this.pointColors.length];

      this.svg.append("path")
        .datum(coordinates)
        .attr("d",line)
        .attr("fill", fillColor)
        .classed("interior-fill", true);
    });

    data.forEach((d,i) => {
      const coordinates = shape_maker(d);
      
      const pointColor  = this.pointColors[i % this.pointColors.length];
      this.svg.selectAll("dot")
        .data(coordinates).enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", this.attrDotRadius)
        .attr("fill", pointColor)
        .classed("data-point", true)
        .on("mouseover", (_,d) => {
          tooltip.setText(`${d.name}: ${d.val}`).setVisible();
        })
        .on("mouseout",  (_) =>{
          tooltip.setHidden();


        });
    })
  }

}
