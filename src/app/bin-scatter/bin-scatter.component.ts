import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3HexBin from 'd3-hexbin';
import { TooltipComponent } from '../tooltip/tooltip.component';
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
    private margin = {top: 50, right: 300, bottom: 100, left: 50};
    private width = 1024 - this.margin.left - this.margin.right;
    private height = 768 - this.margin.top - this.margin.bottom;

    // Scale objects for access by several methods
    private xScale;
    private yScale;
    private densityScale;

    // Parameters for the colour-to-density scale
    private colourPalette = d3.interpolateInferno;
    private colourScaleWidth = 75;
    private colourScaleHeight = 400;
    private colourScaleHorizontalOffset = 150;
    private colourScaleVerticalOffset = 50;
    private colourScaleSlices = 100; // Must cleanly divide colourScaleHeight
    
    // Parameter(s) for hexagon bin drawing
    private radius = 15; // TODO: Add interactivity to change this

    ngOnInit(): void {
        this.createSvg();
        this.initScales(exampleData);
        this.drawBins(exampleData);
        this.drawColourScale();
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
            .domain([0, d3.max(points, (d) => d.x) as number])
            .range([0, this.width]);
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(points, (d) => d.y) as number])
            .range([this.height, 0]);

        // Draw axes
        this.svg
        .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale));
        this.svg
        .append("g")
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale));
    }

    private drawBins(points: Array<Point>): void {
        this.hexBin = d3HexBin.hexbin()
            .x((d) => this.xScale(d.x))
            .y((d) => this.yScale(d.y))
            .radius(this.radius * (this.width / this.height));

        // Literal vomit
        const bins = this.hexBin(points) as Array<Array<any>>;
        this.densityScale = d3.scaleSequential()
        .domain([0, d3.max(bins, d => d.length) as number])
        .interpolator(this.colourPalette);

        const tooltip = new TooltipComponent();

        this.svg
        .selectAll("hexagons")
        .data(bins)
        .enter()
        .append("path")
            .attr("d", (d) => `M${d.x},${d.y}${this.hexBin.hexagon()}`)
            .attr("transform", `translate(${this.margin.left + this.hexBin.radius()}, ${this.margin.top - this.hexBin.radius()})`) // God in heaven, please forgive me
            .attr("fill", (d) => this.densityScale(d.length))
            .on("mouseover", (event, d) => {
                d3.select(event.target).attr("fill", "#22bb33");

                tooltip.setText(d.length);
                tooltip.setVisible();
            })
            .on("mouseout", (event, d) => {
                d3.select(event.target).attr("fill", this.densityScale(d.length));

                tooltip.setHidden();
            });
    }

    private drawColourScale(): void {
        // Create scales from dimensions to density and vice versa
        const coordToDensity = d3.scaleLinear()
            .domain([this.colourScaleHeight, 0])    
            .range(this.densityScale.domain());
        const densityToCoord = d3.scaleLinear()
            .domain(this.densityScale.domain())
            .range([this.colourScaleHeight, 0]);    

        // Compute height of scale slices and generate range of values for drawing
        const sliceHeight = this.colourScaleHeight / this.colourScaleSlices;
        const valRange = d3.range(0, this.colourScaleHeight, sliceHeight);

        // Create border rectangle around scale
        this.svg
        .append("rect")
        .attr("x", this.margin.left + this.width + this.colourScaleHorizontalOffset)
            .attr("y", this.colourScaleVerticalOffset)
            .attr("height", this.colourScaleHeight)
            .attr("width", this.colourScaleWidth)
            .style("fill-opacity", 0)
            .style("stroke", "#000000")
            .style("stroke-width", 2);
        
        // Create rectangles representing visual scale       
        this.svg
        .selectAll("colourRectangles")
        .data(valRange)
        .enter()
        .append("rect")
            .attr("x", this.margin.left + this.width + this.colourScaleHorizontalOffset)
            .attr("y", this.colourScaleVerticalOffset)
            .attr("height", sliceHeight)
            .attr("width", this.colourScaleWidth)
            .attr("transform", (d, i) => {
                const offset = i * sliceHeight;
                return `translate(0, ${offset})`;
            })
            .style("fill", (d) => {
                const density = coordToDensity(d);
                return this.densityScale(density);
            });

        // Create numeric axis showing numbers corresponding to each colour
        this.svg
        .append("g")
        .attr("transform", `translate(${this.margin.left + this.width + this.colourScaleHorizontalOffset + this.colourScaleWidth},\
                               ${this.colourScaleVerticalOffset})`)
        .call(d3.axisRight(densityToCoord));
    }
}
