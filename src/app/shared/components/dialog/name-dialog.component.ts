import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

export interface NameDialogData {
  firstName: string;
  lastName: string;
}

@Component({
  standalone: true,
  selector: 'name-dialog',
  templateUrl: 'name-dialog.component.html',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule],
})
export class NameDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<NameDialogComponent>,
    // inject data from parent into template
    @Inject(MAT_DIALOG_DATA) public data: NameDialogData
  ) {}

  ngOnInit() {}

  onTimeout() {
    this.dialogRef.close();
  }
}
