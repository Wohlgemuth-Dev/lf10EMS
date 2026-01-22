import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DbService } from '../../services/db.service';
import { Skill } from '../../model/Skill';
import { CommonModule } from '@angular/common';
import { Employee } from '../../model/Employee';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, of } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';

interface SkillWithCount extends Skill {
  count: number;
  editing?: boolean;
  newName?: string;
}

@Component({
  selector: 'app-skill-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-management.component.html',
  styleUrls: ['./skill-management.component.css']
})
export class SkillManagementComponent implements OnInit {
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;
  skills$: Observable<SkillWithCount[]>;
  newSkillName: string = '';
  skillSearchText = new BehaviorSubject<string>('');

  constructor(private db: DbService) {
    this.skills$ = combineLatest([
      this.db.skills$,
      this.db.getEmployees(),
      this.skillSearchText
    ]).pipe(
      map(([skills, employees, searchText]) => {
        const skillsWithCount = skills.map(skill => ({
          ...skill,
          count: employees.filter(emp => emp.skillSet?.some(s => s.id === skill.id)).length
        }));

        const sortedSkills = [...skillsWithCount].sort((a, b) => (a.skill || '').localeCompare(b.skill || ''));

        if (!searchText) {
          return sortedSkills;
        }

        return sortedSkills.filter(skill =>
          skill.skill?.toLowerCase().includes(searchText.toLowerCase())
        );
      })
    );
  }

  ngOnInit(): void {
    this.db.fetchQualifications();
    this.db.fetchEmployees();
  }

  onSearchChange(searchText: string) {
    this.skillSearchText.next(searchText);
  }

  addSkill(): void {
    if (this.newSkillName.trim()) {
      this.db.createSkill(this.newSkillName.trim()).subscribe(() => {
        this.db.fetchQualifications();
        this.newSkillName = '';
      });
    }
  }

  deleteSkill(skill: SkillWithCount): void {
    if (skill.id !== undefined) {
      if (skill.count > 0) {
        if (!confirm(`The skill "${skill.skill}" is assigned to ${skill.count} employee(s). Are you sure you want to delete it? This will remove the skill from all assigned employees.`)) {
          return;
        }
      }

      this.db.getEmployeesBySkill(skill.id).pipe(
        take(1),
        switchMap(employeesToUpdate => {
          if (employeesToUpdate && employeesToUpdate.length > 0) {
            const updateObservables = employeesToUpdate.map(emp => {
              emp.skillSet = emp.skillSet?.filter(s => s.id !== skill.id);
              return this.db.updateEmployee(emp);
            });
            return forkJoin(updateObservables);
          }
          return of(null);
        }),
        switchMap(() => this.db.deleteSkill(skill.id))
      ).subscribe({
        next: () => {
          this.db.fetchEmployees();
          this.db.fetchQualifications();
        },
        error: (err) => console.error('Delete process failed', err)
      });
    }
  }

  toggleEdit(skill: SkillWithCount): void {
    // If there's a skill being edited, save it first.
    this.skills$.pipe(
        map(skills => skills.find(s => s.editing === true)),
    ).subscribe(editingSkill => {
        if (editingSkill) {
            this.updateSkill(editingSkill);
        }
    }).unsubscribe();

    skill.editing = true;
    skill.newName = skill.skill;

    setTimeout(() => {
        this.skills$.pipe(
            map(skills => skills.findIndex(s => s.id === skill.id))
        ).subscribe(index => {
            if (index > -1) {
                const inputElement = this.editInputs.toArray()[index];
                if (inputElement) {
                    inputElement.nativeElement.focus();
                }
            }
        });
    }, 0);
  }



  updateSkill(skill: SkillWithCount): void {
    if (skill.id !== undefined && skill.newName) {
      const updatedSkill: Skill = { id: skill.id, skill: skill.newName };
      this.db.updateSkill(updatedSkill).subscribe(() => {
        this.db.fetchQualifications();
        skill.editing = false;
      });
    }
  }
}
