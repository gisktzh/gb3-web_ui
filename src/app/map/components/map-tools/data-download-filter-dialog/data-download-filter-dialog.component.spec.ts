import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DataDownloadProductActions} from '../../../../state/map/actions/data-download-product.actions';
import {DataDownloadFilterDialogComponent} from './data-download-filter-dialog.component';

describe('DataDownloadFilterDialogComponent', () => {
  const dialogRef = {close: vi.fn()};
  let fixture: ComponentFixture<DataDownloadFilterDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataDownloadFilterDialogComponent],
      providers: [provideMockStore(), {provide: MatDialogRef, useValue: dialogRef}],
    })
      .overrideComponent(DataDownloadFilterDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DataDownloadFilterDialogComponent);
  });

  it('toggles and resets filters through store actions', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.toggleFilter('format', 'WMS');
    fixture.componentInstance.resetFilters();
    expect(dispatch).toHaveBeenCalledWith(DataDownloadProductActions.toggleFilter({category: 'format', value: 'WMS'}));
    expect(dispatch).toHaveBeenCalledWith(DataDownloadProductActions.resetFilters());
  });

  it('tracks filters by label and closes', () => {
    expect(fixture.componentInstance.trackByFilterLabel(0, {label: 'Format'} as never)).toBe('Format');
    fixture.componentInstance.close();
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
