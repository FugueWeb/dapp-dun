import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AssociationComponent} from './association.component';
import {TokenERC20Component} from './tokenERC20.component';
import {HelpComponent} from './help.component';
import {TransactionComponent} from './transaction.component';
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
  declarations: [AssociationComponent, TokenERC20Component, HelpComponent, TransactionComponent, DialogComponent],
  exports: [AssociationComponent, TokenERC20Component, HelpComponent, TransactionComponent],
  entryComponents: [DialogComponent]
})
export class AssociationTokenModule {
}
