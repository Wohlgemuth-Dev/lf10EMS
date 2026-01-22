import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DbService} from "../../services/db.service";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {BehaviorSubject, combineLatest, map, Observable} from "rxjs";
import {Skill} from "../../model/Skill";

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  skillSearchText = new BehaviorSubject<string>('');
  filteredSkills$: Observable<Skill[]>;

  constructor(protected db: DbService) {
    db.fetchQualifications();

    this.filteredSkills$ = combineLatest([
      this.db.skills$,
      this.skillSearchText
    ]).pipe(
      map(([skills, searchText]) => {
        const sortedSkills = [...skills].sort((a, b) => (a.skill || '').localeCompare(b.skill || ''));

        if (!searchText) {
          return sortedSkills;
        }
        return sortedSkills.filter(skill =>
          skill.skill?.toLowerCase().includes(searchText.toLowerCase())
        );
      })
    );
  }

  onSearchChange(searchText: string) {
    this.skillSearchText.next(searchText);
  }

  onToggle(skillId: number | undefined, event: Event)
  {
    if (skillId == null)
    {
      return;
    }
    const checked = (event.target as HTMLInputElement).checked;
    this.db.toggleSkillFilter(skillId, checked);
  }

}
