import { Component, OnInit } from '@angular/core';
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
  filteredSkills$: Observable<Skill[]>;
  searchTerm$ = new BehaviorSubject<string>('');

  constructor(protected db: DbService) {
    this.filteredSkills$ = combineLatest([
      this.db.skills$,
      this.searchTerm$
    ]).pipe(
      map(([skills, term]) => {
        const lowerCaseTerm = term.toLowerCase();
        return skills.filter(skill =>
          skill.skill?.toLowerCase().includes(lowerCaseTerm)
        );
      })
    );
  }

  onSearchTermChanged(term: string) {
    this.searchTerm$.next(term);
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
