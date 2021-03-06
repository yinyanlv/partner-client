import { Component, OnInit, Renderer2, ViewChild, ElementRef} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {CustomValidators} from 'ng2-validation';

import {RegisterService} from './register.service';
import {USERNAME_REGEX, EMAIL_REGEX} from '../shared/etc/regex';

let password = new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
let confirmPassword = new FormControl(null, CustomValidators.equalTo(password));

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  isSubmitting: boolean;
  isShowError: boolean = false;
  errorMessage: string = '';
  form: FormGroup;

  @ViewChild('formWrapper', {read: ElementRef})
  private formWrapper: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private registerService: RegisterService
  ) {
  }

  ngOnInit() {

    this.form = this.fb.group({
      username: [null, [Validators.required, Validators.pattern(USERNAME_REGEX), Validators.minLength(2), Validators.maxLength(20)]],
      email: [null, [Validators.required, Validators.pattern(EMAIL_REGEX)]],
      password: password,
      confirmPassword: confirmPassword
    });

    this.renderer.listen(this.formWrapper.nativeElement, 'click', () => {

      this.isShowError = false;
      this.errorMessage = '';
    });
  }

  onSubmit() {

    this.isShowError = false;
    this.errorMessage = '';

    if (this.form.valid) {

      this.isSubmitting = true;

      this.registerService.register(this.form.value).subscribe((res) => {

        if (res.success) {

          this.registerService.showMessage('注册成功，即将前往登录页登录', () => {

            this.router.navigate(['/login']);
          });

        } else {

          this.isShowError = true;
          this.errorMessage = res.message;
        }

      }, (res) => {

        this.isShowError = true;
        this.errorMessage = res.message;
      }, () => {

        this.isSubmitting = false;
      });
    }
  }

  checkErrorMatch(name: string, type: string): boolean {

    return this.form.controls[name].touched && this.form.controls[name].hasError(type);
  }
}
