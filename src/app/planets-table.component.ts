import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Table, TableDescription, FilterService, HlcClrTableComponent } from '@ng-holistic/clr-list';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';

// Provide table UI definition in js object
const table: TableDescription = {
  cols: [
    {
      id: 'name',
      title: 'Name',
      sort: true
    },
    {
      id: 'population',
      title: 'Population',
      sort: false
    }
  ]
};

@Component({
  selector: 'my-planets-table',
  template: `
    <form [formGroup]="filterForm" class="clr-form">
      <label class="clr-control-label">Filter by name</label>
      <input class="clr-input" formControlName="name" (change)="onFilter()"/>
    </form>
    <hlc-clr-table [table]="table" [dataProvider]="dataProvider"></hlc-clr-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // We must provide FilterService on the component in order to hlc-clr-table could use it
    FilterService
  ]
})
export class TableComponent {

  @ViewChild(HlcClrTableComponent, { static: true }) tableComponent: HlcClrTableComponent;

  readonly table = table;
  readonly dataProvider: Table.Data.DataProvider;
  readonly filterForm: FormGroup;

  constructor(
    httpClient: HttpClient, 
    // FilterService will be used by the table component to get current filter value
    filterService: FilterService
  ) {

    this.filterForm = new FormGroup({name: new FormControl()});

    // link filter form to the table, now filter value for this table will be used to load data
    filterService.setForm(this.filterForm);

    this.dataProvider = {
      load(state: any) {
        // In general it is not a good idea to use http service directly from Component
        // real applications should always provide data access layer which make requests
        // to the rest API services and then returns data in application model structures 
        // not in raw dto object.
        // Correct architecture requires more code, here we simplify things for the sample
        // and map dto models to component models directly without intermediate application layer

        // state value here already in app model format, see app.module
        const { page, filters } = state;
        return httpClient
          .get('https://swapi.co/api/planets', {
            params: { page, search: filters.name || '' }
          }).pipe(
            catchError(err => {
              return throwError('SWAPI returns error');
            })
          );
      }
    };
  }

  onFilter() {
    // refresh state of the component
    // it will take filter value from the linked form from above
    this.tableComponent.refreshStateForce();
  }
}
