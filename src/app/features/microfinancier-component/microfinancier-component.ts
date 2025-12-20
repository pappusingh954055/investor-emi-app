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
// export class MicrofinancierComponent implements OnInit {

//   form!: FormGroup;
//   editId: number | null = null;

//   displayedColumns = ['name', 'brokerName', 'description', 'actions'];
//   dataSource = new MatTableDataSource<Microfinancier>([]);

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;

//   /** 🔹 TEMP DATA (API will replace this) */
//   private mockData: Microfinancier[] = [
//     { id: 1, name: 'Abc', brokerName: 'Baba 1', description: 'Parsa', isActive: true },
//     { id: 2, name: 'Xyz', brokerName: 'Baba 2', description: 'Sonoho', isActive: true }
//   ];

//   constructor(private fb: FormBuilder) { }

//   ngOnInit(): void {
//     this.form = this.fb.group({
//       name: ['', Validators.required],
//       brokerName: ['', Validators.required],
//       description: ['']
//     });

//     this.loadTable();
//   }

//   loadTable() {
//     this.dataSource.data = this.mockData;
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }

//   save() {
//     if (this.form.invalid) return;

//     if (this.editId) {
//       const index = this.mockData.findIndex(x => x.id === this.editId);
//       this.mockData[index] = {
//         ...this.mockData[index],
//         ...this.form.value
//       };
//     } else {
//       this.mockData.push({
//         id: Date.now(),
//         ...this.form.value,
//         createdDate: new Date().toISOString(),
//         isActive: true
//       });
//     }

//     this.resetForm();
//     this.loadTable();
//   }

//   edit(row: Microfinancier) {
//     this.editId = row.id;
//     this.form.patchValue(row);
//   }

//   delete(row: Microfinancier) {
//     this.mockData = this.mockData.filter(x => x.id !== row.id);
//     this.loadTable();
//   }

//   resetForm() {
//     this.form.reset();
//     this.editId = null;
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();
//   }
// }

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