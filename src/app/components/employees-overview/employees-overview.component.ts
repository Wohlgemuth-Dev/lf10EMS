import { Component } from '@angular/core';
import {EmployeeListComponent} from "../employee-list/employee-list.component";
import {FilterComponent} from "../filter/filter.component";

@Component({
  selector: 'app-employees-overview',
  standalone: true,
  imports: [
    EmployeeListComponent,
    FilterComponent
  ],
  templateUrl: './employees-overview.component.html',
  styleUrl: './employees-overview.component.css'
})
export class EmployeesOverviewComponent {

}
