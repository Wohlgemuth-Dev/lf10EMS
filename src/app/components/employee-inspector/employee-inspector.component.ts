import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Employee } from "../../model/Employee";
import { DbService } from "../../services/db.service";
import { filter, switchMap } from "rxjs";
import { CommonModule } from "@angular/common";
import { map } from "rxjs/operators";
import { FormsModule, NgForm } from "@angular/forms";
import { Skill } from "../../model/Skill";

@Component({
  selector: 'app-employee-inspector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './employee-inspector.component.html',
  styleUrl: './employee-inspector.component.css'
})
export class EmployeeInspectorComponent implements OnInit {
  employee: Employee = new Employee();
  availableSkills: Skill[] = [];
  isEditing: boolean = false;
  newSkillId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private db: DbService
  ) { }

  ngOnInit(): void {
    // Load employee
    this.route.queryParamMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        if (!isNaN(id)) {
          this.db.getEmployee(id).subscribe(emp => {
            this.employee = emp;
            if (!this.employee.skillSet) this.employee.skillSet = [];
          });
          return;
        }
      }
      // No ID or invalid ID -> New Employee Mode
      this.isEditing = true;
      this.employee = new Employee();
      this.employee.skillSet = [];
    });

    // Load available skills
    this.db.skills$.subscribe(skills => { // skills$ is an Observable in DbService
      if (skills.length === 0) {
        this.db.fetchQualifications(); // Trigger fetch if empty
      }
    });
    // Subscribe again to get the data (or just use the observable in template, but we need it for logic)
    this.db.skills$.subscribe(skills => this.availableSkills = skills);
    this.db.fetchQualifications(); // Ensure they are fetched
  }

  toggleEditMode() {
    if (this.isEditing) {
      // Save changes
      if (this.employee.id) {
        this.db.updateEmployee(this.employee);
      } else {
        this.db.createEmployee(this.employee);

      }
      // Optionally navigate back or stay?
      // For now, let's keep editing mode off after save?
      // But db calls are async. Ideally we wait. 
      // Given the current service implementation (void return on methods, subscription inside), we can't easily wait here without changing service.
      // But DbService fetches employees after update using subscribe.

      // We will assume success for UI toggle, or better:
      // If we are creating new, we should probably navigate back to list or reload with ID?
      // Let's just toggle isEditing off.
    }
    this.isEditing = !this.isEditing;
  }

  addSkill() {
    if (this.newSkillId) {
      const skillToAdd = this.availableSkills.find(s => s.id == this.newSkillId);
      if (skillToAdd) {
        if (!this.employee.skillSet) {
          this.employee.skillSet = [];
        }
        // Check if already exists
        if (!this.employee.skillSet.some(s => s.id === skillToAdd.id)) {
          this.employee.skillSet.push(skillToAdd);
        }
      }
      this.newSkillId = null;
    }
  }

  deleteSkill(skillId: number | undefined) {
    if (!skillId) return;
    if (this.employee.skillSet) {
      this.employee.skillSet = this.employee.skillSet.filter(s => s.id !== skillId);
    }
  }
}
