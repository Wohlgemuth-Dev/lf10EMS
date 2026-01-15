import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from "../../model/Employee";
import { Router } from "@angular/router";
import { DbService } from "../../services/db.service";
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  sortColumn: string = 'lastName';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortedEmployees$: Observable<Employee[]>;

  constructor(
    private router: Router,
    protected db: DbService
  ) {
    db.fetchEmployees();
    this.sortedEmployees$ = this.getSortedEmployees();
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortedEmployees$ = this.getSortedEmployees();
  }

  getSortedEmployees(): Observable<Employee[]> {
    return this.db.employees$.pipe(
      map(employees => {
        if (!employees) return [];
        return [...employees].sort((a, b) => {
          let valueA: string | number | undefined;
          let valueB: string | number | undefined;

          switch (this.sortColumn) {
            case 'lastName':
              valueA = `${a.lastName}, ${a.firstName}`.toLowerCase();
              valueB = `${b.lastName}, ${b.firstName}`.toLowerCase();
              break;
            case 'phone':
              valueA = a.phone?.toLowerCase();
              valueB = b.phone?.toLowerCase();
              break;
            default:
              valueA = (a as any)[this.sortColumn];
              valueB = (b as any)[this.sortColumn];
          }

          if (valueA === undefined) return 1;
          if (valueB === undefined) return -1;

          let comparison = 0;
          if (valueA < valueB) comparison = -1;
          if (valueA > valueB) comparison = 1;

          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
      })
    );
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up';
  }

  addEmployee() {
    const dummyEmployee: Employee = new Employee(
      undefined,
      'Mustermann',
      'HS',
      'Musterstraße 1',
      '12345',
      'Musterstadt',
      '+0123456789'
    );
    this.db.createEmployee(dummyEmployee)
  }

  deleteEmployee(id: number | undefined){
    this.db.deleteEmployee(id);
  }

  navigateToEmployeeInspector(id: number | undefined) {
    this.router.navigate(['/inspector'],
      {
        queryParams: {
          id: id
        }
      });
  }
}
