import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
const HelpButton = ()=> {
    const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
    return (
      <>
        {/* <Button variant="primary" onClick={handleShow}>
          Help
        </Button> */}
        <Nav.Link onClick={handleShow}> Help</Nav.Link>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Help</Modal.Title>
          </Modal.Header>
          <Modal.Body> <p> Historgamme : the chart show the number of fact-checks in each country. 
                By click the button on the top of the histograme, the histograme will be sort by value.  
                You can filtre it by choose whatever topic or organization you want or just enter the content.</p>
             <p>  WordCloud : We build a wordCloud to show the main words mentioned in all the articles, 
                 you can get more information at the table by click the word that you are interested in.  </p>
                        </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  
  export default HelpButton;