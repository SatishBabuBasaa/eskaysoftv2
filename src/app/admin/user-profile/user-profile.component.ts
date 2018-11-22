import { Component, OnInit,  NgModule, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsDropdownModule, TypeaheadModule, TabsModule } from 'ngx-bootstrap';
import { MasterService } from 'src/app/dashboard/master/master.service';
import { TranslateService } from '@ngx-translate/core';
import { ButtonsComponent } from 'src/app/commonComponents/buttons/buttons.component';
import { SharedDataService } from 'src/app/shared/model/shared-data.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

@NgModule({
  imports: [
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    TabsModule.forRoot()
  ],
})
export class UserProfileComponent implements OnInit {

  private userProfileForm: FormGroup;
  private deleteFlag: boolean = true;
  private endPoint: string = "userProfile/";
  private formSuccess: boolean = false;
  private formRequiredError: boolean = false;
  private nameFlag: boolean = false;
  private duplicateName: boolean = false;
  private duplicateUserName: boolean = false;
  private duplicateMessage: string = null;
  private duplicateMessageParam: string = null;
  public userprofileList: any = [];
  public accGstType: any[];
  public accNatureOfGst: any[];
  public accSaleType: any[];
  public accCustomerType: any[];

  @ViewChild(ButtonsComponent) buttonsComponent: ButtonsComponent;

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private sharedDataService: SharedDataService,
    private masterService: MasterService) { 
      translate.setDefaultLang('messages.en'); }

  ngOnInit() {
    this.userProfileForm = this.fb.group({
      clientId: ['', Validators.required],
      id: ['', Validators.required],
      name: ['', Validators.required],
      username: ['', Validators.required],
      address1: [],
      address2: [],
      town: [],
      pin: [],
      district: [],
      state: [],
      statecode: [],
      phoneLand1: [],
      mobile1: [],
      mobile2: [],
      contactPerson: [],
      cPersonMobile: [],
      natureofbusiness: [],
      bank1: [],
      bankacno1: [],
      bankifsc1: [],
      bank2: [],
      bankacno2: [],
      bankifsc2: [],
      licNo1: [],
      licNo2: [],
      licExpiry: [],
      retLicNo1: [],
      retLicNo2: [],
      retExpiry: [],
      foodLicNo: [],
      otherLicense: [],
      otherLicenseExpiry: [],
      gstIN: [],
      gstType: ['', Validators.required],
      natureOfGST: ['', Validators.required],
      uin: [],
      creditLimit: [],
      dueDays: [],
      saleType:  ['', Validators.required],
      customerType:  ['', Validators.required],

    });

    this.accGstType = this.sharedDataService.getSharedCommonJsonData().GstType;
    this.accNatureOfGst = this.sharedDataService.getSharedCommonJsonData().NatureOfGst;
    this.accSaleType = this.sharedDataService.getSharedCommonJsonData().SaleType;
    this.accCustomerType = this.sharedDataService.getSharedCommonJsonData().CustomerType;
  }

  checkForDuplicateName() {
    if (!this.nameFlag) {
      this.duplicateUserName = this.masterService.hasDataExist(this.userprofileList, 'Email', this.userProfileForm.value.Email);
      this.getDuplicateErrorMessages();
    }
  }

  checkForDuplicateUserName() {
    if (!this.nameFlag) {
      this.duplicateUserName = this.masterService.hasDataExist(this.userprofileList, 'UserName', this.userProfileForm.value.username);
      this.getDuplicateErrorMessages();
    }
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
    this.userProfileForm.reset();
    this.deleteFlag = true;
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
    this.nameFlag = false;
    this.duplicateName = false;
    this.duplicateUserName = false;
    this.formRequiredError = this.formSuccess = false;
  }
}
