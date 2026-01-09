import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Employee} from "../../model/Employee";
import {DbService} from "../../services/db.service";
import {filter, switchMap} from "rxjs";
import {CommonModule} from "@angular/common";
import {map} from "rxjs/operators";
@Component({
  selector: 'app-employee-inspector',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './employee-inspector.component.html',
  styleUrl: './employee-inspector.component.css'
})
export class EmployeeInspectorComponent implements OnInit{
  employee!: Record<string, any>;
  constructor(
    private route: ActivatedRoute,
    private db: DbService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !isNaN(id)),
        switchMap(id => this.db.getEmployee(id)),
        map(emp => this.convertEmployee(emp))
      )
      .subscribe(empObj => {
        this.employee = empObj; // assign converted object for template
      });
  }

  private convertEmployee(emp: Employee): Record<string, any> {
    // Convert skillSet array to comma-separated string
    const converted: Record<string, any> = { ...emp };
    if (emp.skillSet) {
      converted['skillSet'] = emp.skillSet.join(', ');
    }
    return converted;
  }
}
