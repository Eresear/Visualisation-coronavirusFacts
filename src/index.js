import React from 'react';
import ReactDOM from 'react-dom';
import HbarChart from './components/HBarChart';
import './index.css';
import csvFile from "./components/CoronaVirusFacts.csv";

class App extends React.Component {
  render() {
    return (
      <div>
        <HbarChart width={960} height={500} csvFile ={csvFile} ></HbarChart>
      </div>
      
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);

