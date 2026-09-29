import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectMunicipalities, selectMunicipalitiesLoadingState} from '../../../../state/map/reducers/data-download-region.reducer';
import {DataDownloadSelectMunicipalityDialogComponent} from './data-download-select-municipality-dialog.component';

describe('DataDownloadSelectMunicipalityDialogComponent', () => {
  const dialogRef = {close: vi.fn()};
  let fixture: ComponentFixture<DataDownloadSelectMunicipalityDialogComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DataDownloadSelectMunicipalityDialogComponent],
      providers: [provideMockStore(), {provide: MatDialogRef, useValue: dialogRef}],
    })
      .overrideComponent(DataDownloadSelectMunicipalityDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectMunicipalities, [
      {bfsNo: 261, name: 'Zürich'},
      {bfsNo: 191, name: 'Winterthur'},
    ]);
    store.overrideSelector(selectMunicipalitiesLoadingState, 'loaded');
    fixture = TestBed.createComponent(DataDownloadSelectMunicipalityDialogComponent);
  });

  it('filters municipalities case-insensitively', () => {
    fixture.componentInstance.filterValue.set(' WINTER ');
    expect(fixture.componentInstance.filteredMunicipalities()).toEqual([{bfsNo: 191, name: 'Winterthur'}]);
  });

  it('renders municipality names and closes without a selection on cancel', () => {
    expect(fixture.componentInstance.getMunicipalityName({bfsNo: 261, name: 'Zürich'})).toBe('Zürich');
    expect(fixture.componentInstance.getMunicipalityName(null)).toBe('');
    fixture.componentInstance.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
