import { Component, AfterViewInit, Input } from '@angular/core';
import * as d3 from 'd3';
import * as d3HexBin from 'd3-hexbin';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { Point, availableNumerics, numericsFiles } from './binScatterData';
import exampleData from "./example-data.json";

@Component({
    selector: 'app-bin-scatter',
    templateUrl: './bin-scatter.component.html',
    styleUrls: ['./bin-scatter.component.sass']
  })

export class BinScatterComponent implements AfterViewInit {
    @Input() instanceId!: string;
    @Input() totalWidth     = 1300;
    @Input() totalHeight    = 450;
    @Input() currentAppId   = 10;
    @Input() binRadius      = 3; // Controls radius of each hexagon, i.e. bin granularity

    // Axis data selection
    availableNumerics: Array<string> = availableNumerics;
    currentXAxis = "Median Playtime - Forever";
    currentYAxis  = "Like Percentage";

    private plotData: Array<Point> = exampleData;
    private gameData?: Point;
    private hexBin;
    private svg;

    // Set the dimensions and margins of the graph
    private margin = {top: 50, right: 350, bottom: 100, left: 50};
    private width = this.totalWidth - this.margin.left - this.margin.right;
    private height = this.totalHeight - this.margin.top - this.margin.bottom;

    // Scale objects for access by several methods
    private xScale;
    private yScale;
    private densityScale;

    // Parameters for the colour-to-density scale
    private colourPalette = d3.interpolateReds;
    private colourScaleWidth = 75;
    private colourScaleHeight = 300;
    private colourScaleHorizontalOffset = 125;
    private colourScaleVerticalOffset = 50;
    private colourScaleSlices = 100; // Must cleanly divide colourScaleHeight
        

    ngAfterViewInit(): void {
        this.createSvg();
        this.constructGraph();
    }

    onXChange(newXLabel: string) {
        this.currentXAxis = newXLabel;
        this.constructGraph();
    }

    onYChange(newYLabel: string) {
        this.currentYAxis = newYLabel;
        this.constructGraph();
    }

    private async constructGraph(): Promise<void> {
        // Construct file paths
        const xPath = `assets/numerics/${this.labelToFileName(this.currentXAxis)}`;
        const yPath = `assets/numerics/${this.labelToFileName(this.currentYAxis)}`;

        // Load, process and assign data
        const xRes                          = await fetch(xPath);
        const xValue                        = await xRes.text();
        const xData: Record<string, number> = JSON.parse(xValue);
        const yRes                          = await fetch(yPath);
        const yValue                        = await yRes.text();
        const yData: Record<string, number> = JSON.parse(yValue);
        this.plotData = this.zipToPoints(xData, yData);

        this.gameData = this.currentAppId in xData && this.currentAppId in yData    ?
                        {x: xData[this.currentAppId], y: yData[this.currentAppId]}  :
                        undefined;

        this.svg.selectAll("*").remove();
        this.drawVisuals();
    }

    private labelToFileName(label: string) : string { return numericsFiles[availableNumerics.indexOf(label)]; }

    private zipToPoints(xData: Record<string, number>, yData: Record<string, number>): Array<Point> {
        // Find shortest of the two to add games having both attributes ONLY
        const xSize     = Object.keys(xData).length;
        const ySize     = Object.keys(yData).length;
        const shortest  = xSize <= ySize ? xData : yData;

        const points: Array<Point> = [];
        for (const appId of Object.keys(shortest)) { points.push({x: xData[appId], y: yData[appId]}); }
        return points;
    }

    private createSvg(): void {
        this.svg = d3.select("figure#" + this.instanceId)
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")").style("user-select","none");
    }

    private drawVisuals(): void {
        this.initScales();
        this.drawBins();
        this.drawColourScale();
    }

    private initScales(): void {
        // Define ranges
        this.xScale = d3.scaleLinear()
            .domain([0, d3.max(this.plotData, (d) => d.x) as number])
            .range([0, this.width]);
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.plotData, (d) => d.y) as number])
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

    private drawBins(): void {
        this.hexBin = d3HexBin.hexbin()
            .x((d) => this.xScale(d.x))
            .y((d) => this.yScale(d.y))
            .radius(this.binRadius * (this.width / this.height));

        // Literal vomit
        const bins = this.hexBin(this.plotData) as Array<Array<any>>;
        this.densityScale = d3.scaleSequential()
        .domain([0, d3.max(bins, d => d.length) as number])
        .interpolator(this.colourPalette);

        const tooltip = new TooltipComponent();
        const gameDatumHexagonIdx = this.findChosenGameIdx();

        this.svg
        .selectAll("hexagons")
        .data(bins)
        .enter()
        .append("path")
            // Draw hexagons
            .attr("d", (d) => `M${d.x},${d.y}${this.hexBin.hexagon()}`)
            .attr("transform", `translate(${this.margin.left + this.hexBin.radius()}, ${this.margin.top - this.hexBin.radius()})`) // God in heaven, please forgive me
            .attr("fill", (d) => this.densityScale(d.length))
            // Highlight current game bin
            .attr("stroke", (d, i) => i == gameDatumHexagonIdx ? "#33aa22" : "")
            .attr("stroke-width", (d, i) => i == gameDatumHexagonIdx ? "2" : "")
            // Tooltip registration
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

    /**
     * Compute the index of the hexagon bin containing the currently selected game's data
     * 
     * @returns Index of the bin contained in the return value of the call to `hexBin`,
     * -1 if the game does not have a value in either of the two selected categories
     * (i.e. `this.gameData === undefined`)
     */
    private findChosenGameIdx(): number {
        if (this.gameData === undefined) { return -1; }
        const gamePoint: Point = {x: this.xScale(this.gameData.x), y: this.yScale(this.gameData.y)};

        // Uses Manhattan distance
        let closestHexagonIdx = 0;
        let closestDist = 1e10;
        for (const [idx, center] of this.hexBin.centers().entries()) {
            const currentDist = Math.abs(center.x - gamePoint.x) + Math.abs(center.y - gamePoint.y);
            if (currentDist < closestDist) {
                closestDist = currentDist;
                closestHexagonIdx = idx;
            }
        }
        return closestHexagonIdx;
    }
}
