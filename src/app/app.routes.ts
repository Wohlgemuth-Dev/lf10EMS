import { Routes } from '@angular/router';import { authGuard } from './guards/auth.guard';
import {CallbackComponent} from "./components/callback/callback.component";
import {EmployeeListComponent} from "./components/employee-list/employee-list.component";
import {AppComponent} from "./app.component";

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
