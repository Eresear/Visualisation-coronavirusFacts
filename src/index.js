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
import Logo from './image/logo.png';
import ScrollableAnchor from 'react-scrollable-anchor';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Help from './components/HelpButton';

class App extends React.Component {
  render() {
    return (
      <div >
         
      
    
        <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">
            <img
              alt=""
              src={Logo}
              className="d-inline-block align-top"
            />{' '}
          </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#histogramme">Histogramme</Nav.Link>
            <Nav.Link href="#wordcloud">Wordcloud</Nav.Link>
            <Help></Help>
          </Nav>
        </Navbar.Collapse>
      </Navbar>


        <Blog></Blog>
       
        <ScrollableAnchor id={'histogramme'}>
          <HbarChart width={960} height={2000} csvFile ={csvFile}  Category={category} Organization={organization}></HbarChart>
        </ScrollableAnchor>
{/*         
        <ScrollableAnchor id={'wordcloud'}>
          <WordCloudChart csvFile={csvFile} Category={category} Organization={organization}  ></WordCloudChart>
        </ScrollableAnchor> */}

        

      </div>
      
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);

