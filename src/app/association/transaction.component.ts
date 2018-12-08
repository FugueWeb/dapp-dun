import {Component, OnInit} from '@angular/core';
import {TxService} from '../util/transaction.service';
import { MatSnackBar } from '@angular/material';

declare let require: any;

@Component({
  selector: 'app-tx',
  templateUrl: './transaction.component.html'
})
export class TransactionComponent implements OnInit {

  txs: Array<any> = [];
  status = '';

  constructor(private txService: TxService, private matSnackBar: MatSnackBar) {
    console.log('Constructor: ' + txService);
  }

  ngOnInit(): void {
    this.watchTx();
  }

  watchTx() {
    this.txService.txObservable.subscribe((tx) => {
      this.txs.push(tx);
      console.log(tx);
    });
  }
}
