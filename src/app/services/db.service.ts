import { Injectable } from '@angular/core';
import { Employee } from "../model/Employee";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { Skill } from "../model/Skill";

@Injectable({
  providedIn: 'root'
})
export class DbService {
  public employees$: Observable<Employee[]>
  public skills$: Observable<Skill[]>
  private token: string | string[];

  constructor(
    private http: HttpClient,
    protected authService: AuthService,
  ) {
    this.employees$ = of([]);
    this.skills$ = of([]);
    this.token = this.authService.getAccessToken();
  }

  fetchEmployees() {
    this.token = this.authService.getAccessToken();

    this.employees$ = this.http.get<Employee[]>('http://localhost:8089/employees', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    });
  }

  getEmployee(id: number): Observable<Employee> {
    this.token = this.authService.getAccessToken();
    return this.http.get<Employee>(`http://localhost:8089/employees/${id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    })

  }

  createEmployee(employee: Employee) {
    this.token = this.authService.getAccessToken();

    this.http.post('http://localhost:8089/employees', employee, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).subscribe();
  }

  deleteEmployee(id: number | undefined) {
    this.token = this.authService.getAccessToken();

    console.log(id)
    this.http.delete(`http://localhost:8089/employees/${id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    })
  }

  fetchQualifications() {
    this.skills$ = this.http.get<Skill[]>('http://localhost:8089/qualifications', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    });
  }
}
