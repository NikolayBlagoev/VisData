import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as d3HexBin from 'd3-hexbin';
import { IdService } from '../id.service';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { Point, availableNumerics, numericsFiles } from './binScatterData';
import exampleData from "./example-data.json";
import { clamp } from "./utils";

@Component({
    selector: 'app-bin-scatter',
    templateUrl: './bin-scatter.component.html',
    styleUrls: ['./bin-scatter.component.sass'],
    encapsulation: ViewEncapsulation.None
  })

export class BinScatterComponent implements AfterViewInit {
    currentAppId = 10;
    instanceId!: string;
    constructor (private idService: IdService) { this.instanceId = idService.generateId(); }

    // Drawing parameters
    @Input() binRadius          = 14; // Controls radius of each hexagon, i.e. bin granularity

    // Axis data selection
    availableNumerics: Array<string> = availableNumerics;
    currentXAxis = "Median Playtime - Forever";
    currentYAxis  = "Like Percentage";

    // Operational parameters
    readonly gameDatumHexagonId     = "gameHexBin";
    private plotData: Array<Point>  = exampleData;
    private gameData?: Point;
    private hexBin;
    private svg;

    // Set the dimensions and margins of the graph
    @Input() totalWidth     = 1200;
    @Input() totalHeight    = 400;
    @Input() margin  = {top: 20, right: 300, bottom: 50, left: 20};
    private width!: number;
    private height!: number;

    // Scale objects for access by several methods
    private xScale;
    private yScale;
    private densityScale;

    // Parameters for the colour-to-density scale
    private colorPreTransform;
    readonly colourPalette = d3.interpolatePuBu;
    readonly colourScaleWidth = 75;
    readonly colourScaleHeight = 350;
    readonly colourScaleHorizontalOffset = 100;
    readonly colourScaleVerticalOffset = 0;
    readonly colourScaleSlices = 350; // Must cleanly divide colourScaleHeight
        

    ngAfterViewInit(): void {
        this.width   = this.totalWidth - this.margin.left - this.margin.right;
        this.height  = this.totalHeight - this.margin.top - this.margin.bottom;
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

    onSelectedGameChange(newAppId: number) {
        this.currentAppId = newAppId;
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
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`).style("user-select","none");
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

    private binX(val: number): number {
        return clamp(this.xScale(val),
                     this.margin.left + (2 * this.binRadius),
                     this.width + this.margin.left - this.binRadius);
    }

    private binY(val: number): number {
        return clamp(this.yScale(val),
                     this.margin.top + this.binRadius,
                     this.height + this.margin.top - this.binRadius);
    }

    private drawBins(): void {
        // Account for radius of bins
        this.hexBin = d3HexBin.hexbin()
            .x((d) => this.binX(d.x))
            .y((d) => this.binY(d.y))
            .radius(this.binRadius);

        // Literal vomit
        const bins = this.hexBin(this.plotData) as Array<Array<number>>;
        this.colorPreTransform = d3.scaleLog()
            .base(2)
            .domain([1, d3.max(bins, (d) => d.length)!])
            .range([0, 1]);
        this.densityScale = d3.scaleSequential((d) => (this.colourPalette(this.colorPreTransform(d))));

        const tooltip = new TooltipComponent();
        const gameDatumHexagonIdx = this.findChosenGameIdx(bins);

        this.svg
        .selectAll("hexagons")
        .data(bins)
        .enter()
        .append("path")
            // Draw hexagons
            .attr("d", (d) => `M${d.x},${d.y}${this.hexBin.hexagon()}`)
            .attr("fill", (d) => this.densityScale(d.length))
            // Highlight current game bin
            .attr("id", (d, i) => i == gameDatumHexagonIdx ? this.gameDatumHexagonId : null)
            .classed("selected-game-bin", (d, i) => i == gameDatumHexagonIdx)
            // Tooltip registration
            .on("mouseover", (event, d) => {
                d3.select(event.target).classed("mouseover-bin", true);
                tooltip.setText(d.length);
                tooltip.setVisible();
            })
            .on("mouseout", (event, d) => {
                d3.select(event.target).classed("mouseover-bin", false);
                tooltip.setHidden();
            });
        
        // Draw the bin that the game lies in *last* so that the highlight stroke is fully visible
        this.svg.select(`#${this.gameDatumHexagonId}`).raise();
    }

    private drawColourScale(): void {
        // Create scales from density to dimensions (invert it to scale from dimensions to density)
        const densityToCoord = d3.scaleLog()
            .base(2)
            .domain(this.colorPreTransform.domain())
            .range([this.colourScaleHeight, 1]);    

        // Compute height of scale slices and generate range of values for drawing
        const sliceHeight = this.colourScaleHeight / this.colourScaleSlices;
        const valRange = d3.range(0, this.colourScaleHeight, sliceHeight);
        
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
            .style("stroke-width", 1)
            .style("stroke", (d) => {
                const density = densityToCoord.invert(d);
                return this.densityScale(density);
            })
            .style("fill", (d) => {
                const density = densityToCoord.invert(d);
                return this.densityScale(density);
            });

        // Create numeric axis showing numbers corresponding to each colour
        this.svg
        .append("g")
        .attr("transform", `translate(${this.margin.left + this.width + this.colourScaleHorizontalOffset + this.colourScaleWidth},\
                               ${this.colourScaleVerticalOffset})`)
        .call(d3.axisRight(densityToCoord));

        // Create border rectangle around scale
        this.svg
        .append("rect")
            .attr("x", this.margin.left + this.width + this.colourScaleHorizontalOffset)
            .attr("y", this.colourScaleVerticalOffset)
            .attr("height", this.colourScaleHeight)
            .attr("width", this.colourScaleWidth)
            .classed("bin-scale-border-rect", true);
    }

    /**
     * Compute the index of the hexagon bin containing the currently selected game's data
     * 
     * @param bins Array containing paths made of (X, Y) pairs that encode each hexagonal bin
     * plus special named 'x' and 'y' members that define the center of each hexagon
     * 
     * @returns Index of the bin contained in the return value of the call to `hexBin`,
     * -1 if the game does not have a value in either of the two selected categories
     * (i.e. `this.gameData === undefined`)
     */
    private findChosenGameIdx(bins: Array<Array<number>>): number {
        if (this.gameData === undefined) { return -1; }
        const gamePoint: Point = {x: this.binX(this.gameData.x), y: this.binY(this.gameData.y)};

        // Use Manhattan distance
        let closestHexagonIdx = 0;
        let closestDist = 1e10;
        for (let idx = 0; idx < bins.length; idx++) {
            const center = bins[idx];
            const currentDist = Math.abs(center['x'] - gamePoint.x) + Math.abs(center['y'] - gamePoint.y);
            if (currentDist < closestDist) {
                closestDist = currentDist;
                closestHexagonIdx = idx;
            }
        }
        return closestHexagonIdx;
    }
}
