import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Microfinancier } from '../../core/models/microfinancier.model';
import { MicroFinancerService } from '../../core/services/micro-financer.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-microfinancier-component',
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './microfinancier-component.html',
  styleUrl: './microfinancier-component.scss',
})


export class MicrofinancierComponent implements OnInit {

  form!: FormGroup;
  editId: number | null = null;

  displayedColumns = ['name', 'brokerName', 'description', 'actions'];
  dataSource = new MatTableDataSource<Microfinancier>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private service: MicroFinancerService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      brokerName: ['', Validators.required],
      description: ['']
    });

    this.loadTable();
  }

  loadTable() {
    this.service.getAll().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  save() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.editId) {
      this.service.update(this.editId, payload).subscribe(() => {
        this.snack.open('Updated successfully', 'Close', { duration: 2000 });
        this.resetForm();
        this.loadTable();
      });
    } else {
      this.service.create(payload).subscribe(() => {
        this.snack.open('Created successfully', 'Close', { duration: 2000 });
        this.resetForm();
        this.loadTable();
      });
    }
  }

  edit(row: Microfinancier) {
    this.editId = row.id;
    this.form.patchValue(row);
  }

  delete(row: Microfinancier) {
    this.service.delete(row.id).subscribe(() => {
      this.snack.open('Deleted successfully', 'Close', { duration: 2000 });
      this.loadTable();
    });
  }

  resetForm() {
    this.form.reset();
    this.editId = null;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
}