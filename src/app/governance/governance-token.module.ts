import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GovernanceComponent} from './governance.component';
import {TokenERC20Component} from '../token/tokenERC20.component';
import {HelpComponent} from '../help/help.component';
import {TransactionComponent} from '../tx/transaction.component';
import {DialogComponent} from '../util/dialog.component';
import {UtilModule} from '../util/util.module';
import {RouterModule} from '@angular/router';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule, 
  MatSnackBarModule,
  MatExpansionModule,
  MatIconModule,
  MatDialogModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    RouterModule,
    UtilModule
  ],
  declarations: [GovernanceComponent, TokenERC20Component, HelpComponent, TransactionComponent, DialogComponent],
  exports: [GovernanceComponent, TokenERC20Component, HelpComponent, TransactionComponent],
  entryComponents: [DialogComponent]
})
export class GovernanceTokenModule {
}
