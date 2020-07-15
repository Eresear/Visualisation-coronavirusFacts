import React from "react";
import WordCloud from "wordcloud";
import * as d3 from "d3";
import stopwords from '../config/stopwords.json';
const styles = {
  fontFamily: "sans-serif",
  textAlign: "center",
};

class WordCloudChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        topic: "",
        factChecker: "",
        keyWord: "",
      };
      this.handleTopicChange = this.handleTopicChange.bind(this);
      this.handleCheckerChange = this.handleCheckerChange.bind(this);
      this.handleKeyWordChange = this.handleKeyWordChange.bind(this);
  }
  componentDidMount() {
    const csvFile = this.props.csvFile;
   this.filterData(csvFile).then((data)=>{
        this.drawChart(data);
    });
   
  }

  handleTopicChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ topic: event.target.value }, () => {
        this.filterData(csvFile).then((data)=>{
            this.drawChart(data);
        });
    });
  }
  handleCheckerChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ factChecker: event.target.value }, () => {
        this.filterData(csvFile).then((data)=>{
            this.drawChart(data);
        });
    });
  }
  handleKeyWordChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ keyWord: event.target.value }, () => {
        this.filterData(csvFile).then((data)=>{
            this.drawChart(data);
        });
    });
  }

  async filterData(csvFile) {
      console.log("stop words",stopwords);

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
        var sentence = d["What did you fact-check?"].toString().trim();
        var letters = sentence.match(/\b[^\d\W]+\b/g);
        // console.log('letters',letters);
        letters.forEach((l) => {
          let word = l.toLowerCase();
          if (stopwords.includes(word)) {
            return;
          }
          if (!counts[word]) {
            counts[word] = 1;
          } else {
            counts[word]++;
          }
        });

       
      }
    });
    var result = [];
    console.log("count", counts);
    Object.keys(counts).forEach(function (key) {
      result.push([key, counts[key]]);
    });

    console.log("result ", result);
    return result;
    
    // var options = {
    //     list: result,
    //     weightFactor: 15,
    //     fontFamily: "Times, serif",
    //     color: "random-dark",
    //     rotateRatio: 0.5,
    //     rotationSteps: 2,
    //     backgroundColor: "#90B66A",
    //     // drawMask:true,
    //     // shape: function(theta) {
    //     //     var max = 171;
    //     //     var leng = [81,83,83,83,83,83,83,84,83,83,83,83,83,84,83,83,85,85,85,85,85,86,86,85,85,85,85,86,86,87,86,87,87,87,88,88,88,88,88,89,89,90,89,90,90,89,90,90,91,91,91,92,92,92,93,92,93,93,93,93,94,95,94,95,95,95,96,96,96,97,97,98,98,97,98,99,99,100,99,100,100,101,101,102,102,103,102,103,103,104,104,105,105,105,106,106,106,107,107,107,109,109,109,109,110,110,111,111,112,112,112,112,113,113,114,115,115,115,115,116,116,117,118,118,119,120,119,120,121,121,122,122,122,123,123,124,124,125,126,126,126,126,127,128,129,128,129,129,130,131,131,131,132,133,133,134,134,135,135,136,136,137,137,138,138,138,139,139,139,139,141,141,141,142,143,143,143,143,151,152,153,153,154,153,154,155,155,155,156,156,157,156,157,158,158,159,159,159,160,159,161,160,160,161,161,161,161,162,163,163,163,164,163,164,164,165,165,165,165,166,166,166,166,167,167,167,167,167,167,168,168,168,168,168,169,169,169,169,169,169,170,170,170,170,170,170,170,170,171,170,170,170,171,170,170,170,171,171,170,171,170,171,171,170,171,170,171,170,171,170,171,170,170,170,170,170,170,170,170,169,167,167,167,167,167,166,166,166,165,165,165,164,164,165,164,164,163,164,163,163,162,163,162,162,162,162,161,161,161,161,161,161,160,161,160,160,160,160,159,159,158,159,159,158,158,157,158,158,158,157,157,157,156,156,156,156,155,155,156,155,155,154,154,154,154,154,154,154,154,154,154,153,153,153,153,152,152,152,152,152,151,151,152,152,150,151,151,150,150,150,150,150,149,149,149,150,149,149,149,148,149,148,148,148,148,148,147,148,147,147,147,147,147,146,147,146,146,146,146,146,146,146,146,145,145,145,145,146,145,145,144,145,144,144,145,144,144,144,144,144,144,144,143,142,142,142,142,142,142,142,142,142,143,142,142,142,142,142,142,141,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,143,142,142,143,142,142,143,142,143,143,142,143,143,143,142,143,143,143,143,143,144,143,98,95,94,91,90,89,88,87,86,85,86,85,84,83,84,83,82,82,82,81,82,81,82,81,81,81,82,81,81,81,81,80,81,80,81,82,80,81,80,80,81,80,80,80,81,80,80,81,80,80,80,81,80,80,80,80,80,80,80,80,81,80,80,81,80,80,80,81,82,80,80,80,81,82,81,80,80,81,82,81,81,81,81,82,82,82,82,82,82,83,83];

    //     //     return leng[(theta / (2 * Math.PI)) * leng.length | 0] / max;
    //     //   },
    //   };

    //   WordCloud(this.refs["my-canvas"], options);

  }


  drawChart(data) {


      var options = {
        list: data,
        weightFactor: 10,
        fontFamily: "Times, serif",
        color: "random-dark",
        rotateRatio: 0.5,
        rotationSteps: 2,
        backgroundColor: "#90B66A",
      };

      WordCloud(this.refs["my-canvas"], options);
  }
  render() {
    return (
      <div id="wordCloud">
          <div className="sticky svelte-odrhfj">
          <div className="sticky-contents svelte-odrhfj">
            <div className="filters-label svelte-odrhfj">
              Filter the wordcloud
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
          </div>
        </div>
        <div style={styles}>
          <canvas ref="my-canvas" width="760px" height="480px"></canvas>
        </div>
      </div>
    );
  }
}

export default WordCloudChart;
