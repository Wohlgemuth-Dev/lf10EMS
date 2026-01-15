import { Injectable } from '@angular/core';
import { Employee } from "../model/Employee";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "./auth.service";
import {BehaviorSubject, Observable, of} from "rxjs";
import { Router } from "@angular/router";
import { Skill } from "../model/Skill";

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable(); //employees als Observable um immer die gleichen zu lesen
  private selectedSkillIdsSubject = new BehaviorSubject<number[]>([]); //Behavioursubject speichert die selected skills ein
  public selectedSkillIds$ = this.selectedSkillIdsSubject.asObservable(); //lesbare version des BehaviourSubjects als observable für htmls


  public skills$: Observable<Skill[]>
  private token: string | string[];

  constructor(
    private http: HttpClient,
    protected authService: AuthService,
  ) {
    this.skills$ = of([]);
    this.token = this.authService.getAccessToken();
  }

  fetchEmployees() {
    this.http.get<Employee[]>('http://localhost:8089/employees', {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
    }).subscribe(list => this.employeesSubject.next(list));
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
    }).subscribe({
      next: () => this.fetchEmployees(),
      error: (err: Error) => console.error('Delete failed', err)
    });
  }

  deleteEmployee(id: number | undefined) {
    if (id == null) return;

    this.token = this.authService.getAccessToken();

    console.log(id)
    this.http.delete(`http://localhost:8089/employees/${id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).subscribe({
      next: () => this.fetchEmployees(),
      error: (err: Error) => console.error('Delete failed', err)
    });
  }

  fetchQualifications() {
    this.skills$ = this.http.get<Skill[]>('http://localhost:8089/qualifications', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    });
  }

  toggleSkillFilter(skillId: number, checked: boolean) {
    const current = this.selectedSkillIdsSubject.value; //holen uns die derzeitigen Filterstand

    const next = checked //wenn checked true ist wird der Skill hinzugefügt, wenn falls dann wird er rausgeschmissen
      ? Array.from(new Set([...current, skillId]))
      : current.filter(id => id !== skillId);

    this.selectedSkillIdsSubject.next(next); //neuen zustand speichern
  }
}
