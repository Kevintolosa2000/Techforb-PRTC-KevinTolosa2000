import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent {

  registerForm: FormGroup;
  usernameErrorMessage: string = '';
  emailErrorMessage: string = '';
  isPasswordVisible: boolean = false;

  constructor(private formBuilder: FormBuilder, private userDataService: UserDataService, private router: Router) {

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^(?!\s*$).+/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordsMatchValidator });


    this.registerForm.get('username')?.valueChanges.subscribe(() => {
      this.usernameErrorMessage = '';
    });

    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      this.emailErrorMessage = '';
    });
  }

  passwordsMatchValidator: ValidatorFn = (form: AbstractControl) => {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  register() {

    let errorMessage = '';

    if (this.registerForm.valid) {
      this.userDataService.register(this.registerForm.value).subscribe(
        (response) => {
          this.registerForm.reset();
          const modal = new bootstrap.Modal(document.getElementById('staticBackdrop')!);
          modal.show();

        },
        (error) => {
          if (error.status === 409) {
            const message = error.error?.message || '';
            if (message.includes('usuario') && !this.usernameErrorMessage) {
              this.usernameErrorMessage = message;
            } else if (message.includes('correo') && !this.emailErrorMessage) {
              this.emailErrorMessage = message;
            }
          }
        }
      );
    }
  }

  navigateToLogin() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('staticBackdrop')!);
    modal?.hide();

    this.router.navigate(['/login']);
  }

}
