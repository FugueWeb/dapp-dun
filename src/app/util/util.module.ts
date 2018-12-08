import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Web3Service} from './web3.service';
import {TxService} from './transaction.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    Web3Service,
    TxService
  ],
  exports: [FormsModule, ReactiveFormsModule],
  declarations: []
})
export class UtilModule {
}
