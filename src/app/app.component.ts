import { Component } from '@angular/core';
import {Web3Service} from './util/web3.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private web3Service: Web3Service) {
  }

  onboardMetamask(){
      this.web3Service.onboardMetamask();
  }
}
