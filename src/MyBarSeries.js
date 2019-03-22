import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "react-stockcharts/lib/GenericChartComponent";
import { getAxisCanvas,getMouseCanvas  } from "react-stockcharts/lib/GenericComponent";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";

import MyStackedBarSeries, {
	drawOnCanvasHelper,
	drawOnCanvas2,
	getBarsSVG2,
	svgHelper,
	identityStack
} from "./MyStackedBarSeries";

import { functor, isDefined,
	getClosestItemIndexes,
	strokeDashTypes,
	getStrokeDasharray,
	hexToRGBA, } from "react-stockcharts/lib/utils";

class BarSeries extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
        this.drawOnCanvas = this.drawOnCanvas.bind(this);
        this.isHover = this.isHover.bind(this);
        this.onHover = this.onHover.bind(this);
    }
    onHover(morProps) {
        console.log('hover');
        console.log(morProps);
    }
    isHover(moreProps) {
		// console.log("HERE")
		const { highlightOnHover, yAccessor, hoverTolerance } = this.props;

		if (!highlightOnHover) return false;

		const { mouseXY, currentItem, xScale, plotData } = moreProps;
		const { chartConfig: { yScale, origin } } = moreProps;

		const { xAccessor } = moreProps;

		const [x, y] = mouseXY;
		const radius = hoverTolerance;

		const { left, right } = getClosestItemIndexes(plotData, xScale.invert(x), xAccessor);
		if (left === right) {
			const cy = yScale(yAccessor(currentItem)) + origin[1];
			const cx = xScale(xAccessor(currentItem)) + origin[0];

			const hovering1 = Math.pow(x - cx, 2) + Math.pow(y - cy, 2) < Math.pow(radius, 2);

			return hovering1;
		} else {
			const l = plotData[left];
			const r = plotData[right];
			const x1 = xScale(xAccessor(l)) + origin[0];
			const y1 = yScale(yAccessor(l)) + origin[1];
			const x2 = xScale(xAccessor(r)) + origin[0];
			const y2 = yScale(yAccessor(r)) + origin[1];

			// y = m * x + b
			const m /* slope */ = (y2 - y1) / (x2 - x1);
			const b /* y intercept */ = -1 * m * x1 + y1;

			const desiredY = Math.round(m * x + b);

			const hovering2 = y >= desiredY - radius && y <= desiredY + radius;

			return hovering2;
		}
	}
	drawOnCanvas(ctx, moreProps) {
		if (this.props.swapScales) {
			const { xAccessor } = moreProps;
			drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack);
		} else {
			const bars = getBars(this.props, moreProps);
			drawOnCanvas2(this.props, ctx, bars);
		}

	}
	renderSVG(moreProps) {
		if (this.props.swapScales) {
			const { xAccessor } = moreProps;
			return <g>{svgHelper(this.props, moreProps, xAccessor, identityStack)}</g>;
		} else {
			const bars = getBars(this.props, moreProps);
			return <g>{getBarsSVG2(this.props, bars)}</g>;
		}

	}
	render() {
        const {clip, highlightOnHover, onHover, onUnHover } = this.props;
		const hoverProps = (highlightOnHover || onHover || onUnHover)
			? {
				isHover: this.isHover,
				drawOn: ["mousemove", "pan"],
				canvasToDraw: getMouseCanvas
			}
			: {
                isHover: this.isHover,
				drawOn: ["mousemove", "pan"],
                canvasToDraw: getAxisCanvas,
                canvasToDraw: getMouseCanvas
			};

		return (
			<GenericChartComponent
                clip={clip}
                svgDraw={this.renderSVG}
				canvasDraw={this.drawOnCanvas}

			onClickWhenHover={this.props.onClick}
			onDoubleClickWhenHover={this.props.onDoubleClick}
			onContextMenuWhenHover={this.props.onContextMenu}
			onHover={() => console.log('hover')}
			onUnHover={this.props.onUnHover}
			{...hoverProps}
			/>
		);
	}
}

BarSeries.propTypes = {
	baseAt: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.func,
	]),
	stroke: PropTypes.bool,
	width: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.func
	]),
	yAccessor: PropTypes.func.isRequired,
	opacity: PropTypes.number,
	fill: PropTypes.oneOfType([
		PropTypes.func, PropTypes.string
	]),
	className: PropTypes.oneOfType([
		PropTypes.func, PropTypes.string
	]),
	clip: PropTypes.bool,
	swapScales: PropTypes.bool,
};


BarSeries.defaultProps = {className: "react-stockcharts-scatter",...MyStackedBarSeries.defaultProps};

export default BarSeries;

/*
 Initially, this program was using StackedBarSeries.getBars
 to benefit from code reuse and having a single place that
 contains the logic for drawing all types of bar charts
 simple, grouped, horizontal, but turnes out
 making it highly cuztimizable also made it slow for the
 most simple case, a regular bar chart.
 This function contains just the necessary logic
 to create bars
*/
function getBars(props, moreProps) {
	const { baseAt, fill, stroke, yAccessor } = props;
	const { xScale, xAccessor, plotData, chartConfig: { yScale } } = moreProps;

	const getFill = functor(fill);
	const getBase = functor(baseAt);

	const widthFunctor = functor(props.width);

	const width = widthFunctor(props, {
		xScale,
		xAccessor,
		plotData
	});
	/*
	const barWidth = Math.round(width);
	const offset = Math.round(barWidth === 1 ? 0 : 0.5 * barWidth);
	*/
	const offset = Math.floor(0.5 * width);

	const bars = plotData
		.filter(d => isDefined(yAccessor(d)))
		.map(d => {
			const yValue = yAccessor(d);
			let y = yScale(yValue);

			const x = Math.round(xScale(xAccessor(d))) - offset;
			let h = getBase(xScale, yScale, d) - yScale(yValue);

			if (h < 0) {
				y = y + h;
				h = -h;
			}

			return {
				// type: "line"
				x,
				y: Math.round(y),
				height: Math.round(h),
				width: offset * 2,
				fill: getFill(d, 0),
				stroke: stroke ? getFill(d, 0) : "none",
			};
		});

	return bars;
}