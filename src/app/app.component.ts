import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink, RouterOutlet, ActivatedRoute, NavigationEnd} from "@angular/router";
import {AuthService} from "./services/auth.service";
import {DbService} from "./services/db.service";
import {HttpClient} from "@angular/common/http";
import {forkJoin, of} from "rxjs";
import {catchError, filter, map, switchMap, take} from "rxjs/operators";
import {Skill} from "./model/Skill";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('navbar') navbar!: ElementRef;
  showGenerateDataButton = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    protected authService: AuthService,
    private dbService: DbService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const queryParams = this.activatedRoute.snapshot.queryParams;
      const isAdmin = queryParams['admin'] === 'true';
      const isEmployeesPage = event.urlAfterRedirects.startsWith('/employees');
      this.showGenerateDataButton = isAdmin && isEmployeesPage;
    });
  }

  ngAfterViewInit() {
    this.updateNavbarHeight();
    new ResizeObserver(() => this.updateNavbarHeight()).observe(this.navbar.nativeElement);
  }

  updateNavbarHeight() {
    const navbarHeight = this.navbar.nativeElement.offsetHeight;
    document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
    this.cdr.detectChanges();
  }

  generateSampleData() {
    this.http.get<any>('assets/sampleData.json').pipe(
      switchMap(data => {
        const employees = data.employees;
        const skillsFromFile: string[] = [...new Set(employees.flatMap((emp: any) => emp.skillSet.map((s: any) => s.skill))) as Set<string>];

        return this.dbService.skills$.pipe(
          take(1), // Ensure this subscription runs only once
          switchMap(existingSkills => {
            const existingSkillNames = new Set(existingSkills.map(s => s.skill));
            const skillsToCreate = skillsFromFile.filter(skillName => !existingSkillNames.has(skillName));

            const skillObservables = skillsToCreate.map(skillName =>
              this.dbService.createSkill(skillName).pipe(
                catchError(error => {
                  console.error(`Failed to create skill: ${skillName}`, error);
                  return of(null); // Continue even if one skill fails
                })
              )
            );

            return forkJoin(skillObservables).pipe(
              switchMap(createdSkills => {
                const allSkills = [...existingSkills, ...createdSkills.filter((s): s is Skill => s !== null)];
                const skillMap = new Map(allSkills.map(s => [s.skill, s.id]));

                const employeeObservables = employees.map((employeeData: any) => {
                  const { id, ...employeeWithoutId } = employeeData;
                  const skillIds = employeeData.skillSet.map((s: any) => skillMap.get(s.skill)).filter((id: any) => id != null);
                  const newEmployee = { ...employeeWithoutId, skillSet: skillIds };
                  return this.dbService.createEmployee(newEmployee).pipe(
                    catchError(error => {
                      console.error(`Failed to create employee: ${employeeData.firstName} ${employeeData.lastName}`, error);
                      return of(null); // Continue even if one employee fails
                    })
                  );
                });

                return forkJoin(employeeObservables);
              })
            );
          })
        )
      })
    ).subscribe({
      next: () => {
        console.log('Sample data generated successfully.');
        this.dbService.fetchEmployees(); // Refresh the list
        this.dbService.fetchQualifications();
      },
      error: err => console.error('Error generating sample data', err)
    });
  }
}
