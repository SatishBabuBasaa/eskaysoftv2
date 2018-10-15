import { Component, OnInit, Input, TemplateRef, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModelDialogComponent } from '../confirmation-model-dialog/confirmation-model-dialog.component';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html'
})
export class ButtonsComponent implements OnInit {

  @Input() isBtnDeleteDisable: boolean = false;
  @Input() hideSaveBtn: boolean = false;
  @Input() hideDeleteBtn: boolean = false;
  @Input() deleteConfirmMsg: string = null;
  @Input() saveConfirmMsg: string = null;
  @Input() deleteInfoMsg: string = null;
  @Input() saveInfoMsg: string = null;
  @Input() formObj: any;
  @Input() title: string = null;
  @Input() duplicateMessage: string = null;
  @Output() saveRecord: EventEmitter<null> = new EventEmitter();
  @Output() deleteRecord: EventEmitter<null> = new EventEmitter();
  @Output() displayErrorMessages: EventEmitter<null> = new EventEmitter();
  @Output() afterSuccess: EventEmitter<null> = new EventEmitter();
  @Output() resetForm: EventEmitter<null> = new EventEmitter();

  private displayMsg: string = null;

  constructor(
    private translate: TranslateService,
    private modalService: BsModalService) { translate.setDefaultLang('messages.en'); }

  ngOnInit() {
  }

  reset() {
    this.resetForm.emit();
  }

  saveForm() {
    if (this.formObj.valid && this.duplicateMessage == null) {
      this.showConfirmationModal("Save");
    } else {
      this.displayErrorMessages.emit();
    }
  }

  showInformationModal(eventType) {
    if (eventType === "Delete") {
      this.displayMsg = this.deleteInfoMsg;
    } else {
      this.displayMsg = this.saveInfoMsg;
    }
    const modal = this.modalService.show(ConfirmationModelDialogComponent);
    (<ConfirmationModelDialogComponent>modal.content).showInformationModal(
      this.title,
      this.displayMsg,
      ''
    );
    (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => { this.afterSuccess.emit(); });
  }

  showConfirmationModal(eventType): void {
    if (eventType === "Delete") {
      this.displayMsg = this.deleteConfirmMsg;
    } else {
      this.displayMsg = this.saveConfirmMsg;
    }
    const modal = this.modalService.show(ConfirmationModelDialogComponent);
    (<ConfirmationModelDialogComponent>modal.content).showConfirmationModal(
      this.title,
      this.displayMsg,
      'green',
      ''
    );

    (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => {
      if (result) {
        if (eventType === "Delete") {
          this.deleteRecord.emit();
        } else {
          this.saveRecord.emit();
        }
      }
    });
  }

}
