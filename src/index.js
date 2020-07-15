import React from 'react';
import ReactDOM from 'react-dom';
import HbarChart from './components/HBarChart';
import './index.css';
import csvFile from "./components/CoronaVirusFacts.csv";
import WordCloudChart from './components/WordCloudChart';
import category from './config/category.json';
import organization from './config/organization.json';
class App extends React.Component {
  render() {
    return (
      <div>
        <HbarChart width={960} height={500} csvFile ={csvFile}  Category={category} Organization={organization}></HbarChart>
        <WordCloudChart csvFile={csvFile} Category={category} Organization={organization}></WordCloudChart>
      </div>
      
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);

