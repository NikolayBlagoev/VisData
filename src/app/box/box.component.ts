import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {BoxData, ExampleData, ExampleLabels} from './boxData';
import { TooltipComponent } from "../tooltip/tooltip.component";

@Component({
    selector: 'app-box',
    templateUrl: './box.component.html',
    styleUrls: ['./box.component.sass']
  })

export class BoxComponent implements OnInit {

    private svg;

    // Set the dimensions and margins of the graph
    private margin = {top: 10, right: 30, bottom: 30, left: 40};
    private text_margin = {top: 0, right: 40, bottom: 0, left: 100};
    private width = 768 - this.margin.left - this.margin.right;
    private height = 768 - this.margin.top - this.margin.bottom;

    // X and Y scales
    private x_scale;
    private x_scale_domain = [20, 580]; // TODO: Not this because it's sample data; this is garbage
    private x_scale_range = [
        0 + this.text_margin.left + this.text_margin.right,
        this.width - this.text_margin.left - this.text_margin.right];
    private y_scale;

    ngOnInit(): void {
        this.createSvg();
        this.initScales();

        // TODO: Remove hardcoded values
        this.drawBoxes(ExampleData);
        this.drawPoint('ur', 278);
        this.drawPoint('my', 395);
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
        this.x_scale = d3.scaleLinear()
        .domain(this.x_scale_domain)
        .range(this.x_scale_range);
        this.y_scale = d3.scaleBand()
        .domain(ExampleLabels)
        .range([0, this.height])
        .paddingOuter(0.5);
    }

    private drawBoxes(data: Array<BoxData>): void {
        // Show the main horizontal line
        this.svg
        .selectAll("horizontalLines")
        .data(data)
        .enter()
        .append("line")
            .attr("x1", (d) => {return this.x_scale(d.min)})
            .attr("x2", (d) => {return this.x_scale(d.max);})
            .attr("y1", (d) => {return this.y_scale(d.label);})
            .attr("y2", (d) => {return this.y_scale(d.label);})
            .attr("stroke", "black")
            .style("width", 40);

        // Rectangle for the main box
        const boxHeight = 50;
        this.svg
        .selectAll("boxes")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", (d) => {return this.x_scale(d.lower_quartile);})
            .attr("y", (d) => {return this.y_scale(d.label)! - (boxHeight / 2);})
            .attr("height", boxHeight)
            .attr("width", (d) => {return this.x_scale(d.upper_quartile) - this.x_scale(d.lower_quartile);})
            .attr("stroke", "black")
            .style("fill", "#69b3a2");

        // Show the median
        this.svg
        .selectAll("medianLines")
        .data(data)
        .enter()
        .append("line")
            .attr("x1", (d) => {return this.x_scale(d.median);})
            .attr("x2", (d) => {return this.x_scale(d.median);})
            .attr("y1", (d) => {return this.y_scale(d.label)! - (boxHeight / 2);})
            .attr("y2", (d) => {return this.y_scale(d.label)! + (boxHeight / 2);})
            .attr("stroke", "black")
            .style("width", 80);

        // Left and right borders + text
        // TODO: Change hardcoded values for offsets
        const textVerticalOffset = 3;
        const leftTextOffset = 20;
        const rightTextOffset = 5;
        const borderWidth = 1;
        const selection = this.svg
        .selectAll("borderVisuals")
        .data(data)
        .enter()
        selection.append("rect") // Left border
            .attr("x", this.x_scale_range[0] + borderWidth)
            .attr("y", (d) => {return this.y_scale(d.label)! - (boxHeight / 2);})
            .attr("height", boxHeight)
            .attr("width", borderWidth)
            .attr("stroke", "black")
            .style("fill", "black");
        selection.append("rect") // Right border
            .attr("x", this.x_scale_range[1] - borderWidth)
            .attr("y", (d) => {return this.y_scale(d.label)! - (boxHeight / 2);})
            .attr("height", boxHeight)
            .attr("width", borderWidth)
            .attr("stroke", "black")
            .style("fill", "black");
        selection.append("text") // Min value
            .text((d) => {return d.min;})
            .attr("x", this.x_scale_range[0] - leftTextOffset)
            .attr("y", (d) => {return this.y_scale(d.label)! + textVerticalOffset;});
        selection.append("text") // Max value
            .text((d) => {return d.max;})
            .attr("x", this.x_scale_range[1] + rightTextOffset)
            .attr("y", (d) => {return this.y_scale(d.label)! + textVerticalOffset;});

        // Category labels
        this.svg
        .selectAll("categoryLabels")
        .data(data)
        .enter()
        .append("text")
            .text((d) => {return d.label;})
            .attr("x", this.x_scale_range[0] - this.text_margin.left)
            .attr("y", (d) => {return this.y_scale(d.label)! + textVerticalOffset})
    }

    private drawPoint(label: string, value: number): void {
        const tooltip = new TooltipComponent();

        this.svg
        .append("circle")
            .attr("cx", this.x_scale(value))
            .attr("cy", this.y_scale(label))
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
