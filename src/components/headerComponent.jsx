import React, {Component} from 'react';
import './style.css';

export default class HeaderComponent extends Component{
  render(){
    return(

      <header>

          <h1> INVOICE </h1>        
          <address>
            <p> MAHESH NANDENNAGARI </p>
            <p> #429, First Floor </p>
            <p> Bettadasanapura </p>
            <p> +918660876889 </p>
          </address>

          <span>
            <img alt="MAHESH" src="https://logos.textgiraffe.com/logos/logo-name/Mahesh-designstyle-smoothie-m.png" className="rounded float-right align-top" />          
          </span>
                  
      </header>
    )
  }
}
