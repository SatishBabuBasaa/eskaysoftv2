import { Component, OnInit, NgModule, TemplateRef,Input, Output, ViewChild, ElementRef,EventEmitter     } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsDropdownModule, TypeaheadModule } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterService } from 'src/app/dashboard/master/master.service';
import 'src/assets/styles/mainstyles.scss';
import { SharedDataService } from 'src/app/shared/model/shared-data.service';
import { ButtonsComponent } from '../../../commonComponents/buttons/buttons.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-purchase-dashboard',
  templateUrl: './purchase-dashboard.component.html'
})

@NgModule({
  imports: [
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    BsModalService
  ],
})

export class PurchaseDashboardComponent implements OnInit {

  public purchaseForm: FormGroup;
  private endPoint: string = "purchaseentry/";
  private formSuccess = false;
  private formRequiredError = false;
  private nameFlag = false;
  public gridDataList: any = [];
  private productsList: any = [];
  private suppliersList: any = [];
  private savedSupplierId = 0;
  private modeType: any[];
  private deleteFlag = true;

  @ViewChild('focus') focusField: ElementRef;
  @ViewChild(ButtonsComponent) buttonsComponent: ButtonsComponent;
  @Input() isModelWindowView: boolean = false;
  @Input() bodyStyle: string = "col-xs-12";
  @Output() callbackOnModelWindowClose: EventEmitter<null> = new EventEmitter();

  modalRef: BsModalRef;
  message: string;

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private sharedDataService:SharedDataService,
    private modalService: BsModalService,
    private masterService: MasterService) {
    translate.setDefaultLang('messages.en');
  }

  
  ngOnInit() {

    this.purchaseForm = this.fb.group({
      id: ['', Validators.required],
      purchaseNumber: ['', Validators.required],
      invoiceNumber:['', Validators.required],
      date: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      accountInformationId: ['', Validators.required],
      supplier: ['', Validators.required],
      gstIN: ['', Validators.required],
      wayBill: ['', Validators.required],
      transport: ['', Validators.required],
      numberOfCases: ['', Validators.required],
     
      mode: ['', Validators.required],
      lrNumber: ['', Validators.required],
      lrDate: ['', Validators.required],
      delvFrom: ['', Validators.required],
      productId: ['', Validators.required],
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      batch:['', Validators.required],
      expiry:['', Validators.required],
      qty:['', Validators.required],
    


      othCharges:['', Validators.required],
      grsValue:['', Validators.required],
      discount:['', Validators.required],
      ptd:['', Validators.required],
      saleRate:['', Validators.required],
      tax:['', Validators.required],
      hsnCode:['', Validators.required],
      mrp:['', Validators.required],
      mfgName:['', Validators.required],
      purRate:['', Validators.required],
      free:['', Validators.required],
      grossValue:['', Validators.required],
      discountValue:['', Validators.required],
      taxValue:['', Validators.required],
      netValue:['', Validators.required],
      debitAdjustmentLedger:['', Validators.required],
      CreditAdjustmentLedger:['', Validators.required],
      remarks:['', Validators.required],
      DebitAdjustmentValue:['', Validators.required],
      creditAdjustmentValue:['', Validators.required],
      invoiceValue:['', Validators.required],

      gstPercent:['', Validators.required],
      taxable:['', Validators.required],
      cgstAmt:['', Validators.required],
      sgstAmt:['', Validators.required],
      inGstPercent:['', Validators.required],
      inTaxable:['', Validators.required],
      inCgstAmt:['', Validators.required],
      inSgstAmt:['', Validators.required],

    });
    this.loadProductData();
    this.loadSupplierData();
     this.focusField.nativeElement.focus();
     this.modeType = this.sharedDataService.getSharedCommonJsonData().Mode;
  }
  onInitialDataLoad(dataList: any[]) {
    this.gridDataList = dataList;
  }
  loadGridData() {
    this.masterService.getData(this.endPoint);
    this.masterService.dataObject.subscribe(list => {
      this.gridDataList = list;
      localStorage.setItem('rowDataLength', JSON.stringify(this.gridDataList.length));
    });
  }

  valueChange(selectedRow: any[]): void {
    this.editable(selectedRow);
  }

  loadProductData() {
    this.masterService.getParentData('product/').subscribe(list => {
      this.productsList = list;
    });
  }

  loadSupplierData() {
    this.masterService.getParentData('accountinformation/').subscribe(list => {
      this.suppliersList = list;
    });
  }

  onSelectProduct(event) {
    this.purchaseForm.patchValue({ pack: event.item.packing });
    this.purchaseForm.patchValue({ free: event.item.free });
    this.purchaseForm.patchValue({ productBoxPack: event.item.boxQty });
    this.purchaseForm.patchValue({ productId: event.item.id });
    this.purchaseForm.patchValue({ productcode: event.item.productcode });
    this.purchaseForm.patchValue({ netRate: event.item.netRate });
    this.calculateRate();
  }

  calculateRate() {
    
    this.purchaseForm.patchValue({ grossValue: this.purchaseForm.value.qty * this.purchaseForm.value.netRate });
    this.purchaseForm.patchValue({ discountValue: this.purchaseForm.value.qty * this.purchaseForm.value.netRate  });
    this.purchaseForm.patchValue({ taxValue: this.purchaseForm.value.qty * this.purchaseForm.value.netRate  });
    this.purchaseForm.patchValue({ netValue: this.purchaseForm.value.qty * this.purchaseForm.value.netRate  });
    
  
  }

  onSelectSupplier(event) {
    if (this.savedSupplierId >= 0 && this.savedSupplierId !== event.item.id) {
      this.purchaseForm.patchValue({ accountInformationId: event.item.id });
      this.purchaseForm.patchValue({ gstIN: event.item.gstIN });
      this.purchaseForm.patchValue({ hsnCode: event.item.hsnCode });
      this.purchaseForm.patchValue({ purchaseNumber: this.gridDataList.length + 1 });
    }
  }

  save() {
    this.savedSupplierId = this.purchaseForm.value.accountInformationId;
    this.buttonsComponent.save();
  }

  delete() {
    this.buttonsComponent.delete();
  }

  deleteOrder() {
    this.buttonsComponent.manualDelete(this.endPoint + 'purchaseNumber/', this.purchaseForm.value.purchaseNumber);
  }

  successMsg() {
    this.formSuccess = true;
    this.formRequiredError = false;
    const tempSupplierId = this.purchaseForm.value.accountInformationId;
    const tempSupplierName = this.purchaseForm.value.supplier;
    this.resetForm(null);
    this.purchaseForm.value.accountInformationId = tempSupplierId;
    this.purchaseForm.value.supplier = tempSupplierName;
  //  this.loadGridData();
  }

  requiredErrMsg() {
      this.formRequiredError = true;
      this.formSuccess = false;
  }

  resetForm(param) {
    const tempSupplierId = this.purchaseForm.value.accountInformationId;
    const tempSupplierName = this.purchaseForm.value.supplier;
    const tempOrderNum = this.purchaseForm.value.purchaseNumber;
    this.purchaseForm.reset();
    if ((param === undefined || param === null ) && !this.nameFlag) {
      this.purchaseForm.patchValue({ accountInformationId: tempSupplierId });
      this.purchaseForm.patchValue({ supplier: tempSupplierName });
      this.purchaseForm.patchValue({ purchaseNumber: tempOrderNum });
    }
    this.deleteFlag = true;
    this.nameFlag = false;
    this.formRequiredError = this.formSuccess = false;
    this.loadGridData();
  }

  editable(s) {
    this.nameFlag = true;
    this.formRequiredError = false;
    this.deleteFlag = false;
    this.purchaseForm.reset(s);
    const productObj = _.find(this.productsList, function(o) {return o.id === s.productId; });
    this.onSelectProduct({item : productObj});
  }
}
