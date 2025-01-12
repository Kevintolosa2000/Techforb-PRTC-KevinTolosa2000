import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {

  constructor(private router: Router, private cookieService: CookieService) { }

  logout() {
    this.cookieService.delete('user');
    this.router.navigate(['/login']);
  }

}
