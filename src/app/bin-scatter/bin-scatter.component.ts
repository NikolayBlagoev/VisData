import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3HexBin from 'd3-hexbin';
import { TooltipComponent } from "../tooltip/tooltip.component";
import { Point } from './binScatterData';
import exampleData from "./example-data.json";

@Component({
    selector: 'app-bin-scatter',
    templateUrl: './bin-scatter.component.html',
    styleUrls: ['./bin-scatter.component.sass']
  })

export class BinScatterComponent implements OnInit {

    private hexBin;
    private svg;

    // Set the dimensions and margins of the graph
    private margin = {top: 50, right: 50, bottom: 50, left: 50};
    private width = 768 - this.margin.left - this.margin.right;
    private height = 768 - this.margin.top - this.margin.bottom;

    private xScale;
    private yScale;

    private radius = 15; // TODO: Add interactivity to change this

    ngOnInit(): void {
        this.createSvg();
        this.initScales(exampleData);

        this.drawBins(exampleData);
    }

    private createSvg(): void {
        this.svg = d3.select("figure#bin-scatter")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")").style("user-select","none");
    }

    private initScales(points: Array<Point>): void {
        // Define ranges
        this.xScale = d3.scaleLinear()
            .domain(d3.extent(points, (d) => d.x) as Array<number>)
            .range([0, this.width])
        this.yScale = d3.scaleLinear()
            .domain(d3.extent(points, (d) => d.y) as Array<number>)
            .range([this.height, 0])

        // Create visual scales
        this.svg
        .append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.xScale))
        this.svg
        .append("g")
        .call(d3.axisLeft(this.yScale))
    }

    private drawBins(points: Array<Point>): void {
        this.hexBin = d3HexBin.hexbin()
            .x((d) => this.xScale(d.x))
            .y((d) => this.yScale(d.y))
            .radius(this.radius * this.width / (this.height - 1))
            .extent([[this.margin.left, this.margin.top], [this.width - this.margin.right, this.height - this.margin.bottom]])

        // Literal vomit
        const bins = this.hexBin(points) as Array<Array<any>>
        const colourPalette = d3.scaleSequential(d3.interpolateBuPu)
        .domain([0, d3.max(bins, d => d.length) as number - 2])

        this.svg
        .selectAll("hexagons")
        .data(this.hexBin(points))
        .enter()
        .append("path")
            .attr("d", (d) => `M${d.x},${d.y}${this.hexBin.hexagon()}`)
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .attr("fill", (d) => colourPalette(d.length));;
    }
}
