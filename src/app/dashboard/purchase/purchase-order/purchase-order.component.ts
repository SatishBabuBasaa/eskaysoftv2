import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterService } from 'src/app/dashboard/master/master.service';
import { TranslateService } from '@ngx-translate/core';
import { ButtonsComponent } from 'src/app/commonComponents/buttons/buttons.component';
import { SharedDataService } from 'src/app/shared/model/shared-data.service';
import 'src/assets/styles/mainstyles.scss';

import * as _ from 'lodash';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html'
})
export class PurchaseOrderComponent implements OnInit {

  public purchaseOrderForm: FormGroup;
  private deleteFlag = true;
  private endPoint = 'purchaseOrder/';
  private formSuccess = false;
  private formRequiredError = false;
  private nameFlag = false;
  private duplicateName = false;
  private duplicateOrderNo = false;
  private duplicateMessage: string = null;
  private duplicateMessageParam: string = null;
  public gridDataList: any = [];
  private productsList: any = [];
  private suppliersList: any = [];
  private childDuplicateMessage: string = null;
  private childDuplicateMessageParam: string = null;
  private savedSupplierId = 0;

  @ViewChild('focus') focusField: ElementRef;
  @ViewChild(ButtonsComponent) buttonsComponent: ButtonsComponent;

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private sharedDataService: SharedDataService,
    private masterService: MasterService) {
    translate.setDefaultLang('messages.en');
  }

  ngOnInit() {
    this.purchaseOrderForm = this.fb.group({
      id: [],
      accountInformationId: ['', Validators.required],
      orderNumber: ['', Validators.required],
      supplier: ['', Validators.required],
      remarks: ['', Validators.required],
      date: ['', Validators.required],
      productId: ['', Validators.required],
      productName: ['', Validators.required],
      productcode: ['', Validators.required],
      productBoxPack: ['', Validators.required],
      pack: ['', Validators.required],
      qty: ['', Validators.required],
      rate: ['', Validators.required],
      free: ['', Validators.required],
      value: ['', Validators.required],
      bQty: ['', Validators.required],
      bFree: ['', Validators.required],
      bRate: ['', Validators.required]
    });
    this.loadProductData();
    this.loadSupplierData();
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

  getDuplicateErrorMessages(): void {
    if (!this.duplicateOrderNo) {
      this.formRequiredError = false;
      this.duplicateMessage = null;
      this.duplicateMessageParam = null;
    }
    if (this.duplicateOrderNo) {
      this.duplicateMessage = 'purchaseOrder.duplicateNameErrorMessage';
      this.duplicateMessageParam = this.purchaseOrderForm.value.orderNumber;
    }
  }

  onSelectProduct(event) {
    this.purchaseOrderForm.patchValue({ pack: event.item.packing });
    this.purchaseOrderForm.patchValue({ free: event.item.free });
    this.purchaseOrderForm.patchValue({ productBoxPack: event.item.boxQty });
    this.purchaseOrderForm.patchValue({ productId: event.item.id });
    this.purchaseOrderForm.patchValue({ productcode: event.item.productcode });
    this.purchaseOrderForm.patchValue({ bFree: event.item.free / event.item.boxQty });
    //  const productPurchaseList = _.filter(this.gridDataList, function(o) {return o.productId == event.item.id });
    //  this.purchaseOrderForm.patchValue({ orderNumber: productPurchaseList.length + 1 });
  }

  calculateRate() {
    this.purchaseOrderForm.patchValue({ rate: this.purchaseOrderForm.value.pack * this.purchaseOrderForm.value.qty });
    this.purchaseOrderForm.patchValue({ bQty: this.purchaseOrderForm.value.productBoxPack * this.purchaseOrderForm.value.qty });
    this.purchaseOrderForm.patchValue({ bRate: this.purchaseOrderForm.value.productBoxPack * this.purchaseOrderForm.value.qty });
    this.purchaseOrderForm.patchValue({ value: this.purchaseOrderForm.value.rate * this.purchaseOrderForm.value.qty });
  }

  onSelectSupplier(event) {
    if (this.savedSupplierId >= 0 && this.savedSupplierId !== event.item.id) {
      this.purchaseOrderForm.patchValue({ accountInformationId: event.item.id });
      this.purchaseOrderForm.patchValue({ orderNumber: this.gridDataList.length + 1 });
    }
  }

  save() {
    this.savedSupplierId = this.purchaseOrderForm.value.accountInformationId;
    this.buttonsComponent.save();
  }

  delete() {
    this.buttonsComponent.delete();
  }

  deleteOrder() {
    this.buttonsComponent.manualDelete(this.endPoint + '/orderNumber', this.purchaseOrderForm.value.orderNumber);
  }

  successMsg() {
    this.formSuccess = true;
    this.formRequiredError = false;
    const tempSupplierId = this.purchaseOrderForm.value.accountInformationId;
    const tempSupplierName = this.purchaseOrderForm.value.supplier;
    this.resetForm(null);
    this.purchaseOrderForm.value.accountInformationId = tempSupplierId;
    this.purchaseOrderForm.value.supplier = tempSupplierName;
    this.loadGridData();
  }

  requiredErrMsg() {
    if (this.duplicateMessage == null) {
      this.formRequiredError = true;
      this.formSuccess = false;
    }
  }

  resetForm(param) {
    const tempSupplierId = this.purchaseOrderForm.value.accountInformationId;
    const tempSupplierName = this.purchaseOrderForm.value.supplier;
    const tempOrderNum = this.purchaseOrderForm.value.orderNumber;
    this.purchaseOrderForm.reset();
    if ((param === undefined || param === null )&& !this.nameFlag) {
      this.purchaseOrderForm.patchValue({ accountInformationId: tempSupplierId });
      this.purchaseOrderForm.patchValue({ supplier: tempSupplierName });
      this.purchaseOrderForm.patchValue({ orderNumber: tempOrderNum });
    }

    this.deleteFlag = true;
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
    this.nameFlag = false;
    this.duplicateOrderNo = false;
    this.formRequiredError = this.formSuccess = false;
    this.loadGridData();
  }

  editable(s) {
    this.nameFlag = true;
    this.formRequiredError = false;
    this.childDuplicateMessage = null;
    this.childDuplicateMessageParam = null;
    //  this.deleteFlag = !s.deleteFlag;
    this.deleteFlag = false;
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
    this.purchaseOrderForm.reset(s);
    //  const productObj = _.find(this.productsList, function(o) {return o.id == s.productId; });
    //  this.purchaseOrderForm.patchValue({ productBoxPack: productObj.boxQty });
  }
}
