import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TableComponent } from './planets-table.component';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { ClrDatagridStateInterface } from '@clr/angular';
import {
  HlcClrTableModule,
  HLC_CLR_TABLE_DATA_PROVIDER_CONFIG,
  HLC_CLR_TABLE_PAGINATOR_ITEMS,
  PaginatorItems,
  Table,
  TableDataProviderConfig
} from '@ng-holistic/clr-list';

// CLARITY ICONS DEPENDENCY: THIS REQUIRED ONLY IN STACKBLITZ SEE #700
import '@clr/icons';
import '@clr/icons/shapes/all-shapes';
//

// Correct architecture requires more code, here we simplify things for the sample
// and map dto models to component models directly without intermediate application models
const tableDataProviderConfig: TableDataProviderConfig = {
  // map component model to dto model for requests
  mapState(state: ClrDatagridStateInterface): any {
    // conver filters from component model to app model
    const filters = state.filters.reduce(
      (acc, v) => ({ ...acc, [v.property]: v.value }), {}
    );
    const page = state.page && state.page.from / state.page.size + 1;
    return { page: page ? page.toString() : '1', filters };
  },
  // map dto response object to component model object
  mapResult(response: any): Table.Data.Result {
    return {
      // here we just fake required id field for the row 
      rows: response.results.map((m, i) => ({ id: i, ...m })),
      paginator: {
        pageIndex: response.next ?
          parseInt(response.next.split('page=')[1]) - 1 :
          (response.previous ? parseInt(response.previous.split('page=')[1]) + 1 : 0),
        pageSize: 10,
        length: response.count
      }
    };
  }
};

@NgModule({
  imports: [BrowserModule, HttpClientModule, HlcClrTableModule.forRoot(), ReactiveFormsModule],
  declarations: [AppComponent, TableComponent],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HLC_CLR_TABLE_DATA_PROVIDER_CONFIG,
      useValue: tableDataProviderConfig
    }
  ]
})
export class AppModule { }
