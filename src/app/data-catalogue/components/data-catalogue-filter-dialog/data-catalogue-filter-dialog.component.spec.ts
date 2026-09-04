import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectFilters} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {MatDialogRef} from '@angular/material/dialog';
import {DataCatalogueFilterDialogComponent} from './data-catalogue-filter-dialog.component';
import {DataCatalogueActions} from 'src/app/state/data-catalogue/actions/data-catalogue.actions';
import {DataCatalogueFilter} from 'src/app/shared/interfaces/data-catalogue-filter.interface';

describe('DataCatalogueFilterDialogComponent', () => {
  let component: DataCatalogueFilterDialogComponent;
  let fixture: ComponentFixture<DataCatalogueFilterDialogComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const dialogRefMock: Partial<MatDialogRef<DataCatalogueFilterDialogComponent>> = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCatalogueFilterDialogComponent],
      providers: [{provide: MatDialogRef, useValue: dialogRefMock}, provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectFilters, [
      {
        key: 'name',
        label: 'Random names',
        filterValues: [
          {
            value: 'Alice',
            isActive: false,
          },
          {
            value: 'Bob',
            isActive: false,
          },
        ],
      },
    ]);
    store.refreshState();
    fixture = TestBed.createComponent(DataCatalogueFilterDialogComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render one accordion and for each filter and one checkbox for each filter value', () => {
      const filters: DataCatalogueFilter[] = [
        {
          key: 'name',
          label: 'Random names',
          filterValues: [
            {
              value: 'Alice',
              isActive: false,
            },
            {
              value: 'Bob',
              isActive: false,
            },
            {
              value: 'Charles',
              isActive: true,
            },
          ],
        },
        {
          key: 'flags',
          label: 'Maritime flags',
          filterValues: [
            {
              value: 'Per saltire or, sable, gules and azure',
              isActive: true,
            },
            {
              value: 'Per pale argent and gules',
              isActive: true,
            },
          ],
        },
      ];

      store.overrideSelector(selectFilters, filters);
      store.refreshState();

      fixture.detectChanges();

      const accordionItems = compiled.querySelectorAll('accordion-item');

      expect(accordionItems.length).toBe(2);
      expect(compiled.querySelectorAll('.filter-dialog-content__wrapper__checkbox').length).toBe(5);

      filters.forEach((filter, accordionIndex) => {
        const currentAccordionItem = accordionItems[accordionIndex];
        const allCurrentCheckboxes = currentAccordionItem.querySelectorAll('.filter-dialog-content__wrapper__checkbox');

        expect(currentAccordionItem.querySelector('h4')?.textContent.trim()).toBe(filter.label);
        expect(allCurrentCheckboxes.length).toBe(filter.filterValues.length);

        filter.filterValues.forEach((value, checkboxIndex) => {
          expect(allCurrentCheckboxes[checkboxIndex].textContent.trim()).toBe(value.value);
          expect(allCurrentCheckboxes[checkboxIndex].querySelector('input')?.checked).toBe(value.isActive);
        });
      });
    });
  });

  describe('closing', () => {
    it('should close when the public close API is called', () => {
      component.close();
      expect(dialogRefMock.close).toHaveBeenCalledOnce();
    });

    it('should close when the `Close` button is clicked', () => {
      const buttons = compiled.querySelectorAll('button');
      expect(buttons.length).toBe(2);

      buttons[1].click();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('filtering', () => {
    it('should filter based on input via public API', () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');

      component.toggleFilter('name', 'Alice');

      expect(storeDispatchSpy).toHaveBeenCalledExactlyOnceWith(DataCatalogueActions.toggleFilter({key: 'name', value: 'Alice'}));
    });

    it('should filter based on input via component input', () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');

      const checkboxes = compiled.querySelectorAll<HTMLInputElement>('.filter-dialog-content__wrapper__checkbox input');
      expect(checkboxes.length).toBe(2);
      checkboxes[0].click();
      expect(storeDispatchSpy).toHaveBeenCalledExactlyOnceWith(DataCatalogueActions.toggleFilter({key: 'name', value: 'Alice'}));

      storeDispatchSpy.mockReset();

      checkboxes[1].click();
      expect(storeDispatchSpy).toHaveBeenCalledExactlyOnceWith(DataCatalogueActions.toggleFilter({key: 'name', value: 'Bob'}));
    });
  });
});
