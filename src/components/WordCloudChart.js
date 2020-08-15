import React from "react";
import WordCloud from "wordcloud";
import * as d3 from "d3";
import stopwords from "../config/stopwords.json";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import "./WordCloudChart.css";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdbreact";
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';
import skmeans from "skmeans";
import wordVecs from "./wordvector.js";



const styles = {
  fontFamily: "sans-serif",
  // textAlign: "center",
  position: "relative",
  width: "1000px",
  height: "800px",
  display: "flex",
};
const linkStyle ={
  color: 'blue',
}

const Header = [
  {
    label: "Resume",
    field: "Resume",
    sort: "asc",
    minimal:"lg",
  },
  {
    label: "Origin Url",
    field: "Origin Url",
    sort: "asc",
    minimal:"sm",
  },
  {
    label: "Fact-Check Url",
    field: "Fact-Check Url",
    sort: "asc",
    minimal:"sm",
  },
];

class WordCloudChart extends React.Component {
  constructor(props) {

    super(props);

    this.cosinesim = this.cosinesim.bind(this);
    var wordVector = [];
    for (const key in wordVecs) {
      if (wordVecs.hasOwnProperty(key)) {
        const element = wordVecs[key];
        wordVector.push(element);
      }
    }
    var cluster = skmeans(wordVector, 12, null, null, this.cosinesim);
    console.log("cluster ", cluster);
    this.state = {
      topic: "",
      factChecker: "",
      keyWord: "",
      font: 30,
      frequencyRange: [1, 1000],
      frequencyMax:1000,
      maskData: null,
      hiddenBox: true,
      boxDim: null,
      tableData: null,
      cluster:cluster,
    };
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleCheckerChange = this.handleCheckerChange.bind(this);
    this.handleKeyWordChange = this.handleKeyWordChange.bind(this);
    this.handleFontChange = this.handleFontChange.bind(this);
    this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
    this.handleMaskFileChange = this.handleMaskFileChange.bind(this);
    this.showArticle = this.showArticle.bind(this);
    this.drawBox = this.drawBox.bind(this);
    this.clustercolor = this.clustercolor.bind(this);

    this.weightFactor = this.weightFactor.bind(this);
    
   


    
  }
  cosinesim(A, B) {
    var dotproduct = 0;
    var mA = 0;
    var mB = 0;
    for (var i = 0; i < A.length; i++) {
      dotproduct += A[i] * B[i];
      mA += A[i] * A[i];
      mB += B[i] * B[i];
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = (dotproduct / mA) * mB;
    return similarity;
  }

  handleMaskFileChange(event) {
    var url = window.URL.createObjectURL(event.target.files[0]);
    var img = new Image();
    img.src = url;
    var width = this.props.width;
    var height = this.props.height;
    var imageData;
    const changeState = this.setState.bind(this);
    img.onload = function readPixels() {
      window.URL.revokeObjectURL(url);

      const maskCanvas = document.createElement("canvas");

      maskCanvas.width = width;
      maskCanvas.height = height;
      var ctx = maskCanvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
      );

      imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

      for (var i = 0; i < imageData.data.length; i += 4) {
        var tone =
          imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
        var alpha = imageData.data[i + 3];

        if (alpha < 128 || tone > 128 * 3) {
          // Area not to draw
          imageData.data[i] = imageData.data[i + 1] = imageData.data[
            i + 2
          ] = 255;
          imageData.data[i + 3] = 0;
        } else {
          // Area to draw
          imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = 0;
          imageData.data[i + 3] = 255;
        }
      }
      changeState({ maskData: imageData });
    };
  }
  componentDidMount() {
    const csvFile = this.props.csvFile;
    this.filterData(csvFile).then((data) => {
      this.drawChart(data);
    });
  }

  handleTopicChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ topic: event.target.value }, () => {
      this.filterData(csvFile).then((data) => {
        this.drawChart(data);
      });
    });
  }
  handleCheckerChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ factChecker: event.target.value }, () => {
      this.filterData(csvFile).then((data) => {
        this.drawChart(data);
      });
    });
  }
  handleFontChange(event, value) {
    const csvFile = this.props.csvFile;
    this.setState({ font: value }, () => {
      this.filterData(csvFile).then((data) => {
        this.drawChart(data);
      });
    });
  }
  handleKeyWordChange(event) {
    const csvFile = this.props.csvFile;
    this.setState({ keyWord: event.target.value }, () => {
      this.filterData(csvFile).then((data) => {
        this.drawChart(data);
      });
    });
  }
  handleFrequencyChange(event, newValue) {
    const csvFile = this.props.csvFile;
    this.setState({ frequencyRange: newValue }, () => {
      this.filterData(csvFile).then((data) => {
        this.drawChart(data);
      });
    });
  }
  async filterData(csvFile) {
    let selectedTopic = this.state.topic;
    let factChecker = this.state.factChecker;
    let keyWord = this.state.keyWord;
    const dataRead = await d3.csv(csvFile);
    let counts = {};
    let info = {};
     var maxCount =1;
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
        var originUrl = d["Link to the original piece"].toString().trim();
        var factCheckedUrl = d["URL to fact-checked article (in your language)"]
          .toString()
          .trim();

        var letters = sentence.match(/\b[^\d\W]+\b/g);
      

        letters.forEach((l) => {
          let word = l.toLowerCase();
          if (stopwords.includes(word)) {
            return;
          }
          if (!counts[word]) {
            counts[word] = 1;
          } else {
            counts[word]++;
            if(counts[word]>maxCount){
              maxCount = counts[word];
            }
          }
          if (!info[word]) {
            info[word] = [];
            info[word].push([sentence, originUrl, factCheckedUrl]);
          } else {
            info[word].push([sentence, originUrl, factCheckedUrl]);
          }
        });
      }
    });

    var result = [];
    this.setState({frequencyMax:maxCount});
    var range = this.state.frequencyRange;
    Object.keys(counts).forEach(function (key) {
      if (counts[key] >= range[0] && counts[key] <= range[1]) {
        result.push([key, counts[key], info[key]]);
      }
    });

    return result;
  }
  color(word, weight, fontSize, distance, theta){
    var H = theta / (2*Math.PI ) *360;
    var s = 100;
    var l  =50;
    return 'hsl('+ H +','+s + '%,'+l +'%)';
  }
  clustercolor(word, weight, fontSize, distance, theta){
    var H = 360;
    var s = 100;
    var l  =50;
    if(typeof wordVecs[word]  !== "undefined"){
    
      var result = this.state.cluster.test(wordVecs[word],this.cosinesim);

      // var result = res.test(wordVecs["china"],this.cosinesim);
      var cluster = result.idx;
      var clusterNb = 12;
      H = ( 360/clusterNb +2 ) * cluster;
    };
   
    return 'hsl('+ H +','+s + '%,'+l +'%)';
  }
  changeCanvasBG(canvas, maskData) {
    if (maskData !== null) {
      var realctx = canvas.getContext("2d");
      var bctx = document.createElement("canvas").getContext("2d");

      bctx.fillStyle = this.props.backgroundColor || "#fff";
      bctx.fillRect(0, 0, 1, 1);
      var bgPixel = bctx.getImageData(0, 0, 1, 1).data;

      var newImageData = realctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      for (var i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i + 3] > 128) {
          // Area not to draw
          newImageData.data[i] = bgPixel[0];
          newImageData.data[i + 1] = bgPixel[1];
          newImageData.data[i + 2] = bgPixel[2];
          newImageData.data[i + 3] = bgPixel[3];
        } else {
          // Area to draw
          newImageData.data[i] = bgPixel[0];
          newImageData.data[i + 1] = bgPixel[1];
          newImageData.data[i + 2] = bgPixel[2];
          newImageData.data[i + 3] = bgPixel[3] ? bgPixel[3] - 1 : 0;
        }
      }
      realctx.putImageData(newImageData, 0, 0);

      realctx = bctx = bgPixel = newImageData = undefined;
    }
  }

  drawBox(item, dimension) {

    if (!dimension) {
      this.setState({hiddenBox:true});
      return;
    }


    this.setState({hiddenBox:false, boxDim:{
      left: dimension.x   + "px",
      top: dimension.y   + "px",
      width: dimension.w  + "px",
      height: dimension.h  + "px",
    }});

  }
  showArticle(item, dimension, event) {
    var array = [];
    item[2].forEach((element) => {
    array.push({ "Resume": element[0],"Origin Url":<a href={ element[1] } style={linkStyle} >{element[1]} </a>,"Fact-Check Url": <a href={ element[2] } style={linkStyle}>{element[2]}</a>
       });
    });
    this.setState({ tableData: array });
  }
  drawChart(data) {
    // var color = this.props.color;
    var backgroundColor = this.props.backgroundColor;
   data =  data.sort( function (a,b) {
    return   a[0].localeCompare(b[0]);
    });
    var options = {
      list: data,
      weightFactor: this.weightFactor,
      fontFamily: "Times, serif",
      color: this.clustercolor,
      rotateRatio: 0.5,
      rotationSteps: 2,
      shuffle:false,
      hover: this.drawBox,
      click: this.showArticle,
      clearCanvas: this.state.maskData !== null ? false : true,
      backgroundColor: backgroundColor,
    };

    var canvas = this.refs["my-canvas"];
    var maskImageData = this.state.maskData;
    this.changeCanvasBG(canvas, maskImageData);

    WordCloud(this.refs["my-canvas"], options);
  }
  weightFactor(wordCount){
    //normalizartion 
    var limit = this.state.frequencyRange;
    var min = limit[0];
    var max = limit[1];
    var fontsize = this.state.font;
    return ((wordCount-min )/(max-min))*(150-fontsize) +fontsize;
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
                  return (
                    <option key={key} value={e.value}>
                      {e.name}
                    </option>
                  );
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
                  return (
                    <option key={key} value={e.value}>
                      {e.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="slider" style={{ marginLeft: "10px" }}>
              <Typography id="discrete-slider-small-steps" gutterBottom>
                Font size
              </Typography>
              <Slider
                defaultValue={30}
                step={5}
                min={20}
                max={150}
                onChangeCommitted={this.handleFontChange}
                valueLabelDisplay="auto"
              />
            </div>

            <div
              className="slider"
              style={{ marginLeft: "20px", width: "280px" }}
            >
              <Typography id="range-slider" gutterBottom>
                Frequency range
              </Typography>
              <Slider
                value={this.state.frequencyRange}
                onChange={this.handleFrequencyChange}
                min={1}
                step={5}
                max={this.state.frequencyMax}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
              />
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center" ,height: "30px"}}  >
          <input type="file" onChange={this.handleMaskFileChange} height="40"></input>
        </div>
        <div style={styles}>
          <canvas
            ref="my-canvas"
            width={this.props.width + "px"}
            height={this.props.height + "px"}
          ></canvas>
          {this.state.hiddenBox===false?  <div id="box" style={this.state.boxDim} />:null}
         
          <div style={{verticalAlign:"middle"}}>

              <MDBTable scrollY   maxHeight={this.props.height+'px'} striped bordered>
                <MDBTableHead columns={Header}  color="primary-color" textWhite/>
               
                  <MDBTableBody rows={this.state.tableData} />
              </MDBTable>

          </div>
         
        </div>
      </div>
    );
  }
}

WordCloudChart.defaultProps = {
  color: "#f0f0c0",
  backgroundColor: "#001f00",
  width: 1000,
  height: 800,
  
};

export default WordCloudChart;
