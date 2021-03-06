import { PurchaseRouter } from './purchase.router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, NgModel, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule, TypeaheadModule, AccordionModule, TabsModule  } from 'ngx-bootstrap';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import { SharedmoduleModule } from 'src/app/sharedmodule/sharedmodule.module';

import { PurchaseDashboardComponent } from './purchase-dashboard/purchase-dashboard.component';
import { InternalStockAdjComponent } from './internal-stock-adj/internal-stock-adj.component';
import { PurchaseReturnsComponent } from './purchase-returns/purchase-returns.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { ReportsComponent } from './reports/reports.component';

@NgModule({
  imports: [
    CommonModule,
    PurchaseRouter,
    ReactiveFormsModule,
    SharedmoduleModule,
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    TabsModule.forRoot(),
    FormsModule,
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
  ],
  providers: [NgForm,
    NgModel,
    FormsModule
  ],
  declarations: [ PurchaseDashboardComponent, InternalStockAdjComponent, PurchaseReturnsComponent, PurchaseOrderComponent, ReportsComponent]
})

export class PurchaseModule { }
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}
