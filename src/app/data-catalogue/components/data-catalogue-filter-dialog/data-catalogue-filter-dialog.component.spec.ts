import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {selectFilters} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {DataCatalogueFilterDialogComponent} from './data-catalogue-filter-dialog.component';

describe('DataCatalogueFilterDialogComponent', () => {
  let fixture: ComponentFixture<DataCatalogueFilterDialogComponent>;
  let element: HTMLElement;
  let store: MockStore;
  const close = vi.fn();

  const filters: DataCatalogueFilter[] = [
    {
      key: 'type',
      label: 'Kategorie',
      filterValues: [
        {value: 'Datensatz', isActive: false},
        {value: 'Karte', isActive: true},
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCatalogueFilterDialogComponent],
      providers: [{provide: MatDialogRef, useValue: {close}}, provideMockStore({selectors: [{selector: selectFilters, value: filters}]})],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DataCatalogueFilterDialogComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders filter values and their active state', () => {
    const checkboxes = element.querySelectorAll<HTMLInputElement>('mat-checkbox input');
    expect(element.querySelector('accordion-item')?.textContent).toContain('Kategorie');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
  });

  it('dispatches toggle and reset actions from user controls', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    element.querySelector<HTMLInputElement>('mat-checkbox input')?.click();
    expect(dispatch).toHaveBeenCalledWith(DataCatalogueActions.toggleFilter({key: 'type', value: 'Datensatz'}));

    const resetButton = Array.from(element.querySelectorAll('button')).find((button) => button.textContent?.includes('Zurücksetzen'));
    resetButton?.click();
    expect(dispatch).toHaveBeenCalledWith(DataCatalogueActions.resetFilters());
  });

  it('closes through the dialog action', () => {
    const closeButton = Array.from(element.querySelectorAll('button')).find((button) => button.textContent?.includes('Schliessen'));
    closeButton?.click();

    expect(close).toHaveBeenCalledOnce();
  });
});
