import { Component, OnInit,  NgModule, TemplateRef, ViewChild, ElementRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsDropdownModule, TypeaheadModule, TabsModule } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { MasterService } from 'src/app/dashboard/master/master.service';
import { TranslateService } from '@ngx-translate/core';
import { ButtonsComponent } from 'src/app/commonComponents/buttons/buttons.component';
import { SharedDataService } from 'src/app/shared/model/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationModelDialogComponent } from 'src/app/commonComponents/confirmation-model-dialog/confirmation-model-dialog.component';
// import * as _ from 'lodash';

@Component({
  selector: 'app-createuser',
  templateUrl: './createuser.component.html',
  styleUrls: ['./createuser.component.scss']
})

@NgModule({
  imports: [
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    TabsModule.forRoot()
  ],
})

export class CreateuserComponent implements OnInit {

  private createUserForm: FormGroup;
  public districtsForm: FormGroup;
  private deleteFlag: boolean = true;
  private endPoint: string = "createUser/";
  private formSuccess: boolean = false;
  private formRequiredError: boolean = false;
  private nameFlag: boolean = false;
  private duplicateName: boolean = false;
  private duplicateUserName: boolean = false;
  private duplicateMessage: string = null;
  private duplicateMessageParam: string = null;
  private paramUserId: string = null;
  private rolesList: any = [];
  private userList: any = [];
  public districtsList: any = [];
  public statesList: any = [];
  public selectedDistrict: any;
  private duplicateDistrictName: boolean = false;
  public scFormRequiredError: boolean = false;
  public scFormSuccess: boolean = false;
  public childDuplicateMessage: string = null;
  public childDuplicateMessageParam: string = null;

  modalRef: BsModalRef;
  
  @ViewChild(ButtonsComponent) buttonsComponent: ButtonsComponent;

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private modalService: BsModalService,
    private _routeParams: ActivatedRoute,
    private sharedDataService: SharedDataService,
    private masterService: MasterService) {
    translate.setDefaultLang('messages.en');
    this._routeParams.queryParams.subscribe(params => {
      this.nameFlag = params['editMode'];
      this.paramUserId = params['userId'];
    });
  }

  ngOnInit() {
    this.createUserForm = this.fb.group({
      id: [],
      districtId: [],
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confPassword: ['', Validators.required],
      address: ['', Validators.required],
      town: ['', Validators.required],
      pin: ['', Validators.required],
      districtName: ['', Validators.required],
      state: ['', Validators.required],
      phone: ['', Validators.required],
      mobile: ['', Validators.required],
      email: ['', Validators.required],
      roles: ['', Validators.required],
      designation: ['', Validators.required]
    });

    this.districtsForm = this.fb.group({
      id: [],
      districtName: ['', Validators.required],
      stateId: [],
      stateName: []
    });

    this.rolesList = this.sharedDataService.getSharedCommonJsonData().UserRoles;
  }

loadDistrictData() {
    this.masterService.getParentData("districts/").subscribe(list => {
      this.districtsList = list;
    })
  }

  loadStatesData() {
    this.masterService.getParentData("states/").subscribe(list => {
      this.statesList = list;
    })
  }

  onSelectDistrict(event) {
    this.selectedDistrict = event.item;
    this.createUserForm.patchValue({ stateName: this.selectedDistrict.stateName });
    this.createUserForm.patchValue({ districtId: this.selectedDistrict.id });
    this.createUserForm.patchValue({ stateId: this.selectedDistrict.stateId });
  }

  openModal(template: TemplateRef<any>, templateName) {
   if (templateName == "Districts") {
      this.resetChildForm(this.districtsForm);
      this.loadStatesData();
    }
    //template, 'SubSchedule'
    this.scFormRequiredError = this.scFormSuccess = false;
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  resetChildForm(formObj) {
    this.scFormRequiredError = false;
    this.duplicateDistrictName = false;
    this.childDuplicateMessage = null;
    this.childDuplicateMessageParam = null;
    this.scFormRequiredError = this.scFormSuccess = false;
    // formObj.reset();
    this.districtsForm.reset();
  }

  saveChildForm(screenName, formObj) {
    this.scFormRequiredError = false;
    if (formObj.valid && this.childDuplicateMessage == null) {
      this.showConfirmationModal(screenName);
    } else {
      this.scRequiredErrMsg()
    }
  }

  
  scRequiredErrMsg() {
    if (this.childDuplicateMessage == null) {
      this.scFormRequiredError = true;
      this.scFormSuccess = false;
    }
  }

  saveChild(screenName, formObj, targetUrl) {
    this.masterService.createRecord(targetUrl, formObj.value).subscribe(res => {
      this.showInformationModal(screenName);
      if (screenName == "District") {
        this.loadDistrictData();
      }
      this.modalRef.hide();
      formObj.reset();
    }, (error) => {
      throw error;
    });
  }

  
  checkForDuplicateDistrictName() {
    this.duplicateDistrictName = this.masterService.hasDataExist(this.districtsList, 'districtName', this.districtsForm.value.districtName);
    this.getDuplicateErrorMessages();
  }



  checkForDuplicateName() {
    if (!this.nameFlag) {
      this.duplicateName = this.masterService.hasDataExist(this.userList, 'name', this.createUserForm.value.name);
      this.getDuplicateErrorMessages();
    }
  }

  checkForDuplicateUserName() {
    if (!this.nameFlag) {
      this.duplicateUserName = this.masterService.hasDataExist(this.userList, 'UserName', this.createUserForm.value.username);
      this.getDuplicateErrorMessages();
    }
  }

  getDuplicateErrorMessages(): void {
    if (!this.duplicateName || !this.duplicateUserName) {
      this.formRequiredError = false;
      this.duplicateMessage = null;
      this.duplicateMessageParam = null;
    }
    if (this.duplicateDistrictName) {
      this.childDuplicateMessage = "districts.duplicateNameErrorMessage";
      this.childDuplicateMessageParam = this.districtsForm.value.districtName;
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
    this.createUserForm.reset();
    this.deleteFlag = true;
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
    this.nameFlag = false;
    this.duplicateName = false;
    this.duplicateUserName = false;
    this.formRequiredError = this.formSuccess = false;
    this.duplicateDistrictName = false;
    this.districtsForm.reset();
  }

  showInformationModal(eventType) {
    const modal = this.modalService.show(ConfirmationModelDialogComponent);
    (<ConfirmationModelDialogComponent>modal.content).showInformationModal(
      this.getFormDetails(eventType).title,
      this.getFormDetails(eventType).infoMessage,
      ''
    );
    (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => { this.successMsg(); });
  }
  
  showConfirmationModal(eventType): void {
    const modal = this.modalService.show(ConfirmationModelDialogComponent);
    (<ConfirmationModelDialogComponent>modal.content).showConfirmationModal(
      this.getFormDetails(eventType).title,
      this.getFormDetails(eventType).confirmMessage,
      'green',
      ''
    );
  
    (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => {
      if (result) {
        if (eventType == "Delete") {
          this.delete();
        }
        else if (eventType == "District") {
          this.saveChild(eventType, this.districtsForm, "districts/");
        }
      }
    });
  }

  getFormDetails(screenName) {
    if (screenName == "Save") {
      return { "title": "Create User", "confirmMessage": "createuser.saveConfirmationMessage", "infoMessage": "createuser.saveInformationMessage" };
    }
    else if (screenName == "District") {
      return { "title": "Districts", "confirmMessage": "districts.saveConfirmationMessage", "infoMessage": "districts.saveInformationMessage" };
    }
  }
}
