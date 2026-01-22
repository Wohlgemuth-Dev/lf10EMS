import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import {CallbackComponent} from "./components/callback/callback.component";
import {EmployeeListComponent} from "./components/employee-list/employee-list.component";
import {HomeComponent} from "./components/home/home.component";
import {ImpressumComponent} from "./components/impressum/impressum.component";
import {EmployeesOverviewComponent} from "./components/employees-overview/employees-overview.component";
import {EmployeeInspectorComponent} from "./components/employee-inspector/employee-inspector.component";
import {SkillManagementComponent} from "./components/skill-management/skill-management.component";

export const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'callback', component: CallbackComponent },
  { path: 'employees', component: EmployeesOverviewComponent, canActivate: [authGuard]},
  { path: 'impressum', component: ImpressumComponent },
  { path: 'inspector', component: EmployeeInspectorComponent },
  { path: 'skills', component: SkillManagementComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
