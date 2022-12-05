import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {BoxData, ExampleData, ExampleLabels} from './boxData';
import { TooltipComponent } from "../tooltip/tooltip.component";
import { text } from 'd3';

@Component({
    selector: 'app-box',
    templateUrl: './box.component.html',
    styleUrls: ['./box.component.sass']
  })

export class BoxComponent implements OnInit {

    private svg;

    // Set the dimensions and margins of the graph
    private margin = {top: 10, right: 30, bottom: 30, left: 40};
    private text_margin = {top: 20, right: 0, bottom: 20, left: 0};
    private width = 460 - this.margin.left - this.margin.right;
    private height = 400 - this.margin.top - this.margin.bottom;

    // X and Y scales
    private x_scale;
    private y_scale;
    private y_scale_domain = [20, 580]; // TODO: Not this because it's sample data; this is garbage
    private y_scale_range = [
        this.height - this.text_margin.top - this.text_margin.bottom,
        0 + this.text_margin.top + this.text_margin.bottom];

    ngOnInit(): void {
        this.createSvg();
        this.initScales();

        // TODO: Remove hardcoded values
        this.drawBoxes(ExampleData);
        this.drawPoint('ur', 278);
    }

    private createSvg(): void {
        this.svg = d3.select("figure#box")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("transform", "translate(" + this.margin + "," + this.margin + ")").style("user-select","none");
    }

    private initScales(): void {
        this.x_scale = d3.scaleBand()
        .domain(ExampleLabels)
        .range([ 0, this.width ])
        .paddingOuter(.5);
        this.y_scale = d3.scaleLinear()
        .domain(this.y_scale_domain)
        .range(this.y_scale_range);
    }

    private drawBoxes(data: Array<BoxData>): void {
        // Show the main vertical line
        this.svg
        .selectAll("vertLines")
        .data(data)
        .enter()
        .append("line")
            .attr("x1", (d) => {return this.x_scale(d.label);})
            .attr("x2", (d) => {return this.x_scale(d.label);})
            .attr("y1", (d) => {return this.y_scale(d.min);})
            .attr("y2", (d) => {return this.y_scale(d.max);})
            .attr("stroke", "black")
            .style("width", 40);

        // Rectangle for the main box
        const boxWidth = 100;
        this.svg
        .selectAll("boxes")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", (d) => {return this.x_scale(d.label)! - (boxWidth / 2);})
            .attr("y", (d) => {return this.y_scale(d.upper_quartile);})
            .attr("height", (d) => {return this.y_scale(d.lower_quartile) - this.y_scale(d.upper_quartile);})
            .attr("width", boxWidth )
            .attr("stroke", "black")
            .style("fill", "#69b3a2");

        // Show the median
        this.svg
        .selectAll("medianLines")
        .data(data)
        .enter()
        .append("line")
            .attr("x1", (d) => {return this.x_scale(d.label)! - (boxWidth / 2);})
            .attr("x2", (d) => {return this.x_scale(d.label)! + (boxWidth / 2);})
            .attr("y1", (d) => {return this.y_scale(d.median);})
            .attr("y2", (d) => {return this.y_scale(d.median);})
            .attr("stroke", "black")
            .style("width", 80);

        // Top and bottom borders + text
        // TODO: Change hardcoded values for offsets
        const textOffset = 7;
        const topTextMargin = 3;
        const bottomTextMargin = 15;
        const borderHeight = 1;
        const selection = this.svg
        .selectAll("borderVisuals")
        .data(data)
        .enter()
        selection.append("rect") // Bottom border
            .attr("x", (d) => {return this.x_scale(d.label)! - (boxWidth / 2);})
            .attr("y", this.y_scale_range[0] - borderHeight)
            .attr("height", borderHeight)
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "black");
        selection.append("rect") // Top border
            .attr("x", (d) => {return this.x_scale(d.label)! - (boxWidth / 2);})
            .attr("y", this.y_scale_range[1])
            .attr("height", borderHeight)
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "black");
        selection.append("text") // Min value
            .text((d) => {return d.min;})
            .attr("x", (d) => {return this.x_scale(d.label)! - textOffset;})
            .attr("y", this.y_scale_range[0] + borderHeight + bottomTextMargin);
        selection.append("text") // Max value
            .text((d) => {return d.max;})
            .attr("x", (d) => {return this.x_scale(d.label)! - textOffset;})
            .attr("y", this.y_scale_range[1] - topTextMargin);
    }

    private drawPoint(label: string, value: number): void {
        const tooltip = new TooltipComponent();

        this.svg
        .append("circle")
            .attr("cx", this.x_scale(label))
            .attr("cy", this.y_scale(value))
            .attr("r", 10)
            .attr("fill", "#f568fcc8")
            .on("mouseover", () => {
                tooltip.setText(value.toString());
                tooltip.setVisible();
            })
            .on("mouseout", () => {
                tooltip.setHidden();
            });
    }
}  
