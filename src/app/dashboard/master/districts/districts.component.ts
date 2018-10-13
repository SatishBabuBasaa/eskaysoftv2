import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterService } from '../master.service';
import '../../../../assets/styles/mainstyles.scss';
import { ConfirmationModelDialogComponent } from '../../../commonComponents/confirmation-model-dialog/confirmation-model-dialog.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-districts',
  templateUrl: './districts.component.html'
})
export class DistrictsComponent implements OnInit {
  public districtsForm: FormGroup;
  public statesForm: FormGroup;
  public formSuccess: boolean = false;
  public isduplicate: boolean = false;
  public isStateduplicate: boolean = false;
  public formRequiredError: boolean = false;
  public formServerError: boolean = false;
  public scFormRequiredError: boolean = false;
  public scFormServerError: boolean = false;
  public scFormSuccess: boolean = false;
  public districtsList: any = [];
  public statesList: any = [];
  public districtsColumns;
  public editDistricts;
  public nameFlag;
  public deleteFlag: boolean =true;
  public selectedState:any;
  public distName;
  private duplicateDistName: boolean = false;
  public duplicateMessage: string = null;
  public duplicateMessageParam: string = null;
  modalRef: BsModalRef;
  message: string;

  @ViewChild('focus') focusField: ElementRef;

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private modalService: BsModalService,
    private masterService: MasterService) {
    translate.setDefaultLang('messages.en');
  }

  valueChange(selectedRow: any[]): void {
    this.editable(selectedRow);
  }
  openModal(template: TemplateRef<any>) {
    this.resetStatesForm();
    this.scFormRequiredError = this.scFormServerError = this.scFormSuccess = false;
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }
  ngOnInit() {
    this.statesForm = this.fb.group({
      id: [],
      stateName: ['', Validators.required],
      stateCode: ['', Validators.required],
      zone: ['', Validators.required],
    });
    this.districtsForm = this.fb.group({
      districtId: [],
      districtName: ['', Validators.required],
      statesId: [],
      statesName: []
    });

    this.loadStatesData();
    this.loadGridData();
    this.focusField.nativeElement.focus();
    this.getDistrictsTypes();
  }


  getDuplicateErrorMessages(): void {
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
     if (this.duplicateDistName) {
      this.duplicateMessage = "districts.duplicateNameErrorMessage";
      this.duplicateMessageParam=this.districtsForm.value.districtName;
    }
  }

  checkForDuplicateDistName() {
    this.duplicateDistName = this.masterService.hasDataExist(this.districtsList, 'districtName', this.districtsForm.value.districtName);
    this.getDuplicateErrorMessages();
  }


  loadStatesData() {
    this.masterService.getParentData("states/").subscribe(list => {
      this.statesList = list;
    })
  }

  onSelectState(event) {
    this.selectedState = event.item;
  }

  loadGridData() {
    this.masterService.getData("districts/");
    this.masterService.dataObject.subscribe(list => {
      this.districtsList = list;
      localStorage.setItem('rowDataLength', JSON.stringify(this.districtsList.length));
    });
  }

  getDistrictsTypes() {
    this.masterService.getLocalJsonData().subscribe(data => {
       data as object [];
        this.districtsColumns = data["DistrictsColumns"]
    });
  }

  saveState() {
    if(!this.verifyStatesDuplicates()){

        if (this.statesForm.valid) {
          this.masterService.createRecord("states/", this.statesForm.value).subscribe(res => {
              this.modalRef.hide();
            this.statesForm.reset();
            this.loadStatesData();
          }, (error) => {
            this.scServerErrMsg();
          });

        } else {
          this.scRequiredErrMsg();
        }

    }else{
      this.scDuplicateMsg();
    }
  }


  verifyStatesDuplicates(){
    let stateNameList = this.statesList.map((item)=>{return item.stateName});
    let isDuplicate = this.masterService.verifyDuplicates(stateNameList, this.statesForm.value.stateName, true);
    if(!isDuplicate){
      let stateNameList = this.statesList.map((item)=>{return item.stateCode});
      isDuplicate = this.masterService.verifyDuplicates(stateNameList, parseInt(this.statesForm.value.stateCode), false);
    }
    return isDuplicate;
  }

  verifyDistDuplicates(){
    let distNameList = this.districtsList.map((item)=>{return item.districtName});
    return this.masterService.verifyDuplicates(distNameList, this.districtsForm.value.districtName, true);
  }

  save() {
    this.formRequiredError = false;
    if(!this.verifyDistDuplicates()){
      if (this.districtsForm.valid && this.selectedState && this.selectedState.id ) {
          this.districtsForm.value.statesId = this.selectedState.id;
          if (this.districtsForm.value.districtId) {
            this.masterService.updateRecord('districts/', this.districtsForm.value).subscribe(res => {
              this.showInformationModal("Save");
            }, (error) => {
              this.serverErrMsg();
            });
          } else {
            this.masterService.createRecord('districts/', this.districtsForm.value).subscribe(res => {
              this.showInformationModal("Save");
            }, (error) => {
              this.serverErrMsg();
            });
          }

      } else {
        this.requiredErrMsg();
      }
    } else{
      this.duplicateMsg();
    }
  }

  saveForm() {
    this.formRequiredError = false;
    if (this.districtsForm.valid && !this.verifyDistDuplicates() ) {
      this.showConfirmationModal("Save");
    } else {
      this.duplicateMsg()
    }
  }

  delete() {

      this.masterService.deleteRecord('districts/', this.editDistricts.districtId).subscribe(res => {
        localStorage.removeItem('ag-activeRow');
        this.showInformationModal("Delete");
      }, (error) => {
        this.serverErrMsg();
      });

  }

  successMsg() {
    this.formSuccess = true;
    this.formRequiredError = this.formServerError = this.isduplicate = false;
    this.resetForm();
  }

  duplicateMsg() {
    this.isduplicate = true;
    this.formRequiredError = this.formServerError = this.formSuccess = false;
  }

  requiredErrMsg() {
    if( this.duplicateMessage == null){
      this.formRequiredError = true;
      this.formSuccess = this.formServerError = false;
    }
  }

  serverErrMsg() {
    this.formServerError = true;
    this.formRequiredError = this.formSuccess = this.isStateduplicate = false;
  }
  scRequiredErrMsg() {
    this.scFormRequiredError = true;
    this.scFormSuccess = this.scFormServerError = this.isStateduplicate = false;
  }

  scDuplicateMsg() {
    this.isStateduplicate = true;
    this.scFormRequiredError = this.scFormSuccess = this.scFormServerError = false;
  }

  scServerErrMsg() {
    this.scFormServerError = true;
    this.scFormRequiredError = this.scFormSuccess = this.isStateduplicate = false;
  }
  resetForm() {
    this.loadGridData();
    this.loadStatesData();
    this.formRequiredError = this.formServerError = this.formSuccess = this.isduplicate = false;
    this.districtsForm.reset();
    this.editDistricts = null;
    this.nameFlag = false;
    this.deleteFlag = false;
    this.formRequiredError = false;
    this.duplicateMessage = null;
    this.focusField.nativeElement.focus();
  }

  resetStatesForm(){
    this.scFormServerError = this.scFormRequiredError = this.scFormSuccess = this.isStateduplicate = false;
    this.statesForm.reset();
  }

  editable(s) {
    this.editDistricts = s;
    this.districtsForm.reset(s);
    this.nameFlag = true;
    this.selectedState = {};
    this.selectedState.id = s.stateId;
    this.deleteFlag = false;
    this.districtsForm.reset(s);
  }

  showInformationModal(eventType) {
    var msg;
    var title;
    if (eventType === "Delete") {
      msg = 'districts.deleteInformationMessage';
      title = 'District';
    } else if (eventType === "Save") {
      title = 'District';
      msg = 'districts.saveInformationMessage';
    }
    const modal = this.modalService.show(ConfirmationModelDialogComponent);
    (<ConfirmationModelDialogComponent>modal.content).showInformationModal(
      title,
      msg,
      ''
    );
    (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => { this.successMsg(); });
  }

  showConfirmationModal(eventType): void {
    var msg;
    var title;
    if (eventType === "Delete") {
      title = 'District';
      msg = 'districts.deleteConfirmationMessage';
    } else if (eventType === "Save") {
      title = 'District';
      msg = 'districts.saveConfirmationMessage';
    }
    const modal = this.modalService.show(ConfirmationModelDialogComponent);
    (<ConfirmationModelDialogComponent>modal.content).showConfirmationModal(
      title,
      msg,
      'green',
      ''
    );

    (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => {
      if (result) {
        if (eventType === "Delete") {
          this.delete();
        }  else {
          this.save();
        }
      }
    });
  }

}
