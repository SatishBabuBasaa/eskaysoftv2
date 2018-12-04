import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { MasterService } from '../master.service';
import { TranslateService } from '@ngx-translate/core';
import '../../../../assets/styles/mainstyles.scss';
import { ConfirmationModelDialogComponent } from '../../../commonComponents/confirmation-model-dialog/confirmation-model-dialog.component';
import * as _ from 'lodash';
import { SharedDataService } from 'src/app/shared/model/shared-data.service';

@Component({
  selector: 'app-subschedule',
  templateUrl: './subschedule.component.html'
})

export class SubscheduleComponent implements OnInit {

  public scheduleForm: FormGroup;
  private endPoint: string = "subschedules/";
  public subScheduleForm: FormGroup;
  public formRequiredError: boolean = false;
  public formSuccess: boolean = false;
  public scFormRequiredError: boolean = false;
  public scFormSuccess: boolean = false;
  public nameFlag;
  subScheduleList: any = [];
  public childDuplicateMessage: string = null;
  public childDuplicateMessageParam: string = null;
  scheduleList: any = [];
  editSubSchedule: any;
  public selectedSchedule: any;
  scheduleTypes: any;
  modalRef: BsModalRef;
  message: string;
  public deleteFlag: boolean = true;
  private duplicateSchName: boolean = false;
  private duplicateSubSchName: boolean = false;
  private duplicateSchIndex: boolean = false;
  public duplicateMessage: string = null;
  public duplicateMessageParam: string = null;
  @ViewChild('focus') focusField: ElementRef;
  @Input() isModelWindowView: boolean = false;
  @Input() bodyStyle: string = "col-xs-5";
  @Output() callbackOnModelWindowClose: EventEmitter<null> = new EventEmitter();

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private sharedDataService: SharedDataService,
    private modalService: BsModalService,
    private masterService: MasterService) { translate.setDefaultLang('messages.en'); }

  valueChange(selectedRow: any[]): void {
    this.editable(selectedRow);
  }

  onInitialDataLoad(dataList: any[]) {
    this.subScheduleList = dataList;
  }

  ngOnInit() {
    this.scheduleForm = this.fb.group({
      id: [],
      scheduleName: ['', Validators.required],
      scheduleIndex: ['', Validators.required],
      scheduleType: ['', Validators.required],
    });

    this.subScheduleForm = this.fb.group({
      id: [],
      subScheduleName: ['', Validators.required],
      subScheduleIndex: ['', Validators.required],
      scheduleId: [],
      scheduleName: []
    });
    this.loadScheduleData();
    this.focusField.nativeElement.focus();
    this.scheduleTypes = this.sharedDataService.getSharedCommonJsonData().ScheduleTypes;
    if(this.isModelWindowView){
      this.loadGridData();
    }
  }

  loadScheduleData() {
    this.masterService.getParentData("schedules/").subscribe(list => {
      this.scheduleList = list;
    })
  }

  loadGridData() {
    this.masterService.getData(this.endPoint);
    this.masterService.dataObject.subscribe(list => {
      this.subScheduleList = list;
      localStorage.setItem('rowDataLength', JSON.stringify(this.subScheduleList.length));
    })
  }

  onSelectSchedule(event) {
    this.selectedSchedule = event.item;
    const temp = this.selectedSchedule.id;
    const selectedScheduleNameList = _.filter(this.subScheduleList, function(o) { return o.scheduleId == temp });
    this.subScheduleForm.patchValue({ subScheduleIndex: selectedScheduleNameList.length + 1 });
  }

  openModal(template: TemplateRef<any>) {
    this.resetScheduleForm();
    this.scFormRequiredError = this.scFormSuccess = false;
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  saveSchedule() {
    if (this.scheduleForm.valid && this.childDuplicateMessage == null) {
      this.showConfirmationModal("SaveSchedule");
    } else {
      this.scRequiredErrMsg();
    }
  }

  saveScheduleForm() {
    this.masterService.createRecord("schedules/", this.scheduleForm.value).subscribe(res => {
      this.showInformationModal("SaveSchedule");
      this.modalRef.hide();
      this.scheduleForm.reset();
    }, (error) => {
      throw error;
    });
  }

  resetScheduleForm() {
    this.scFormRequiredError = false;
    this.childDuplicateMessage = null;
    this.childDuplicateMessageParam = null;
    this.duplicateSchIndex = false;
    this.duplicateSchName = false;
    this.scheduleForm.reset();
  }

  checkForDuplicateSubScheduleName() {
    if (!this.nameFlag) {
      this.duplicateSubSchName = this.masterService.hasDataExist(this.subScheduleList, 'subScheduleName', this.subScheduleForm.value.subScheduleName);
      this.getDuplicateErrorMessages();
    }
  }

  checkForDuplicateScheduleName() {
    this.duplicateSchName = this.masterService.hasDataExist(this.scheduleList, 'scheduleName', this.scheduleForm.value.scheduleName);
    this.getDuplicateErrorMessages();
  }

  validateFormOnBlur() {
    this.formRequiredError = false;
    this.duplicateSchIndex = this.masterService.hasDataExist(this.scheduleList, 'scheduleIndex', parseInt(this.scheduleForm.value.scheduleIndex));
    this.getDuplicateErrorMessages();
  }

  getDuplicateErrorMessages(): void {
    if (!this.duplicateSchIndex && !this.duplicateSchName) {
      this.childDuplicateMessage = null;
      this.childDuplicateMessageParam = null;
      this.scFormRequiredError = false;
    }
    if (!this.duplicateSubSchName) {
      this.duplicateMessageParam = null;
      this.duplicateMessage = null;
      this.formRequiredError = false;
    }

    if (this.duplicateSubSchName) {
      this.duplicateMessage = "subschedule.duplicateNameErrorMessage";
      this.duplicateMessageParam = this.subScheduleForm.value.subScheduleName;
    }
    if (this.duplicateSchName && this.duplicateSchIndex) {
      this.childDuplicateMessage = "schedule.duplicateErrorMessage";
    }
    else if (this.duplicateSchIndex) {
      this.childDuplicateMessage = "schedule.duplicateIndexErrorMessage";
      this.childDuplicateMessageParam = this.scheduleForm.value.scheduleIndex;
    }
    else if (this.duplicateSchName) {
      this.childDuplicateMessage = "schedule.duplicateNameErrorMessage";
      this.childDuplicateMessageParam = this.scheduleForm.value.scheduleName;
    }
  }

  saveForm() {
    this.subScheduleForm.value.scheduleId = this.selectedSchedule.id;
    if (this.subScheduleForm.value.id) {
      this.masterService.updateRecord(this.endPoint, this.subScheduleForm.value).subscribe(res => {
        this.showInformationModal("Save");
      }, (error) => {
        throw error;
      });
    } else {
      this.masterService.createRecord(this.endPoint, this.subScheduleForm.value).subscribe(res => {
        this.showInformationModal("Save");
      }, (error) => {
      throw error;
      });
    }
  }

  save() {
    this.formRequiredError = false;
    if (this.subScheduleForm.valid && this.selectedSchedule && this.selectedSchedule.id && this.duplicateMessage == null) {
      this.showConfirmationModal('Save');
    } else {
      this.requiredErrMsg();
    }
  }

  delete() {
    console.log("this.editSubSchedule--", this.editSubSchedule);
    this.masterService.deleteRecord(this.endPoint, this.editSubSchedule.id).subscribe(res => {
      this.showInformationModal("Delete");
    }, (error) => {
      throw error;
    });
    localStorage.removeItem('ag-activeRow');
  }

  successMsg() {
    if(this.isModelWindowView){
      this.callbackOnModelWindowClose.emit();
    }else{
      this.formSuccess = true;
      this.formRequiredError = false;
      this.resetForm();
    }
  }

  requiredErrMsg() {
    if (this.duplicateMessage == null) {
      this.formRequiredError = true;
      this.formSuccess = false;
    }
  }

  scRequiredErrMsg() {
    if (this.childDuplicateMessage == null) {
      this.scFormRequiredError = true;
      this.scFormSuccess = false;
    }
  }

  resetForm() {
    this.loadGridData();
    this.loadScheduleData();
    this.formRequiredError = this.formSuccess = false;
    this.subScheduleForm.reset();
    this.scFormRequiredError = false;
    this.editSubSchedule = null;
    this.nameFlag = false;
    this.deleteFlag = true;
    this.duplicateMessage = null;
    this.childDuplicateMessage = null;
    this.duplicateMessageParam = null;
    this.childDuplicateMessage = null;
    this.childDuplicateMessageParam = null;
    this.duplicateSubSchName = false;
    this.focusField.nativeElement.focus();
  }

  editable(s) {
    this.nameFlag = true;
    this.editSubSchedule = s;
    this.formRequiredError = false;
    this.duplicateMessage = null;
    this.childDuplicateMessage = null;
    this.selectedSchedule = {};
    this.selectedSchedule.id = s.scheduleId;
    this.deleteFlag = !this.editSubSchedule.deleteFlag;
    this.duplicateMessage = null;
    this.duplicateMessageParam = null;
    this.subScheduleForm.reset(s);
  }

  showInformationModal(eventType) {
    var msg;
    var title;
    if (eventType === "Delete") {
      msg = 'subschedule.deleteInformationMessage';
      title = 'Sub-Schedule';
    } else if (eventType === "SaveSchedule") {
      title = 'Schedule';
      msg = 'schedule.saveInformationMessage';
    } else {
      title = 'Sub-Schedule';
      msg = 'subschedule.saveInformationMessage';
    }
    const modal = this.modalService.show(ConfirmationModelDialogComponent);
    (<ConfirmationModelDialogComponent>modal.content).showInformationModal(
      title,
      msg,
      ''
    );
    (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => {
      if (eventType === "SaveSchedule") {
        this.loadScheduleData();
      } else {
        this.successMsg();
      }
    });
  }

  showConfirmationModal(eventType): void {
    var msg;
    var title;
    if (eventType === "Delete") {
      title = 'Sub-Schedule';
      msg = 'subschedule.deleteConfirmationMessage';
    } else if (eventType === "SaveSchedule") {
      title = 'Schedule';
      msg = 'schedule.saveConfirmationMessage';
    } else {
      title = 'Sub-Schedule';
      msg = 'subschedule.saveConfirmationMessage';
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
        } else if (eventType === "SaveSchedule") {
          this.saveScheduleForm();
        } else {
          this.saveForm();
        }
      }
    });
  }

}
