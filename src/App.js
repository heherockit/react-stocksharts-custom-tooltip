import React from 'react';
//import Chart from './CandleStickChartWithHoverTooltip';
import BChart from './bubble';
import Chart from './bar';
//import { getData } from "./utils"
import { getData as bget } from "./bubleutils"
import { getData } from "./barutils"

import './App.css';

import { TypeChooser } from "react-stockcharts/lib/helper";

class App extends React.Component {
  componentDidMount() {
		getData().then(data => {
      var data2 = data.splice(0, 4)
      for(var i = 0; i < data2.length; i++) {
        data2[i].x2 = i;
      }
      console.log(data2);
			this.setState({ data : data2 })
    })
    bget().then(data => {
      var data2 = data.sort((a,b) => a.income - b.income).splice(0, 4)
      for(var i = 0; i < data2.length; i++) {
        data2.x2 = i;
      }
      this.setState({bdata: data2})
    })
	}
	render() {
		if (this.state == null || !this.state.data || !this.state.bdata) {
			return <div>Loading...</div>
		}
		return (
      <div>
        <BChart type='hybrid' data={this.state.bdata} />
        <Chart type='hybrid' data={this.state.data} />
      
      </div>
			
		)
	}
}

export default App;
