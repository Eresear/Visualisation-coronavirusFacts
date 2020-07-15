import React from "react";

import "./HBarChart.css";
import * as d3 from "d3";
import Switch from "react-switch";

class HbarChart extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      topic: "",
      factChecker: "",
      keyWord: "",
      sortByValue: false ,
    };
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleCheckerChange = this.handleCheckerChange.bind(this);
    this.handleKeyWordChange = this.handleKeyWordChange.bind(this);
    this.handleSwitchChange = this.handleSwitchChange.bind(this);
  }
  updateChart(data) {
    const { height: heightOrigin, width: widthOrigin } = this.props;
    var margin = { top: 80, right: 180, bottom: 80, left: 180 },
      width = widthOrigin - margin.left - margin.right,
      height = heightOrigin - margin.top - margin.bottom;
    var svg = d3.select(this.myRef.current).select("svg g");
    let xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain([
        0,
        d3.max(data, function (d) {
          return d.count;
        }),
      ]);
    let yScale = d3
      .scaleBand()
      .rangeRound([height, 0])
      .padding(0.1)
      .domain(
        data.map(function (d) {
          return d.country;
        })
      );

    let xAxis = d3.axisTop().scale(xScale).tickSize(5);
    let yAxis = d3.axisLeft().scale(yScale).tickSize(0);

    svg.select(".yAxis").call(yAxis);

    svg.select(".xAxis").call(xAxis);

    //make y axis to show bar names

    var bars = svg.selectAll(".bar").data(data);
    bars.exit().remove();

    //append rects
    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .merge(bars)
      .transition()
      .attr("x", 0)
      .attr("y", function (d) {
        return yScale(d.country);
      })
      .attr("height", yScale.bandwidth())

      .attr("width", function (d) {
        return xScale(d.count);
      });
  }
  async filterData(csvFile) {
    let selectedTopic = this.state.topic;
    let factChecker = this.state.factChecker;
    let keyWord = this.state.keyWord;
    let sortByValue = this.state.sortByValue;
    const dataRead = await d3.csv(csvFile);
    let counts = {};
    dataRead.forEach(function (d) {
      var content = d["What did you fact-check?"].toString().trim();
      if (
        (selectedTopic === "" ||
          d.Category.toString().trim() === selectedTopic) &&
        (factChecker === "" ||
          d.Organization.toString().trim() === factChecker) &&
        (keyWord === "" || content.indexOf(keyWord) > 0)
      ) {
        var countriesString = d.Countries.toString();
        var splits = countriesString.split(",");
        splits.forEach(function (country) {
          country = country.trim();
          if (!counts[country]) {
            counts[country] = 1;
          } else {
            counts[country]++;
          }
        });
      }
    });
    let data = [];
    Object.keys(counts).forEach(function (key) {
      data.push({
        country: key,
        count: counts[key],
      });
    });
    data = data.sort(function (a, b) {
      if(sortByValue){
        if(a.count === b.count){
          return d3.ascending(b.country, a.country);
        }else{
          return d3.ascending( a.count,b.count);
        }
    
      }else{
        return d3.ascending(b.country, a.country);
      }
      
    });

    this.updateChart(data);
  }
  handleTopicChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ topic: event.target.value }, () => {
      this.filterData(csvFile);
    });
  }
  handleSwitchChange(event) {
    // this.setState({ sortByValue: event });
    const csvFile = this.props.csvFile;
    this.setState({ sortByValue: event  }, () => {
      this.filterData(csvFile);
    });

  }

  handleCheckerChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ factChecker: event.target.value }, () => {
      this.filterData(csvFile);
    });
  }
  handleKeyWordChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ keyWord: event.target.value }, () => {
      this.filterData(csvFile);
    });
  }
  drawChart() {
    const { csvFile, height: heightOrigin, width: widthOrigin } = this.props;
    var margin = { top: 80, right: 180, bottom: 80, left: 180 },
      width = widthOrigin - margin.left - margin.right,
      height = heightOrigin - margin.top - margin.bottom;

    let accessToRef = d3.select(this.myRef.current);

    var svg = accessToRef
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var counts = {};
    d3.csv(csvFile).then((dataRead) => {
      dataRead.forEach(function (d) {
        var countriesString = d.Countries.toString();
        var splits = countriesString.split(",");
        splits.forEach(function (country) {
          country = country.trim();
          if (!counts[country]) {
            counts[country] = 1;
          } else {
            counts[country]++;
          }
        });
      });
      let data = [];
      Object.keys(counts).forEach(function (key) {
        data.push({
          country: key,
          count: counts[key],
        });
      });

      data = data.sort(function (a, b) {
        return d3.ascending(b.country, a.country);
      });

      var xScale = d3
        .scaleLinear()
        .range([0, width])
        .domain([
          0,
          d3.max(data, function (d) {
            return d.count;
          }),
        ]);
      var yScale = d3
        .scaleBand()
        .rangeRound([height, 0])
        .padding(0.1)
        .domain(
          data.map(function (d) {
            return d.country;
          })
        );

      //make y axis to show bar names
      var yAxis = d3.axisLeft().scale(yScale).tickSize(5);

      var xAxis = d3.axisTop().scale(xScale).tickSize(5);

      //draw axis
      var gy = svg.append("g").attr("class", "yAxis").call(yAxis);

      var gx = svg.append("g").attr("class", "xAxis").call(xAxis);

      var bars = svg.selectAll(".bar").data(data).enter().append("g");

      //append rects bars
      bars
        .append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
          return yScale(d.country);
        })
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("width", function (d) {
          return xScale(d.count);
        });
    });
  }
  componentDidMount() {
    this.drawChart();
  }

  render() {
    return (
      <div>
        <div className="sticky svelte-odrhfj">
          <div className="sticky-contents svelte-odrhfj">
            <div className="filters-label svelte-odrhfj">
              Filter the fact checks
            </div>
            <div className="filter filter--type-input svelte-x3l2dr">
              <div className="label svelte-x3l2dr">Filter the fact checks</div>
              <input
                placeholder="Search for a fact check..."
                className="svelte-x3l2dr"
                onChange={this.handleKeyWordChange}
              />
            </div>
            <div className="filter filter--type-dropdown svelte-x3l2dr">
              <div className="label svelte-x3l2dr">Topic</div>
              <select
                className="svelte-x3l2dr"
                onChange={this.handleTopicChange}
              >
                <option value="">Any</option>
                {this.props.Category.map((e, key) => {
                        return <option key={key} value={e.value}>{e.name}</option>;
                    })}
              </select>
            </div>
            <div className="filter filter--type-dropdown svelte-x3l2dr">
              <div className="label svelte-x3l2dr">Fact-checker</div>
              <select
                className="svelte-x3l2dr"
                onChange={this.handleCheckerChange}
              >
                <option value="">Any</option>
                {this.props.Organization.map((e, key) => {
                        return <option key={key} value={e.value}>{e.name}</option>;
                    })}
              </select>

            </div>
            <div>
            <Switch onChange={this.handleSwitchChange} checked={this.state.sortByValue} />
            </div>
          </div>
        </div>
        <div ref={this.myRef} align="center"></div>
      </div>
    );
  }
}

export default HbarChart;
