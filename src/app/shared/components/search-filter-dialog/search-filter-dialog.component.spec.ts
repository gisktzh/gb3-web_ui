import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectFilterGroups} from '../../../state/app/reducers/search.reducer';
import {MatDialogRef} from '@angular/material/dialog';
import {SearchFilterDialogComponent} from './search-filter-dialog.component';
import {SearchFilterGroup} from '../../interfaces/search-filter-group.interface';
import {SearchActions} from 'src/app/state/app/actions/search.actions';

describe('SearchFilterDialogComponent', () => {
  let component: SearchFilterDialogComponent;
  let fixture: ComponentFixture<SearchFilterDialogComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const defaultFilters: SearchFilterGroup[] = [
    {
      label: 'First group',
      useDynamicActiveMapItemsFilter: false,
      filters: [
        {
          label: 'Useful links',
          isActive: false,
          type: 'usefulLinks',
        },
        {
          label: 'Maps',
          isActive: false,
          type: 'maps',
        },
      ],
    },
    {
      label: 'Second group',
      useDynamicActiveMapItemsFilter: true,
      filters: [
        {
          label: 'FAQs',
          isActive: false,
          type: 'faqs',
        },
        {
          label: 'Parcels',
          isActive: true,
          type: 'parcels',
        },
        {
          label: 'GVZ',
          isActive: false,
          type: 'gvz',
        },
      ],
    },
    {
      label: 'Third group',
      useDynamicActiveMapItemsFilter: false,
      filters: [],
    },
  ];

  const dialogRefMock: Partial<MatDialogRef<SearchFilterDialogComponent>> = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterDialogComponent],
      providers: [{provide: MatDialogRef, useValue: dialogRefMock}, provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectFilterGroups, defaultFilters);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(SearchFilterDialogComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const inputs = compiled.querySelectorAll('input');
    const groups = compiled.querySelectorAll('accordion-item');

    expect(inputs.length).toBe(5);
    expect(Array.from(inputs).filter((i) => i.checked).length).toBe(1);

    expect(groups.length).toBe(2);
    expect(groups[0].textContent).toContain(defaultFilters[0].label);
    expect(groups[1].textContent).toContain(defaultFilters[1].label);
  });

  describe('filter toggling', () => {
    it('toggles a filter on the store when the public component API is used', () => {
      const groupLabel = 'First group';
      const filterLabel = 'Useful links';
      const isActive = true;
      component.toggleFilter(groupLabel, filterLabel, isActive);
      expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.setFilterValue({groupLabel, filterLabel, isActive}));
    });

    it('toggles a filter on the store when clicked', () => {
      const inputs = compiled.querySelectorAll('input');

      inputs[2].click();
      expect(storeDispatchSpy).toHaveBeenCalledWith(
        SearchActions.setFilterValue({
          groupLabel: defaultFilters[1].label,
          filterLabel: defaultFilters[1].filters[0].label,
          isActive: !defaultFilters[1].filters[0].isActive,
        }),
      );
    });
  });

  describe('filter resetting', () => {
    it('resets filters on the store when the public component API is used', () => {
      component.resetFilters();
      expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.resetFilters());
    });

    it('resets filters on the store when the respective button is pressed', () => {
      const resetButton = Array.from(compiled.querySelectorAll('button')).filter((b) => b.textContent.includes('Zurücksetzen'))[0];
      expect(resetButton).toBeDefined();

      resetButton.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.resetFilters());
    });
  });

  describe('closing', () => {
    it('closes when the public component API is used', () => {
      component.close();
      expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('closes when the respective button is pressed', () => {
      const closeButton = Array.from(compiled.querySelectorAll('button')).filter((b) => b.textContent.includes('Schliessen'))[0];
      expect(closeButton).toBeDefined();

      closeButton.click();

      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });
});
