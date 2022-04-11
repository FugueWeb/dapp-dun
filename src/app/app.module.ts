import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { GovernanceTokenModule } from './governance/governance-token.module';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    BrowserModule,
    //FormsModule,
    //HttpClientModule,
    GovernanceTokenModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }