import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { NameDialogComponent, NameDialogData } from './name-dialog.component';

@Component({
  standalone: true,
  selector: 'dialog-parent',
  templateUrl: 'dialog-parent.component.html',
  imports: [MatDialogModule],
})
export class DialogParentComponent implements OnInit {
  private nameDialogData: NameDialogData = { firstName: '', lastName: '' };

  constructor(private nameDialog: MatDialog) {}

  ngOnInit() {}

  openDialog(): void {
    //TODO: check if can omit content component?
    const nameDialogRef = this.nameDialog.open(NameDialogComponent, {
      // initial content data
      data: this.nameDialogData,
    });

    // observable that emits result value on dialog close
    nameDialogRef.afterClosed().subscribe((result) => {
      console.log('The nameDialog was closed');

      if (result) {
        // store inputs for dialog reopening
        this.nameDialogData = result;
      }
    });

    // close dialog programmatically
    // nameDialogRef.close('artificial result value');
  }
}
