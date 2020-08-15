import React from 'react';
import ReactDOM from 'react-dom';
import HbarChart from './components/HBarChart';
import './index.css';
// import csvFile from "./components/CoronaVirusFacts.csv";
import csvFile from "./components/data.csv";
import WordCloudChart from './components/WordCloudChart';
import category from './config/category.json';
import organization from './config/organization.json';
import Blog from './components/Blog';
import Test from './components/Test';
class App extends React.Component {
  render() {
    return (
      <div >
        <Blog></Blog>
        <HbarChart width={960} height={2000} csvFile ={csvFile}  Category={category} Organization={organization}></HbarChart>
        <WordCloudChart csvFile={csvFile} Category={category} Organization={organization}  ></WordCloudChart>

      </div>
      
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);

