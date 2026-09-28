import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {DrawingSettingsDialogComponent} from '../drawing-settings-dialog/drawing-settings-dialog.component';
import {DrawingsImportDialogComponent} from '../drawings-import-dialog/drawings-import-dialog.component';
import {DrawingToolsComponent} from './drawing-tools.component';

describe('DrawingToolsComponent', () => {
  const dialog = {open: vi.fn()};
  let fixture: ComponentFixture<DrawingToolsComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DrawingToolsComponent],
      providers: [provideMockStore(), {provide: MatDialog, useValue: dialog}],
    })
      .overrideComponent(DrawingToolsComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DrawingToolsComponent);
  });

  it.each([
    ['togglePointDrawing', 'draw-point'],
    ['toggleLineDrawing', 'draw-line'],
    ['togglePolygonDrawing', 'draw-polygon'],
    ['toggleRectangleDrawing', 'draw-rectangle'],
    ['toggleCircleDrawing', 'draw-circle'],
    ['toggleTextDrawing', 'draw-text'],
    ['toggleSymbolDrawing', 'draw-symbol'],
  ] as const)('%s activates %s', (method, tool) => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance[method]();
    expect(dispatch).toHaveBeenCalledWith(ToolActions.activateTool({tool}));
  });

  it('opens settings and import with their dialog constraints', () => {
    fixture.componentInstance.openSettingsDialog();
    fixture.componentInstance.openImportDrawingsDialog();
    expect(dialog.open).toHaveBeenCalledWith(
      DrawingSettingsDialogComponent,
      expect.objectContaining({
        panelClass: PanelClass.ApiWrapperDialog,
        maxWidth: 420,
      }),
    );
    expect(dialog.open).toHaveBeenCalledWith(
      DrawingsImportDialogComponent,
      expect.objectContaining({
        panelClass: PanelClass.ApiWrapperDialog,
        maxWidth: 750,
      }),
    );
  });
});
