
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ConfirmationModelDialogComponent } from '../../commonComponents/confirmation-model-dialog/confirmation-model-dialog.component';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  public dataObject: Subject<any> = new Subject<any>();
  public resposeArray: any = [];
  gridDataList: Observable<any[]> = this.dataObject.asObservable().distinctUntilChanged();
  private _localUrl: string = "./assets/jsonData/commonData.json"

  constructor(private httpClient: HttpClient, private modalService: BsModalService) { }

  END_POINT = 'https://eskaysoftapi.synectiks.com/api/v1/';
  SETTINGS_END_POINT = 'https://eskaysoftapi.synectiks.com/api/';

  getData(tragetServiceName) {

    if(tragetServiceName == "changePassword/" || tragetServiceName == "auth/createUser/"
    || tragetServiceName.includes('users/')  || tragetServiceName == "updateUser/"){
      return this.httpClient.get(this.SETTINGS_END_POINT + tragetServiceName).subscribe(res => {
        this.resposeArray = res;
        this.dataObject.next(this.resposeArray);
      },error =>     {
        this.resposeArray = error;
        this.dataObject.next({"error_status":this.resposeArray.status, "error_message":this.resposeArray.message});
      } );

    }else{
      return this.httpClient.get(this.END_POINT + tragetServiceName).subscribe(res => {
        this.resposeArray = res;
        this.dataObject.next(this.resposeArray);
      },error =>     {
        this.resposeArray = error;
        this.dataObject.next({"error_status":this.resposeArray.status, "error_message":this.resposeArray.message});
      } );
    }
  }

  getDataNew(tragetServiceName): Observable<any> { // for future reference
    return this.httpClient.get(this.END_POINT + tragetServiceName).map(res => {
      this.dataObject.next(res);
    });
  }

  getParentData(tragetServiceName) {
    if(tragetServiceName == "changePassword/" || tragetServiceName == "auth/createUser/"
    || tragetServiceName == "users/" || tragetServiceName == "updateUser/"){
      return this.httpClient.get(this.SETTINGS_END_POINT + tragetServiceName);
    }else{
        return this.httpClient.get(this.END_POINT + tragetServiceName);
    }
  }

  getLocalJsonData() {
    return this.httpClient.get(this._localUrl);
  }

  createRecord(tragetServiceName, requestObj) {
    if(tragetServiceName == "changePassword/"|| tragetServiceName == "auth/createUser/"
    || tragetServiceName == "users/" || tragetServiceName == "updateUser/"){
      return this.httpClient.post(this.SETTINGS_END_POINT + tragetServiceName, requestObj);
    }else{
      return this.httpClient.post(this.END_POINT + tragetServiceName, requestObj);
    }
  }

  updateRecord(tragetServiceName, requestObj) {
    if(tragetServiceName == "changePassword/"|| tragetServiceName == "auth/createUser/"
    || tragetServiceName == "users/" || tragetServiceName == "updateUser/"){
      return this.httpClient.put(this.SETTINGS_END_POINT + tragetServiceName, requestObj);
    }else{
      return this.httpClient.put(this.END_POINT + tragetServiceName, requestObj);
    }
  }

  deleteRecord(tragetServiceName, requestObj) {
    if(tragetServiceName == "changePassword/"|| tragetServiceName == "auth/createUser/"
    || tragetServiceName == "users/" || tragetServiceName == "updateUser/"){
      return this.httpClient.delete(this.SETTINGS_END_POINT + tragetServiceName + requestObj);
    }else{
      return this.httpClient.delete(this.END_POINT + tragetServiceName + requestObj);
    }

  }

  hasDataExist(listObj, key, value): boolean {
    if(_.isString(value)){
          return _.find(listObj, function(o) { return _.get(o, key).toLowerCase() == value.toLowerCase() }) != undefined;
      }
      else{
          return _.find(listObj, function(o) { return _.get(o, key) == value }) != undefined;
      }
  }

  mergeObjects(arr1, arr2, key1, key2): any[]{
    return  _.map(arr1, function(item) {
      return _.merge(item, _.find(arr2, function(o) { return _.get(item, key1) == _.get(o, key2) }));
    });
  }

  verifyDuplicates(valList, val, isString:boolean):boolean{
    return valList.some((element)=>{
      if(isString){
        return element.toLowerCase() === val.toLowerCase();
      }else {
        return element === val;
      }

    });
  }


  /*showConfirmationModal(): boolean {
    var resltValue = false;
       const modal = this.modalService.show(ConfirmationModelDialogComponent);
       (<ConfirmationModelDialogComponent>modal.content).showConfirmationModal(
           'Title of modal',
           'Body text',
           'green'
       );

      (<ConfirmationModelDialogComponent>modal.content).onClose.subscribe(result => {

         resltValue = result;

      });
      return resltValue;
   }*/
}
