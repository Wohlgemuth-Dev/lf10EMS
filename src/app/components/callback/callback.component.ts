import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: '<p>Processing login...</p>',
})
export class CallbackComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dbService: DbService
  ) {}

  async ngOnInit() {
    const success = await this.authService.handleCallback();

    if (success) {
      this.dbService.fetchEmployees();
      this.dbService.fetchQualifications();
      this.router.navigate(['/employees']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
