import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pay-confirm-dialog-component',
  imports: [MaterialModule, CommonModule],
  templateUrl: './pay-confirm-dialog-component.html',
  styleUrl: './pay-confirm-dialog-component.scss',
})
export class PayConfirmDialogComponent {
  constructor(
    private ref: MatDialogRef<PayConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  close(result: boolean) {
    this.ref.close(result);
  }
}
