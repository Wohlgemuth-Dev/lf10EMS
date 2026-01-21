import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from "../../model/Employee";
import { Router } from "@angular/router";
import { DbService } from "../../services/db.service";
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

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
    return combineLatest([this.db.employees$, this.db.selectedSkillIds$]).pipe(
      map(([employees, selectedSkillIds]) => {
        const filtered = (employees ?? []).filter(e => this.matchesSkillFilter(e, selectedSkillIds)); //zeigt nur gefilterte an

        return [...filtered].sort((a, b) => {
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
    this.router.navigate(['/inspector']);
  }

  deleteEmployee(id: number | undefined) {
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

  private matchesSkillFilter(emp: Employee, selectedIds: number[]): boolean {
    if (!selectedIds.length) //Damit nur gefiltert wird, wenn was angeklickt ist
    {
      return true; //true = zeig alle an
    }

    //holt sich die skill ids, wenns ein skillobject ist dann s.id
    const empSkillIds = (emp as any).skillSet ?? [];
    const ids: number[] = empSkillIds
      .map((s: any) => typeof s === 'object' ? s.id : s)
      .filter((x: any) => typeof x === 'number');

    //zeigt alle an bei denen alle ausgewählten skills zutreffen
    return selectedIds.every(id => ids.includes(id));

  }

}
