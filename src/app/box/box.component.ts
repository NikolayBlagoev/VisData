import {AfterViewInit, Component, Input, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {IdService} from "../id.service";
import {TooltipComponent} from "../tooltip/tooltip.component";
import {BoxData} from './boxData';

@Component({
    selector: 'app-box',
    templateUrl: './box.component.html',
    styleUrls: ['./box.component.sass'],
    encapsulation: ViewEncapsulation.None
  })

export class BoxComponent implements AfterViewInit {

    instanceId!: string;

    @Input() data!: [BoxData[], Map<string, number>]; //= [ExampleData, new Map<string, number>()];
    @Input() width                      = 768;
    @Input() height                     = 768;

    // Drawing parameters
    @Input() boxHeight          = 50;
    @Input() labelTextSize      = 20;
    @Input() scaleTextSize      = 12;
    @Input() textVerticalOffset = 5;
    @Input() leftTextOffset     = 25;
    @Input() rightTextOffset    = 10;
    @Input() borderWidth        = 1;

    private svg;

    // Set the dimensions and margins of the graph
    @Input() margin          = {top: 25, right: 0, bottom: 25, left: 0};
    @Input() text_margin     = {top: 0, right: 0, bottom: 0, left: 90};
    private marginedWidth!: number;
    private marginedHeight!: number;


    // X and Y scales
    private x_scale_domains!: Array<[number, number]>;
    private x_scale_range!: [number, number];
    private x_scales;
    private y_scale;

    constructor(private idService: IdService) {
      this.instanceId = idService.generateId();
    }

    ngAfterViewInit(): void {
        this.createSvg();
        this.initScales();

        this.drawBoxes(this.data[0]);
        this.drawPoints(this.data[1]);
    }

    private createSvg(): void {
        // Compute margined dimensions from DOM input
        this.marginedWidth   = this.width - this.margin.left - this.margin.right;
        this.marginedHeight  = this.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select("figure#" + this.instanceId)
        .append("svg")
        .attr("width", this.marginedWidth)
        .attr("height", this.marginedHeight)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")").style("user-select","none");
    }

    private initScales(): void {
        // Compute X axis domain and range from DOM input
        this.x_scale_domains    = d3.map(this.data[0], datum => [datum.min, datum.max]);
        this.x_scale_range      = [0 + this.text_margin.left + this.text_margin.right,
                                   this.marginedWidth - this.text_margin.left - this.text_margin.right];

        this.x_scales = d3.map(this.x_scale_domains, domain => {
            return d3.scaleLinear()
                     .domain(domain)
                     .range(this.x_scale_range);});
        this.y_scale = d3.scaleBand()
        .domain(this.data[1].keys())
        .range([0, this.marginedHeight])
        .paddingOuter(0.5);
    }

    private drawBoxes(data: BoxData[]): void {
      // Show the main horizontal line
      this.svg
        .selectAll("horizontalLines")
        .data(data)
        .enter()
        .append("line")
            .attr("x1", (d, idx) => {return this.x_scales[idx](d.min);})
            .attr("x2", (d, idx) => {return this.x_scales[idx](d.max);})
            .attr("y1", (d) => {return this.y_scale(d.label);})
            .attr("y2", (d) => {return this.y_scale(d.label);})
            .classed("main-line", true);

      // Rectangle for the main box
      this.svg
        .selectAll("boxes")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", (d, idx) => {return this.x_scales[idx](d.lower_quartile);})
            .attr("y", (d) => {return this.y_scale(d.label)! - (this.boxHeight / 2);})
            .attr("height", this.boxHeight)
            .attr("width", (d, idx) => {return this.x_scales[idx](d.upper_quartile) - this.x_scales[idx](d.lower_quartile);})
            .classed("box", true);

      // Show the median
      this.svg
      .selectAll("medianLines")
      .data(data)
        .enter()
        .append("line")
            .attr("x1", (d, idx) => {return this.x_scales[idx](d.median);})
            .attr("x2", (d, idx) => {return this.x_scales[idx](d.median);})
            .attr("y1", (d) => {return this.y_scale(d.label)! - (this.boxHeight / 2);})
            .attr("y2", (d) => {return this.y_scale(d.label)! + (this.boxHeight / 2);})
            .classed("median-line", true);

        // Left and right borders + text
      const selection = this.svg
        .selectAll("borderVisuals")
        .data(data)
        .enter();

        selection.append("rect") // Left border
            .attr("x", this.x_scale_range[0] + this.borderWidth)
            .attr("y", (d) => {return this.y_scale(d.label)! - (this.boxHeight / 2);})
            .attr("height", this.boxHeight)
            .attr("width", this.borderWidth)
            .classed("border", true);

        selection.append("rect") // Right border
            .attr("x", this.x_scale_range[1] - this.borderWidth)
            .attr("y", (d) => {return this.y_scale(d.label)! - (this.boxHeight / 2);})
            .attr("height", this.boxHeight)
            .attr("width", this.borderWidth)
            .classed("border", true);
        selection.append("text") // Min value
            .text((d) => {return d.min;})
            .attr("x", this.x_scale_range[0] - this.leftTextOffset)
            .attr("y", (d) => {return this.y_scale(d.label)! + this.textVerticalOffset;})
            .style("font-size", this.scaleTextSize);
        selection.append("text") // Max value
            .text((d) => {return d.max;})
            .attr("x", this.x_scale_range[1] + this.rightTextOffset)
            .attr("y", (d) => {return this.y_scale(d.label)! + this.textVerticalOffset;})
            .style("font-size", this.scaleTextSize);

      // Category labels
      this.svg
        .selectAll("categoryLabels")
        .data(data)
        .enter()
        .append("text")
            .text((d) => {return d.label;})
            .attr("x", this.x_scale_range[0] - this.text_margin.left)
            .attr("y", (d) => {return this.y_scale(d.label)! + this.textVerticalOffset;})
            .style("font-size", this.labelTextSize);
    }

    private drawPoints(data: Map<string, number>): void {
      data.forEach((value, label) => {

        const scaleIdx = this.data[0].findIndex(element => element.label == label);
        const tooltip = new TooltipComponent();

        this.svg
        .append("circle")
            .attr("cx", this.x_scales[scaleIdx](value))
            .attr("cy", this.y_scale(label))
            .attr("r", 10)
            .classed("highlight-circle", true)
            .on("mouseover", () => {
                tooltip.setText(value.toString());
                tooltip.setVisible();
            })
            .on("mouseout", () => {
                tooltip.setHidden();
            });
      });
    }
}
