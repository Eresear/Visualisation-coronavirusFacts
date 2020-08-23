import React from "react";


import Papa from 'papaparse';
import './Blog.css';
class Blog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            lastestArticle:[],
            size:9,
        };

        this.sortData = this.sortData.bind(this);
    }
  
    // update(result){
    //     var newArticles = result.data.sort(function(a,b){
    //         // Turn your strings into dates, and then subtract them
    //         // to get a value that is either negative, positive, or zero.
    //         var date_a = a["When did you see the claim?"].toString().trim();
    //         var date_b = b["When did you see the claim?"].toString().trim();
    //         return new Date(date_b) - new Date(date_a);
    //       });


    //     this.setState({data: newArticles,lastestArticle:newArticles.slice(o,this.state.size) });

    // }
    componentWillMount() {
        this.getCsvData();
    }

    // fetchCsv() {
    //     return fetch('https://pudding.cool/misc/covid-fact-checker/data.csv').then(function (response) {
    //         let reader = response.body.getReader();
    //         let decoder = new TextDecoder('utf-8');

    //         return reader.read().then(function (result) {
    //             return decoder.decode(result.value);
    //         });
    //     });
    // }

    sortData(result) {
       
       result.data = result.data.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            var date_a = a["When did you see the claim?"].toString().trim();
            var date_b = b["When did you see the claim?"].toString().trim();
            return new Date(date_b) - new Date(date_a);
          });
        
        var lastestArticle =result.data.slice(0,this.state.size) ;

        this.setState({data: result.data,lastestArticle:lastestArticle });
          
    }

     getCsvData() {
        Papa.parse("https://pudding.cool/misc/covid-fact-checker/data.csv", {
            download:true,
            complete: this.sortData,
            header:true,
        });


    }

    render() {
        var stationsArr = []

        var id =1;
        this.state.lastestArticle.map(e =>{
            stationsArr.push( 
                <article key={id} className="col-xl-4 col-lg-4 col-md-12 col-sm-12  ifcn_misinformation type-ifcn_misinformation status-publish hentry covid_fact_checkers-maldita-es covid_rating-false user-has-not-earned">
                    <div className="post-container"  key={e["What did you fact-check?"]}>
                    <header className="entry-header">
                        <p className="entry-content__text">Fact-Checked by: {e["Organization"]}</p>
                        <a href={e["Link to the original piece"]} rel="bookmark" className="button entry-content__button entry-content__button--smaller">Link to the original piece</a>
                        <p className="entry-content__text"><strong>{e["When did you see the claim?"]} | {e["Countries"]}</strong></p>
                        
                        <h2 className="entry-title">
                            <a href={e["URL to fact-checked article (in your language)"]} rel="bookmark">
                                <span className="entry-title--red">{e["Final rating"]}:</span> {e["What did you fact-check?"]}</a>
                        </h2>
                    </header>
                    </div>
                    
                </article>
            
            );
            id +=1;
        });
            
        return (
            <div>
                <h3>Lastest articles   </h3>
               
                    <div className="post-wrapper container">
                        {stationsArr}
                    </div>
           
            </div>
             
        );
    }
    

}



export default Blog;