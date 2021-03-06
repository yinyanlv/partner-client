import { Component, OnInit, Renderer2, ViewChild, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';

import {GlobalStateService} from '../../shared/services/global-state.service';
import {EMAIL_REGEX, PHONE_REGEX} from '../../shared/etc/regex';
import {SettingsService} from './settings.service';

let newPassword = new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
let confirmNewPassword = new FormControl(null, CustomValidators.equalTo(newPassword));

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  userInfo: any;
  isUserInfoSubmitting: boolean;
  isShowUserInfoError: boolean = false;
  userInfoErrorMessage: string = '';
  userInfoForm: FormGroup;
  isPasswordSubmitting: boolean;
  isShowPasswordError: boolean = false;
  passwordErrorMessage: string = '';
  passwordForm: FormGroup;

  @ViewChild('userInfoFormWrapper', {read: ElementRef})
  userInfoFormWrapper: ElementRef;

  @ViewChild('passwordFormWrapper', {read: ElementRef})
  passwordFormWrapper: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private globalStateService: GlobalStateService,
    private settingsService: SettingsService,
  ) {
  }

  ngOnInit() {

    this.userInfo = this.globalStateService.userInfo;

    this.userInfoForm = this.fb.group({
        nickname: [this.userInfo.nickname, [Validators.maxLength(50)]],
        email: [this.userInfo.email, [Validators.required, Validators.pattern(EMAIL_REGEX)]],
        phone: [this.userInfo.phone, [Validators.pattern(PHONE_REGEX)]]
      });

    this.passwordForm = this.fb.group({
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword
    });

    this.renderer.listen(this.userInfoFormWrapper.nativeElement, 'click', () => {
      this.isShowUserInfoError = false;
      this.userInfoErrorMessage = '';
    });

    this.renderer.listen(this.passwordFormWrapper.nativeElement, 'click', () => {
      this.isShowPasswordError = false;
      this.passwordErrorMessage = '';
    });
  }

  saveUserInfo() {

    this.isShowUserInfoError = false;
    this.userInfoErrorMessage = '';

    if (this.userInfoForm.valid) {

      this.isUserInfoSubmitting = true;

      this.settingsService.updateUserInfo(this.userInfo.username, this.userInfoForm.value).subscribe((res: any) => {

        if (res.success) {

          this.globalStateService.userInfo = res.data;
          this.settingsService.showMessage('用户信息修改成功');
        } else {

          this.isShowUserInfoError = true;
          this.userInfoErrorMessage = res.message;
        }
      }, null, () => {

        this.isUserInfoSubmitting = false;
      });
    }
  }

  resetUserInfo() {
    this.userInfoForm.reset();
  }

  savePassword() {

    this.isShowPasswordError = false;
    this.passwordErrorMessage = '';

    if (this.passwordForm.valid) {

      this.isShowPasswordError = true;

      this.settingsService.updatePassword(this.userInfo.username, this.passwordForm.value).subscribe((res: any) => {

        if (res.success) {

          this.globalStateService.isLoggedIn = false;
          this.globalStateService.userInfo = null;

          this.settingsService.showMessage('用户密码修改成功，请重新登录', () => {
            this.router.navigate(['/login']);
          });

        } else {

          this.isShowPasswordError = true;
          this.passwordErrorMessage = res.message;
        }
      }, null, () => {

        this.isPasswordSubmitting = false;
      });
    }
  }

  resetPasswordForm() {
    this.passwordForm.reset();
  }

  checkErrorMatch(form: FormGroup, name: string, type: string): boolean {

    return form.controls[name].touched && form.controls[name].hasError(type);
  }
}
