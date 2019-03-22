import { set } from "d3-collection";
import { scaleOrdinal, schemeCategory10, scaleLinear, scaleLog, scalePoint } from  "d3-scale";
import { format } from "d3-format";
import { extent } from "d3-array";
import { timeFormat } from "d3-time-format";

import React from "react";
import PropTypes from "prop-types";

import { ChartCanvas, Chart } from "react-stockcharts";
import { ScatterSeries, CircleMarker, BarSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import {HoverTooltip} from "react-stockcharts/lib/tooltip";
import MyHoverTooltip from "./MyHoverTooltip";

import { fitWidth } from "react-stockcharts/lib/helper";

const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");

function tooltipContent(ys) {
	return ({ currentItem, xAccessor }) => {
		return {
			x: currentItem.name,
			y: [
				{
					label: "income",
					value: currentItem.income && numberFormat(currentItem.income)
				},
				{
					label: "population",
					value: currentItem.population && numberFormat(currentItem.population)
				}
			]
				.concat(
					ys.map(each => ({
						label: each.label,
						value: each.value(currentItem),
						stroke: each.stroke
					}))
				)
				.filter(line => line.value)
		};
	};
}

const PADDING = 5;
const X = 10;
const Y = 10;

function tooltipSVG({ fontFamily, fontSize, fontFill }, content) {
	const tspans = [];
	const startY = Y + fontSize * 0.9;

    console.log(content);

	for (let i = 0; i < content.y.length; i++) {
		const y = content.y[i];
		const textY = startY + (fontSize * (i + 1));

		tspans.push(<tspan key={`L-${i}`} x={X} y={textY} fill={y.stroke}>{y.label}</tspan>);
		tspans.push(<tspan key={i}>: </tspan>);
		tspans.push(<tspan key={`V-${i}`}>{y.value}</tspan>);
    }
    console.log(content.y.filter(v => v.label == 'income'))
    var header = <tspan x={X} y={startY}>{content.x} - {content.y.filter(v => v.label == 'income')[0].value > 4000 ? "GREATE" : "SOSO"}</tspan>;

	return <text fontFamily={fontFamily} fontSize={fontSize} fill={fontFill}>
		{header}
		{tspans}
	</text>;
}

class BubbleChart extends React.Component {
	render() {
		const { data: unsortedData, type, width, ratio } = this.props;

		const data = unsortedData.slice().sort((a, b) => a.income - b.income);
		

		const f = scaleOrdinal(schemeCategory10)
			.domain(set(data.map(d => d.region)));
		const fill = d => f(d.region);
		const radius = d => 0;
		return (
			<ChartCanvas ratio={ratio} width={width} height={400}
					margin={{ left: 70, right: 70, top: 20, bottom: 30 }} type={type}
					seriesName="Wealth & Health of Nations"
					data={data}
					xAccessor={d => d.income}
					xScale={scaleLinear()}
					padding={{ left: 20, right: 20 }}
					>
				<Chart id={1}
						yExtents={d => d.lifeExpectancy}
						yMousePointerRectWidth={45}>
					<XAxis axisAt="bottom" orient="bottom" ticks={2} tickFormat={format(",d")}/>
					<YAxis axisAt="left" orient="left" />
                    <BarSeries yAccessor={d => d.lifeExpectancy} width={20} />
					<ScatterSeries yAccessor={d => d.lifeExpectancy} marker={CircleMarker}
						fill={fill}
						markerProps={{ r: radius, fill: fill }} />

                    <HoverTooltip tooltipSVG={tooltipSVG} 
                        tooltipContent={tooltipContent([])}
                    />
				</Chart>
				<CrossHairCursor snapX={false} />
			</ChartCanvas>

		);
	}
}

BubbleChart.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

BubbleChart.defaultProps = {
	type: "svg",
};
BubbleChart = fitWidth(BubbleChart);

export default BubbleChart;