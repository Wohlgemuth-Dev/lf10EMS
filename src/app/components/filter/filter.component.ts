import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DbService} from "../../services/db.service";

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  constructor(protected db: DbService) {
    db.fetchQualifications()
  }

  onToggle(skillId: number | undefined, event: Event)
  {
    if (skillId == null)
    {
      return;
    }
    const checked = (event.target as HTMLInputElement).checked; //Den status von der Html box in boolean speichern
    this.db.toggleSkillFilter(skillId, checked);
  }

}
