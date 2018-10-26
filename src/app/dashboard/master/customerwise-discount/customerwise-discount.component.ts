import { Component, OnInit,TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterService } from '../master.service';
import '../../../../assets/styles/mainstyles.scss';
import { ConfirmationModelDialogComponent } from '../../../commonComponents/confirmation-model-dialog/confirmation-model-dialog.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-customerwise-discount',
  templateUrl: './customerwise-discount.component.html',
})
export class CustomerwiseDiscountComponent implements OnInit {

  public customerDiscountForm: FormGroup;
  public companyForm: FormGroup;
  private endPoint: string = "customerwisediscount/";
  private cEndPoint: string = "company/";
  public gridDataList: any = [];
  public gridColumnNamesList;
  public gridSelectedRow;
  public formSuccess: boolean = false;
  public formRequiredError: boolean = false;
  public formServerError: boolean = false;
  public nameFlag;
  public deleteFlag: boolean = true;
  public customerName;
  private duplicateCustomerName: boolean = false;
  public duplicateMessage: string = null;
  public duplicateMessageParam: string = null;
  public scFormRequiredError: boolean = false;
  public scFormServerError: boolean = false;
  public scFormSuccess: boolean = false;
  public childDuplicateMessage: string = null;
  public childDuplicateMessageParam: string = null;
  private duplicateCompany: boolean = false;
  public typeaheadCompanyDataList: any = [];
  public selectedCompanyTypeahead: any;

  modalRef: BsModalRef;
  message: string;

  @ViewChild('focus') focusField: ElementRef;

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private modalService: BsModalService,
    private masterService: MasterService) {
      translate.setDefaultLang('messages.en');
  }

  ngOnInit() {
    this.customerDiscountForm = this.fb.group({
      id: [],
      customer: ['', Validators.required],
      companyCode: ['', Validators.required],
      discount: ['', Validators.required],
      discountType:[]

    });


    this.companyForm = this.fb.group({
      companyId: [],
      companyCode: ['', Validators.required]
    });

    //this.loadGridData();
    this.getGridCloumsList();
    this.loadCompanyTypeaheadData();
    this.getJsonData();
   // this.focusField.nativeElement.focus();
  }

  getJsonData() {
    this.masterService.getLocalJsonData().subscribe(data => {
      data as object[];
      this.gridColumnNamesList = data["CustomerDiscountColumns"];
    });
  }

  loadCompanyTypeaheadData(){
    this.masterService.getParentData(this.cEndPoint).subscribe(list => {
      this.typeaheadCompanyDataList = list;
    });
  }

  loadSelectedCompanyTypeahead(event) {
    this.selectedCompanyTypeahead = event.item;
    this.customerDiscountForm.patchValue({ companyId: event.item.id });
  }

  valueChange(selectedRow: any[]): void {
    this.editable(selectedRow);
  }

  onInitialDataLoad(dataList:any[]){
    this.gridDataList = dataList;
  }

  openModal(template: TemplateRef<any>) {
    this.resetChildForm();
    this.scFormRequiredError = this.scFormServerError = this.scFormSuccess = false;
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  show(){
    document.getElementById('disc').style.display ='block';
  }
  
  hide(){
    document.getElementById('disc').style.display ='none';
  }

  getDuplicateErrorMessages(): void {
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
    this.childDuplicateMessage = null;
    this.childDuplicateMessageParam = null;
    this.formRequiredError = false;
    this.scFormRequiredError = false;

    if (this.duplicateCustomerName) {
      this.duplicateMessage = "customerdiscount.duplicateNameErrorMessage";
      this.duplicateMessageParam = this.customerDiscountForm.value.customer;
    }
    else if (this.duplicateCompany) {
      this.childDuplicateMessage = "companies.duplicateNameErrorMessage";
      this.childDuplicateMessageParam = this.companyForm.value.companyCode;
    }
  }

  checkForDuplicateCustomerName() {
        if(!this.nameFlag){
        this.duplicateCustomerName = this.masterService.hasDataExist(this.gridDataList, 'customer', this.customerDiscountForm.value.customer);
        this.getDuplicateErrorMessages();
      }

  }

  checkForDuplicateCompanyCode() {
    this.duplicateCompany = this.masterService.hasDataExist(this.gridDataList, 'companyCode', this.companyForm.value.companyCode);
    this.getDuplicateErrorMessages();
}

  getGridCloumsList() {
    this.masterService.getLocalJsonData().subscribe(data => {
      data as object[];
      this.gridColumnNamesList = data["CustomerDiscountColumns"];
    });
  }

  loadGridData() {
    this.masterService.getData(this.endPoint);
    this.masterService.dataObject.subscribe(list => {
      this.gridDataList = list;
      localStorage.setItem('rowDataLength', JSON.stringify(this.gridDataList.length));
    });
  }

  save() {
    if (this.customerDiscountForm.valid) {

      if (this.customerDiscountForm.value.id) {
        this.masterService.updateRecord(this.endPoint, this.customerDiscountForm.value).subscribe(res => {
          this.showInformationModal("Save");
        }, (error) => {
          this.serverErrMsg();
        });
      } else {
        this.masterService.createRecord(this.endPoint, this.customerDiscountForm.value).subscribe(res => {
          this.showInformationModal("Save");
        }, (error) => {
          this.serverErrMsg();
        });
      }

    } else {
      this.requiredErrMsg()
    }
  }

  saveForm() {
    this.formRequiredError = false;
    if (this.customerDiscountForm.valid) {
      this.showConfirmationModal("Save");
    } else {
      this.serverErrMsg()
    }
  }

  saveChildCmpForm() {
    this.scFormRequiredError = false;
    if (this.companyForm.valid && this.childDuplicateMessage == null) {
      this.showConfirmationModal("SaveChildCmpForm");
    } else {
      this.scRequiredErrMsg()
    }
  }

  saveChildCmpData() {
    this.masterService.createRecord(this.cEndPoint, this.companyForm.value).subscribe(res => {
      this.showInformationModal("SaveChildCmpForm");

    }, (error) => {
      this.serverErrMsg();
    });

  }


  delete() {

    this.masterService.deleteRecord(this.endPoint, this.gridSelectedRow.id).subscribe(res => {
      localStorage.removeItem('ag-activeRow');
      this.showInformationModal("Delete");
    }, (error) => {
      this.serverErrMsg();
    });

  }

  successMsg() {
    this.formSuccess = true;
    this.formRequiredError = this.formServerError = false;
    this.resetForm();
  }

  requiredErrMsg() {
    if( this.duplicateMessage == null){
      this.formRequiredError = true;
      this.formSuccess = this.formServerError = false;
    }
  }

  serverErrMsg() {
    this.formServerError = true;
    this.formRequiredError = this.formSuccess = false;
  }

  resetForm() {
    this.customerDiscountForm.reset();
    this.gridSelectedRow = null;
    this.nameFlag = false;
    this.deleteFlag = true;
    this.formRequiredError = this.formServerError = this.formSuccess = false;
    this.loadGridData();
    this.focusField.nativeElement.focus();
  }

  editable(s) {
    console.log("s---", s);
    this.gridSelectedRow = s;
    this.customerDiscountForm.reset(s);
    this.nameFlag = true;
    this.deleteFlag = false;
  }


  resetChildForm() {
    this.scFormRequiredError = false;
    this.scFormServerError = false;
    this.duplicateMessage = null;
    this.childDuplicateMessage = null;
    this.childDuplicateMessageParam = null;
    this.formRequiredError = false;
    this.duplicateMessageParam = null;
    this.companyForm.reset();
  }

  scRequiredErrMsg() {
    this.scFormRequiredError = true;
    this.scFormSuccess = this.scFormServerError = false;
  }

  showInformationModal(eventType) {
    var msg;
    var title;
    if (eventType === "Delete") {
      msg = 'customerdiscount.deleteInformationMessage';
      title = 'Customerwise Discount';
    } else if (eventType === "Save") {
      title = 'Customerwise Discount';
      msg = 'customerdiscount.saveInformationMessage';
    }
    else if (eventType === "SaveChildCmpForm") {
      title = 'Company';
      msg = 'companies.saveInformationMessage';

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
      title = 'Customerwise Discount';
      msg = 'customerdiscount.deleteConfirmationMessage';
    } else if (eventType === "Save") {
      title = 'Customerwise Discount';
      msg = 'customerdiscount.saveConfirmationMessage';
    }
    else if (eventType === "SaveChildCmpForm") {
      title = 'Company';
      msg = 'companies.saveConfirmationMessage';
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
        }
        else if (eventType === "SaveChildCmpForm") {
          this.saveChildCmpData();
        }
        else {
          this.save();
        }
      }
    });
  }
}
