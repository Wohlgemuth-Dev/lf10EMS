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
}
