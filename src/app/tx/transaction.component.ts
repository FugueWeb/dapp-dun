import {Component, OnInit} from '@angular/core';
import {TxService} from '../util/transaction.service';
import { MatSnackBar } from '@angular/material/snack-bar';

declare let require: any;

@Component({
  selector: 'app-tx',
  templateUrl: './transaction.component.html'
})
export class TransactionComponent implements OnInit {

  txs: Array<string> = [];
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
    });
  }
}
