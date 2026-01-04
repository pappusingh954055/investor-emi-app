import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-error-dialog',
  imports: [MatDialogModule, MaterialModule],
  templateUrl: './error-dialog.html',
  styleUrl: './error-dialog.scss',
})
export class ErrorDialog {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);

  close() {
    this.dialogRef.close();
  }
}