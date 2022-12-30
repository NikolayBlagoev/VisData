import { Component, AfterViewInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { IdService } from '../id.service';
import { TooltipComponent } from "../tooltip/tooltip.component";
import { BarData } from './barData';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.sass']
})
export class BarComponent implements AfterViewInit {

  @Input() data: BarData[] = [
    { "Name": "Action", "Value": 23759 },
    { "Name": "Adventure", "Value": 21431 },
    { "Name": "RPG", "Value": 9534 },
    { "Name": "Strategy", "Value": 10895 },
    { "Name": "Simulation", "Value": 10836 },
    { "Name": "Casual", "Value": 22086 },
    { "Name": "Free to Play", "Value": 3393 },
    { "Name": "Massively Multiplayer", "Value": 1460 },
    { "Name": "Early Access", "Value": 6145 },
    { "Name": "Education", "Value": 317 },
    { "Name": "Racing", "Value": 2155 },
    { "Name": "Sports", "Value": 2666 },
    { "Name": "Animation & Modeling", "Value": 322 },
    { "Name": "Utilities", "Value": 682 },
    { "Name": "Audio Production", "Value": 195 },
    { "Name": "Video Production", "Value": 247 },
    { "Name": "Game Development", "Value": 159 },
    { "Name": "Design & Illustration", "Value": 406 },
    { "Name": "Software Training", "Value": 164 },
    { "Name": "Web Publishing", "Value": 89 },
    { "Name": "Photo Editing", "Value": 105 },
    { "Name": "", "Value": 160 },
    { "Name": "AcValueing", "Value": 16 },
    { "Name": "Violent", "Value": 168 },
    { "Name": "Gore", "Value": 99 },
    { "Name": "Nudity", "Value": 45 },
    { "Name": "Sexual Content", "Value": 54 },
    { "Name": "Movie", "Value": 1 }
  ];
  @Input() bar_margin = 0;
  @Input() instanceId!: string;
  @Input() to_sort = false;
  constructor(private idService: IdService) {
    this.instanceId = idService.generateId();
  }
  private svg;
  @Input() highlighted = ["Indie", "Strategy"];
  // Drawing parameters
  @Input() horizontalMargin     = 40;
  @Input() verticalMargin       = 60;
  @Input() width                = 600;
  @Input() height               = 400;
  @Input() max_val              = -1;
  readonly barColor             = "#2196F3";
  readonly gameBarColor         = "#9C27B0";
  readonly highlightedBarColor  = "#FF9800";
  readonly strokeColor          = "#303030";
  readonly strokeWidth          = 2;


  public make_with_data(data: BarData[], highlighted: string[]) {
    this.createSvg();
    this.drawBars(data, highlighted);
  }

  ngAfterViewInit(): void {
    this.width = this.width - (this.horizontalMargin * 2);
    this.height = this.height - (this.verticalMargin * 2);
    this.createSvg();
    this.drawBars(this.data, this.highlighted);
  }

  private createSvg(): void {
    this.svg = d3.select("figure#" + this.instanceId)
      .append("svg")
      .attr("width", this.width + (this.horizontalMargin * 2))
      .attr("height", this.height + (this.verticalMargin * 2))
      .append("g")
      .attr("transform", `translate(${this.horizontalMargin}, 30)`).style("user-select", "none");
  }

  private drawBars(data: BarData[], highlighted: string[]): void {
    if(this.to_sort){
      data.sort((e1, e2) => e2.Value - e1.Value);
    }
    const max_el = this.max_val == -1 ? data.reduce((acc, e1) => acc = acc > e1.Value ? acc : e1.Value, -1000) : this.max_val;
    data = data.filter((el) => el.Value > max_el / 100);

    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.Name))
      .padding(0.1);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + (this.height) + ")")
      .call(d3.axisBottom(x).ticks(data.length))
      .selectAll("text")
      .attr("transform", "translate(-10,0) rotate(-45)")
      .style("text-anchor", "end")
      .attr("font-weight", d => {
        if (highlighted.includes(d)) { return "bold"; }
        else { return "normal"; }
      });

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, max_el])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    const tooltip = new TooltipComponent();

    // Remedy Javascript's scoping dumbassery
    const barColor            = this.barColor;
    const gameBarColor        = this.gameBarColor;
    const highlightedBarColor = this.highlightedBarColor;

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Name))
      .attr("y", d => y(d.Value))
      .attr("transform", "translate("  + this.bar_margin/2+",0)")
      .attr("width", x.bandwidth() - this.bar_margin)
      .attr("height", d => this.height - y(d.Value) - this.strokeWidth)
      .attr("stroke", this.strokeColor)
      .attr("stroke-width", this.strokeWidth)
      .attr("fill", function (d) {
        if (highlighted.includes(d.Name)) { return gameBarColor; }
        else { return barColor; }
      })
      .on("mouseover", (e, d) => {
        tooltip.setText(`Value: ${d.Value}`)
               .setVisible();
        d3.select(e.target).attr("fill", highlightedBarColor);
      })
      .on("mouseout", (e, d) => {
        tooltip.setHidden();
        if (highlighted.includes(d.Name)) { d3.select(e.target).attr("fill", gameBarColor); }
        else { d3.select(e.target).attr("fill", barColor); }
      });
  }
}
