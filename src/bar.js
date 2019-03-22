
import { scaleOrdinal, schemeCategory10, scaleLinear, scaleLog, scalePoint } from  "d3-scale";
import React from "react";
import PropTypes from "prop-types";
import { set } from "d3-collection";

import {EventCapture, ClickCallback} from "react-stockcharts/lib/interactive";
import { ChartCanvas, Chart } from "react-stockcharts";
import BarSeries from "./MyBarSeries";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import {HoverTooltip} from "react-stockcharts/lib/tooltip";

import { format } from "d3-format";
import { extent } from "d3-array";
import { timeFormat } from "d3-time-format";
import { LineSeries, ScatterSeries, CircleMarker} from "react-stockcharts/lib/series";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");

function tooltipContent(ys) {
	return ({ currentItem, xAccessor }) => {
		return {
			x: currentItem.name,
			y: [
				{
					label: "income",
					value: currentItem.x
				},
				{
					label: "population",
					value: currentItem.y && numberFormat(currentItem.y)
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

class BarChart extends React.Component {
	render() {
		const { data: unsortedData, type, width, ratio } = this.props;

        const data = unsortedData.slice().sort((a, b) => a.x2 - b.x2);
console.log(data)
		const f = scaleOrdinal(schemeCategory10)
			.domain(set(data.map(d => d.y)));

            const fill = d => f(d.y);
        const radius = d => 1;

		return (
			<ChartCanvas ratio={ratio}
				width={width}
				height={400}
				margin={{ left: 80, right: 10, top: 20, bottom: 30 }}
				type={type}
				seriesName="Fruits"
				xExtents={list => list.map(d => d.x2)}
				data={data}
				xAccessor={d => d.x2}
				xScale={scaleLinear()}
                padding={1}
                xExtents={[6, -2]}
			>
            
				<Chart id={1} yExtents={d => [0, d.y]} yMousePointerRectWidth={45}>
                    
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="left" orient="left" />
					<BarSeries yAccessor={d => d.y} />
                    
                    

                    <HoverTooltip tooltipSVG={tooltipSVG} 
                        tooltipContent={tooltipContent([])}
                    />
                    <CrossHairCursor snapX={false} />
                    <ClickCallback onMouseMove={(morProps,e) =>  {console.log("mouseMove")}} />
				</Chart>
			</ChartCanvas>

		);
	}
}

BarChart.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

BarChart.defaultProps = {
	type: "svg",
};

BarChart = fitWidth(BarChart);

export default BarChart;
