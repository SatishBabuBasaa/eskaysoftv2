import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterService } from 'src/app/dashboard/master/master.service';
import { TranslateService } from '@ngx-translate/core';
import { ButtonsComponent } from 'src/app/commonComponents/buttons/buttons.component';
import { SharedDataService } from 'src/app/shared/model/shared-data.service';
import 'src/assets/styles/mainstyles.scss';
import * as _ from 'lodash';

@Component({
  selector: 'app-mfgwise-purchase-reg',
  templateUrl: './mfgwise-purchase-reg.component.html',
  styleUrls: ['./mfgwise-purchase-reg.component.scss']
})
export class MfgwisePurchaseRegComponent implements OnInit {

  private mfgwiseRegristerForm: FormGroup;
  private deleteFlag: boolean = true;
  private endPoint: string = "mfgwise-purchase-reg/";
  private formSuccess: boolean = false;
  private formRequiredError: boolean = false;
  private nameFlag: boolean = false;
  private duplicateName: boolean = false;
  private duplicateUserName: boolean = false;
  private duplicateMessage: string = null;
  private duplicateMessageParam: string = null;
  private internalStockList: any = [];
  private mfgList: any = [];

  @ViewChild('focus') focusField: ElementRef;
  @ViewChild(ButtonsComponent) buttonsComponent: ButtonsComponent;

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private sharedDataService: SharedDataService,
    private masterService: MasterService) {
    translate.setDefaultLang('messages.en');

  }

  ngOnInit() {
    this.mfgwiseRegristerForm = this.fb.group({
      id: ['', Validators.required],
      mfgOption: ['', Validators.required],
      fromDate: [],
      toDate: []

    });

  //  this.rolesList = this.sharedDataService.getSharedCommonJsonData().UserRoles;
  }

  checkForDuplicateName() {

  }

  checkForDuplicateUserName() {

  }

  getDuplicateErrorMessages(): void {
    if (!this.duplicateName || !this.duplicateUserName) {
      this.formRequiredError = false;
      this.duplicateMessage = null;
      this.duplicateMessageParam = null;
    }
  }

  save() {
    this.buttonsComponent.save();
  }

  delete() {
    this.buttonsComponent.delete();
  }

  successMsg() {
    this.formSuccess = true;
    this.formRequiredError = false;
    this.resetForm();
  }

  requiredErrMsg() {
    if (this.duplicateMessage == null) {
      this.formRequiredError = true;
      this.formSuccess = false;
    }
  }

  resetForm() {
    this.mfgwiseRegristerForm.reset();
    this.deleteFlag = true;
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
    this.nameFlag = false;
    this.duplicateName = false;
    this.duplicateUserName = false;
    this.formRequiredError = this.formSuccess = false;
  }

}
