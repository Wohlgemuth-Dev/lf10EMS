import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {AuthService} from "./services/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title =  "lf10StarterNew";
  constructor(private router: Router, protected authService: AuthService) {
  }

  public routeToImpressum() : void{
    this.router.navigate(["/impressum"]);
  }
}
