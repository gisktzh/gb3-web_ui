import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {DataDownloadSelectionToolsComponent} from './data-download-selection-tools.component';

describe('DataDownloadSelectionToolsComponent', () => {
  let fixture: ComponentFixture<DataDownloadSelectionToolsComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataDownloadSelectionToolsComponent],
      providers: [provideMockStore(), {provide: MatDialog, useValue: {open: vi.fn()}}],
    })
      .overrideComponent(DataDownloadSelectionToolsComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DataDownloadSelectionToolsComponent);
  });

  it.each([
    ['toggleCircleSelecting', 'select-circle'],
    ['togglePolygonSelecting', 'select-polygon'],
    ['toggleRectangleSelecting', 'select-rectangle'],
    ['toggleSectionSelecting', 'select-section'],
    ['toggleFederationSelecting', 'select-federation'],
    ['toggleCantonSelecting', 'select-canton'],
    ['toggleMunicipalitySelecting', 'select-municipality'],
  ] as const)('%s activates %s', (method, tool) => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance[method]();
    expect(dispatch).toHaveBeenCalledWith(ToolActions.activateTool({tool}));
  });
});
