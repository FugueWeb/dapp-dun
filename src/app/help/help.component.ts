import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import { DialogComponent } from '../util/dialog.component';

declare let require: any;
const dialog_data = require('../governance/info.json');

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
    displayedColumns: string[] = ['readCol', 'callCol', 'consensusCol'];

  constructor(private dialog: MatDialog) {
    
  }

  ngOnInit(): void {
  }

    openDialog(index): void {
        let choice;
        for (let i = 0; i < dialog_data.length; i++) {
            if(dialog_data[i].id === index) {
                choice = dialog_data[i];
            }
        }

        this.dialog.open(DialogComponent, {
            width: '400px',
            data: {id: choice.id, desc: choice.desc}
        });
    }
}
