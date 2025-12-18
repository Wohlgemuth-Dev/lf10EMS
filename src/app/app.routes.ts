import { Routes } from '@angular/router';import { authGuard } from './guards/auth.guard';
import {CallbackComponent} from "./components/callback/callback.component";
import {EmployeeListComponent} from "./components/employee-list/employee-list.component";
import {AppComponent} from "./app.component";
import {LoginViewComponent} from "./components/login-view/login-view.component";

export const routes: Routes = [
  { path: '', component: LoginViewComponent},
  { path: 'app', component: AppComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'app' }
];
