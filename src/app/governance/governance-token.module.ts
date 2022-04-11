import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GovernanceComponent} from './governance.component';
import {TokenERC20Component} from '../token/tokenERC20.component';
import {HelpComponent} from '../help/help.component';
import {TransactionComponent} from '../tx/transaction.component';
import {DialogComponent} from '../util/dialog.component';
import {UtilModule} from '../util/util.module';
import {RouterModule} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatExpansionModule} from '@angular/material/expansion';
//import {MatButtonToggleModule} from '@angular/material/button-toggle';
// import {MatRippleModule} from '@angular/material/core';
// import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSortModule} from '@angular/material/sort';
// import {
//   MatButtonModule,
//   MatCardModule,
//   MatFormFieldModule,
//   MatInputModule,
//   MatOptionModule,
//   MatSelectModule, 
//   MatSnackBarModule,
//   MatExpansionModule,
//   MatIconModule,
//   MatDialogModule
// } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    // AppMaterialModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    //MatOptionModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    RouterModule,
    UtilModule
  ],
  declarations: [GovernanceComponent, TokenERC20Component, HelpComponent, TransactionComponent, DialogComponent],
  exports: [
    GovernanceComponent, 
    TokenERC20Component, 
    HelpComponent, 
    TransactionComponent,
    MatCardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    //MatButtonToggleModule,
    MatIconModule,
    //MatRippleModule,
    //MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule
  ],
  entryComponents: [DialogComponent]
})
export class GovernanceTokenModule {
}
