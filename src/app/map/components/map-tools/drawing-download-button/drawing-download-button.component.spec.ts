import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {provideMockStore} from '@ngrx/store/testing';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {DrawingDownloadDialogComponent} from '../drawing-download-dialog/drawing-download-dialog.component';
import {DrawingDownloadButtonComponent} from './drawing-download-button.component';

describe('DrawingDownloadButtonComponent', () => {
  const dialog = {open: vi.fn()};
  let fixture: ComponentFixture<DrawingDownloadButtonComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DrawingDownloadButtonComponent],
      providers: [provideMockStore(), {provide: MatDialog, useValue: dialog}],
    })
      .overrideComponent(DrawingDownloadButtonComponent, {set: {template: '', imports: []}})
      .compileComponents();
    fixture = TestBed.createComponent(DrawingDownloadButtonComponent);
  });

  it('opens the drawing export dialog without stealing focus', () => {
    fixture.componentInstance.openDownloadDialog();
    expect(dialog.open).toHaveBeenCalledWith(DrawingDownloadDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      autoFocus: false,
    });
  });
});
