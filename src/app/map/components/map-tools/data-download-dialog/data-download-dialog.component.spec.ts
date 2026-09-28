import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {DataDownloadProductActions} from '../../../../state/map/actions/data-download-product.actions';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {DataDownloadEmailDialogComponent} from '../data-download-email-dialog/data-download-email-dialog.component';
import {DataDownloadFilterDialogComponent} from '../data-download-filter-dialog/data-download-filter-dialog.component';
import {DataDownloadDialogComponent} from './data-download-dialog.component';

describe('DataDownloadDialogComponent', () => {
  const dialog = {open: vi.fn()};
  let fixture: ComponentFixture<DataDownloadDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DataDownloadDialogComponent],
      providers: [provideMockStore(), {provide: MatDialog, useValue: dialog}],
    })
      .overrideComponent(DataDownloadDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DataDownloadDialogComponent);
  });

  it('dispatches search and filter interactions', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.setFilterTerm('roads');
    fixture.componentInstance.toggleFilter('format', 'WMS');
    fixture.componentInstance.clearFilterTerm();
    expect(dispatch).toHaveBeenCalledWith(DataDownloadProductActions.setFilterTerm({term: 'roads'}));
    expect(dispatch).toHaveBeenCalledWith(DataDownloadProductActions.toggleFilter({category: 'format', value: 'WMS'}));
    expect(dispatch).toHaveBeenCalledWith(DataDownloadProductActions.clearFilterTerm());
  });

  it('opens the filter and email dialogs and can close the drawer', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.openFilterWindow();
    fixture.componentInstance.openDownloadDialog();
    fixture.componentInstance.cancel();
    expect(dialog.open).toHaveBeenCalledWith(
      DataDownloadFilterDialogComponent,
      expect.objectContaining({panelClass: PanelClass.ApiWrapperDialog}),
    );
    expect(dialog.open).toHaveBeenCalledWith(DataDownloadEmailDialogComponent, expect.objectContaining({data: {orderEmail: undefined}}));
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.hideMapSideDrawerContent());
  });
});
