import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isPasswordVisible: boolean = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder, private userDataService: UserDataService, private router: Router, private cookieService: CookieService) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });

  }

  ngOnInit(): void {

    this.cookieService.delete('user');
   }

  togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      passwordInput.type = this.isPasswordVisible ? 'text' : 'password';
  }

  login() {

    if (this.loginForm.valid) {
      this.userDataService.login(this.loginForm.value).subscribe(
        (response) => {
          if (response && response.status === 200) {
            const user = response.body;
            this.cookieService.set('user', JSON.stringify(user));
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = '* Usuario o contraseña incorrectos';
          }
        },
        (error) => {
          if (error.status === 401) {
            this.errorMessage = '* Usuario o contraseña incorrectos';
          } else {
            this.errorMessage = '* Usuario inexistente, por favor registrese';
          }
        }
      );
    }
  }

  
}