import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-success-dialog',
  imports: [MatDialogModule, MaterialModule],
  templateUrl: './success-dialog.html',
  styleUrl: './success-dialog.scss',
})
export class SuccessDialog {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);

  close() {
    this.dialogRef.close();
  }
}
