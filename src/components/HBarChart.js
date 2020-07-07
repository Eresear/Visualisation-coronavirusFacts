import React from "react";

import "./HBarChart.css";
import * as d3 from "d3";

class HbarChart extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      topic: "",
      factChecker: "",
      keyWord: "",
    };
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleCheckerChange = this.handleCheckerChange.bind(this);
    this.handleKeyWordChange = this.handleKeyWordChange.bind(this);
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
      return d3.ascending(b.country, a.country);
    });

    this.updateChart(data);
  }
  handleTopicChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ topic: event.target.value }, () => {
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
              {/* <div className="clear svelte-x3l2dr">
                   <svg width="0.7em" height="0.7em" viewBox="0 0 18 18" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M16.945 4.88593C17.9213 3.90962 17.9213 2.32671 16.945 1.3504C15.9687 0.374086 14.3858 0.374086 13.4095 1.3504L9.17725 5.58263L4.94501 1.3504C3.9687 0.374086 2.38579 0.374086 1.40948 1.3504C0.433168 2.32671 0.433168 3.90962 1.40948 4.88593L5.64171 9.11816L1.40948 13.3504C0.433168 14.3267 0.433168 15.9096 1.40948 16.8859C2.38579 17.8622 3.9687 17.8622 4.94501 16.8859L9.17725 12.6537L13.4095 16.8859C14.3858 17.8622 15.9687 17.8622 16.945 16.8859C17.9213 15.9096 17.9213 14.3267 16.945 13.3504L12.7128 9.11816L16.945 4.88593Z"></path>
                   </svg>
                   </div>  */}
              <select
                className="svelte-x3l2dr"
                onChange={this.handleTopicChange}
              >
                <option value="">Any</option>
                <option value="Authorities">Authorities </option>
                <option value="Causes">Causes </option>
                <option value="Conspiracy theory">Conspiracy theory </option>
                <option value="Cures">Cures </option>
                <option value="Other">Other </option>
                <option value="Prevention">Prevention </option>
                <option value="Spread">Spread </option>
                <option value="Symptoms">Symptoms </option>
              </select>
            </div>
            <div className="filter filter--type-dropdown svelte-x3l2dr">
              <div className="label svelte-x3l2dr">Fact-checker</div>
              {/* <div className="clear svelte-x3l2dr">
                   <svg width="0.7em" height="0.7em" viewBox="0 0 18 18" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M16.945 4.88593C17.9213 3.90962 17.9213 2.32671 16.945 1.3504C15.9687 0.374086 14.3858 0.374086 13.4095 1.3504L9.17725 5.58263L4.94501 1.3504C3.9687 0.374086 2.38579 0.374086 1.40948 1.3504C0.433168 2.32671 0.433168 3.90962 1.40948 4.88593L5.64171 9.11816L1.40948 13.3504C0.433168 14.3267 0.433168 15.9096 1.40948 16.8859C2.38579 17.8622 3.9687 17.8622 4.94501 16.8859L9.17725 12.6537L13.4095 16.8859C14.3858 17.8622 15.9687 17.8622 16.945 16.8859C17.9213 15.9096 17.9213 14.3267 16.945 13.3504L12.7128 9.11816L16.945 4.88593Z"></path>
                   </svg>
                   </div>  */}
              <select
                className="svelte-x3l2dr"
                onChange={this.handleCheckerChange}
              >
                <option value="">Any</option>
                <option value="15min.lt">15min.lt </option>
                <option value="AAP FactCheck">AAP FactCheck </option>
                <option value="AFP">AFP </option>
                <option value="AfricaCheck">AfricaCheck </option>
                <option value="Agencia Ocote">Agencia Ocote </option>
                <option value="Agência Lupa">Agência Lupa </option>
                <option value="Animal Político">Animal Político </option>
                <option value="Annie Lab">Annie Lab </option>
                <option value="Aos Fatos">Aos Fatos </option>
                <option value="BOOM FactCheck">BOOM FactCheck </option>
                <option value="Bolivia Verifica">Bolivia Verifica </option>
                <option value="BuzzFeed Japan">BuzzFeed Japan </option>
                <option value="Check Your Fact">Check Your Fact </option>
                <option value="CheckNews">CheckNews </option>
                <option value="Chequeado">Chequeado </option>
                <option value="Colombiacheck">Colombiacheck </option>
                <option value="Convoca.pe">Convoca.pe </option>
                <option value="Correctiv">Correctiv </option>
                <option value="Delfi Melo Detektorius (Lie Detector)">
                  Delfi Melo Detektorius (Lie Detector){" "}
                </option>
                <option value="Demagog">Demagog </option>
                <option value="Digiteye India">Digiteye India </option>
                <option value="Dubawa">Dubawa </option>
                <option value="Décrypteurs - Radio-Canada">
                  Décrypteurs - Radio-Canada{" "}
                </option>
                <option value="Décrypteurs - Radio-Canada and CBC">
                  Décrypteurs - Radio-Canada and CBC{" "}
                </option>
                <option value="Détecteur de rumeurs">
                  Détecteur de rumeurs{" "}
                </option>
                <option value="EFE Verifica">EFE Verifica </option>
                <option value="Ecuador Chequea">Ecuador Chequea </option>
                <option value="Efecto Cocuyo">Efecto Cocuyo </option>
                <option value="Effecinque">Effecinque </option>
                <option value="El Surtidor">El Surtidor </option>
                <option value="Ellinika Hoaxes">Ellinika Hoaxes </option>
                <option value="Estadão Verifica">Estadão Verifica </option>
                <option value="FactCheck Georgia">FactCheck Georgia </option>
                <option value="FactCheck.org">FactCheck.org </option>
                <option value="FactCheckNI">FactCheckNI </option>
                <option value="FactCrescendo">FactCrescendo </option>
                <option value="Facta">Facta </option>
                <option value="Factcheck.Vlaanderen">
                  Factcheck.Vlaanderen{" "}
                </option>
                <option value="Factcheck.kz">Factcheck.kz </option>
                <option value="Factly">Factly </option>
                <option value="Factnameh">Factnameh </option>
                <option value="Faktabaari/FactBar">Faktabaari/FactBar </option>
                <option value="Faktograf">Faktograf </option>
                <option value="Fatabyyano">Fatabyyano </option>
                <option value="France 24 Observers">
                  France 24 Observers{" "}
                </option>
                <option value="Full Fact">Full Fact </option>
                <option value="GhanaFact">GhanaFact </option>
                <option value="INFACT">INFACT </option>
                <option value="India Today">India Today </option>
                <option value="Istinomer">Istinomer </option>
                <option value="JTBC news">JTBC news </option>
                <option value="Källkritikbyrån">Källkritikbyrån </option>
                <option value="La Nación">La Nación </option>
                <option value="La Silla Vacía">La Silla Vacía </option>
                <option value="La Voz de Guanacaste">
                  La Voz de Guanacaste{" "}
                </option>
                <option value="LeadStories">LeadStories </option>
                <option value="Les Décodeurs">Les Décodeurs </option>
                <option value="Maldita.es">Maldita.es </option>
                <option value="MediaWise">MediaWise </option>
                <option value="Misbar">Misbar </option>
                <option value="Mygopen">Mygopen </option>
                <option value="Myth Detector">Myth Detector </option>
                <option value="NewsMobile">NewsMobile </option>
                <option value="Newschecker">Newschecker </option>
                <option value="Newsmeter.in">Newsmeter.in </option>
                <option value="Newtral.es">Newtral.es </option>
                <option value="Nieuwscheckers">Nieuwscheckers </option>
                <option value="Observador">Observador </option>
                <option value="OjoPúblico">OjoPúblico </option>
                <option value="Open">Open </option>
                <option value="Pagella Politica">Pagella Politica </option>
                <option value="Periodismo de Barrio">
                  Periodismo de Barrio{" "}
                </option>
                <option value="PesaCheck">PesaCheck </option>
                <option value="Poligrafo">Poligrafo </option>
                <option value="PolitiFact">PolitiFact </option>
                <option value="Rappler">Rappler </option>
                <option value="Raskrinkavanje">Raskrinkavanje </option>
                <option value="Re:Check">Re:Check </option>
                <option value="Salud con lupa">Salud con lupa </option>
                <option value="Science Feedback">Science Feedback </option>
                <option value="Spondeo Media">Spondeo Media </option>
                <option value="Sure And Share Center MCOT">
                  Sure And Share Center MCOT{" "}
                </option>
                <option value="TEMPO">TEMPO </option>
                <option value="Taiwan FactCheck Center">
                  Taiwan FactCheck Center{" "}
                </option>
                <option value="Teyit">Teyit </option>
                <option value="The Quint">The Quint </option>
                <option value="TheJournal.ie">TheJournal.ie </option>
                <option value="TjekDet.dk">TjekDet.dk </option>
                <option value="VERA Files">VERA Files </option>
                <option value="Verificado">Verificado </option>
                <option value="Vishvas News">Vishvas News </option>
                <option value="Vistinomer">Vistinomer </option>
                <option value="VoxCheck">VoxCheck </option>
                <option value="Washington Post Fact-Checker">
                  Washington Post Fact-Checker{" "}
                </option>
                <option value="franceinfo">franceinfo </option>
              </select>
            </div>
          </div>
        </div>
        <div ref={this.myRef} align="center"></div>
      </div>
    );
  }
}

export default HbarChart;
