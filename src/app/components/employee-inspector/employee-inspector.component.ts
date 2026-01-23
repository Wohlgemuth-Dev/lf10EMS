import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Employee } from "../../model/Employee";
import { DbService } from "../../services/db.service";
import { CommonModule } from "@angular/common";
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
  filteredSkills: Skill[] = [];
  isEditing: boolean = false;
  newSkillId: number | null = null;
  skillSearchText: string = '';
  dropdownSkills: Skill[] = [];
  showCreateSkill: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private db: DbService,
    private router: Router
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
            this.updateFilteredSkills();
            this.filterSkillsForDropdown();
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
    this.db.skills$.subscribe(skills => {
      this.availableSkills = skills;
      this.updateFilteredSkills();
      this.filterSkillsForDropdown();
      if (skills.length === 0) {
        this.db.fetchQualifications(); // Trigger fetch if empty
      }
    });
    this.db.fetchQualifications(); // Ensure they are fetched
  }

  @ViewChild('employeeForm') employeeForm!: NgForm;
  errorMessage: string | null = null;

  toggleEditMode() {
    this.errorMessage = null; // Reset error on action
    if (this.isEditing) {
      if (this.employeeForm && this.employeeForm.invalid) {
        this.employeeForm.form.markAllAsTouched();
        this.errorMessage = 'Please fill in all required fields correctly.';
        return;
      }

      if (this.employee.id) {
        this.db.updateEmployee(this.employee).subscribe({
          next: () => {
            this.isEditing = false;
          },
          error: (err) => {
            console.error('Update failed', err);
            this.errorMessage = err.error?.message || 'Failed to update employee';
          }
        });
      } else {
        this.db.createEmployee(this.employee).subscribe({
          next: (newEmployee) => {
            this.employee = newEmployee;
            this.isEditing = false;
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { id: newEmployee.id },
              queryParamsHandling: 'merge', // or 'preserve'
            });
          },
          error: (err) => {
            console.error('Create failed', err);
            this.errorMessage = err.error?.message || 'Failed to create employee';
          }
        });
      }
    } else {
      this.isEditing = true;
    }
  }

  handleSkillSearchEnter(event: any): void {
    event.preventDefault(); // Prevent form submission
    if (this.showCreateSkill) {
      this.createNewSkill();
    } else if (this.dropdownSkills.length > 0) {
      const topSkill = this.dropdownSkills[0];
      if (topSkill && topSkill.id) {
        this.addSkill(topSkill.id);
      }
    }
  }

  filterSkillsForDropdown(): void {
    if (!this.skillSearchText) {
      this.dropdownSkills = [...this.filteredSkills];
      this.showCreateSkill = false;
    } else {
      const searchTextLower = this.skillSearchText.toLowerCase();
      this.dropdownSkills = this.filteredSkills.filter(skill =>
        skill.skill && skill.skill.toLowerCase().includes(searchTextLower)
      );
      const exactMatch = this.availableSkills.some(s => s.skill?.toLowerCase() === searchTextLower);
      this.showCreateSkill = !exactMatch && this.skillSearchText.length > 0;
    }
  }

  updateFilteredSkills() {
    if (this.employee && this.employee.skillSet) {
      const assignedSkillIds = new Set(this.employee.skillSet.map(s => s.id));
      this.filteredSkills = this.availableSkills.filter(s => !assignedSkillIds.has(s.id));
    } else {
      this.filteredSkills = this.availableSkills;
    }
    this.filterSkillsForDropdown();
  }

  addSkill(skillId: number | undefined, skillToAdd?: Skill) {
    if (skillId && this.employee.id) {
      if (!skillToAdd) {
        skillToAdd = this.availableSkills.find(s => s.id == skillId);
      }

      if (skillToAdd && skillToAdd.skill) {
        this.db.addQualificationToEmployee(this.employee.id, skillToAdd.skill).subscribe(() => {
          // Refresh employee's qualifications
          this.db.getEmployeeQualifications(this.employee.id!).subscribe(skills => {
            this.employee.skillSet = skills;
            this.updateFilteredSkills();
            this.filterSkillsForDropdown();
          });
          this.db.fetchEmployees(); // to update the count in skill manager
        });
      }
      this.newSkillId = null;
      this.skillSearchText = '';
    }
  }

  createNewSkill() {
    if (this.skillSearchText) {
      const createAndAssignSkill = (employeeId: number) => {
        this.db.createSkill(this.skillSearchText).subscribe(newSkill => {
          this.db.fetchQualifications(); // Refresh the list of all skills
          this.addSkill(newSkill.id, newSkill);
          this.skillSearchText = '';
        });
      };

      if (this.employee.id) {
        createAndAssignSkill(this.employee.id);
      }
    }
  }

  deleteSkill(skillId: number | undefined) {
    if (!skillId || !this.employee.id) return;
    this.db.deleteQualificationFromEmployee(this.employee.id, skillId).subscribe(() => {
      if (this.employee.skillSet) {
        this.employee.skillSet = this.employee.skillSet.filter(s => s.id !== skillId);
        this.updateFilteredSkills();
        this.db.fetchEmployees();
      }
    });
  }
}
