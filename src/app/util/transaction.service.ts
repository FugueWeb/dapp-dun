import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
declare let require: any;
declare let window: any;

@Injectable()
export class TxService {
  public txObservable = new Subject<string[]>();

  constructor() {

  }

  updateTx(tx) {
    this.txObservable.next(tx);
  }
}
