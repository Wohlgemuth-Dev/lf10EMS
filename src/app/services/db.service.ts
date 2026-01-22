import { Injectable } from '@angular/core';
import { Employee } from "../model/Employee";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { Skill } from "../model/Skill";
import { map, tap } from 'rxjs/operators';

interface SkillEmployeesResponse {
  qualification: Skill;
  employees: Employee[];
}

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable(); //employees als Observable um immer die gleichen zu lesen
  private selectedSkillIdsSubject = new BehaviorSubject<number[]>([]); //Behavioursubject speichert die selected skills ein
  public selectedSkillIds$ = this.selectedSkillIdsSubject.asObservable(); //lesbare version des BehaviourSubjects als observable für htmls

  private skillsSubject = new BehaviorSubject<Skill[]>([]);
  public skills$ = this.skillsSubject.asObservable();
  private token: string | string[];

  constructor(
    private http: HttpClient,
    protected authService: AuthService,
  ) {
    this.token = this.authService.getAccessToken();
  }

  getEmployees(): Observable<Employee[]> {
    return this.employees$;
  }

  fetchEmployees() {
    this.http.get<Employee[]>('http://localhost:8089/employees', {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
    }).subscribe(list => {
      list.forEach(emp => {
        if (emp.skillSet) {
          emp.skillSet.sort((a, b) => (a.skill || '').localeCompare(b.skill || ''));
        }
      });
      this.employeesSubject.next(list);
    });
  }

  getEmployee(id: number): Observable<Employee> {
    this.token = this.authService.getAccessToken();
    return this.http.get<Employee>(`http://localhost:8089/employees/${id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).pipe(
      tap(employee => {
        if (employee && employee.skillSet) {
          employee.skillSet.sort((a, b) => (a.skill || '').localeCompare(b.skill || ''));
        }
      })
    );
  }

  getEmployeesBySkill(skillId: number): Observable<Employee[]> {
    this.token = this.authService.getAccessToken();
    return this.http.get<SkillEmployeesResponse>(`http://localhost:8089/qualifications/${skillId}/employees`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).pipe(
      map(response => response.employees)
    );
  }

  createEmployee(employee: Employee): Observable<Employee> {
    this.token = this.authService.getAccessToken();
    const payload: any = { ...employee };
    if (employee.skillSet) {
      payload.skillSet = employee.skillSet.map(s => s.id);
    }

    return this.http.post<Employee>('http://localhost:8089/employees', payload, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).pipe(
      tap(() => this.fetchEmployees())
    );
  }

  updateEmployee(employee: Employee): Observable<any> {
    this.token = this.authService.getAccessToken();
    const payload: any = { ...employee };
    if (employee.skillSet) {
      payload.skillSet = employee.skillSet.map(s => s.id);
    }

    return this.http.put(`http://localhost:8089/employees/${employee.id}`, payload, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).pipe(
      tap(() => this.fetchEmployees())
    );
  }

  deleteEmployee(id: number | undefined) {
    if (id == null) return;

    this.token = this.authService.getAccessToken();

    this.http.delete(`http://localhost:8089/employees/${id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).subscribe({
      next: () => this.fetchEmployees(),
      error: (err: Error) => console.error('Delete failed', err)
    });
  }

  deleteSkill(id: number | undefined): Observable<any> {
    if (id == null) return of(null);

    this.token = this.authService.getAccessToken();

    return this.http.delete(`http://localhost:8089/qualifications/${id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).pipe(
      tap(() => this.fetchQualifications())
    );
  }

  updateSkill(skill: Skill): Observable<Skill> {
    this.token = this.authService.getAccessToken();
    return this.http.put<Skill>(`http://localhost:8089/qualifications/${skill.id}`, skill, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    });
  }

  fetchQualifications() {
    this.http.get<Skill[]>('http://localhost:8089/qualifications', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`)
    }).subscribe(skills => {
      skills.sort((a, b) => (a.skill || '').localeCompare(b.skill || ''));
      this.skillsSubject.next(skills)
    });
  }

  createSkill(skillName: string): Observable<Skill> {
    this.token = this.authService.getAccessToken();
    return this.http.post<Skill>('http://localhost:8089/qualifications', { skill: skillName }, {
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
