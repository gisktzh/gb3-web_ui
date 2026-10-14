import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MAP_SERVICE} from '../../../../app.tokens';
import {ConfigService} from '../../../../shared/services/config.service';
import {Gb3PrintService} from '../../../../shared/services/apis/gb3/gb3-print.service';
import {PrintSettingsOptionsProviderService} from '../../../services/print-settings-options-provider.service';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {PrintActions} from '../../../../state/map/actions/print.actions';
import {PrintDialogComponent} from './print-dialog.component';

describe('PrintDialogComponent', () => {
  const printService = {createPrintCreation: vi.fn(), getReportSizing: vi.fn()};
  const optionsProvider = {
    getUnqiueOptions: vi.fn(() => []),
    filterOptions: vi.fn(() => ({fileFormat: ['pdf'], dpi: [300], layout: ['A4'], reportOrientation: ['portrait']})),
  };
  let fixture: ComponentFixture<PrintDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [PrintDialogComponent],
      providers: [
        provideMockStore(),
        {provide: ConfigService, useValue: {mapConfig: {mapScaleConfig: {maxScale: 100, minScale: 100000}}}},
        {provide: Gb3PrintService, useValue: printService},
        {provide: PrintSettingsOptionsProviderService, useValue: optionsProvider},
        {provide: MAP_SERVICE, useValue: {getInternalDrawingLayerGraphics: vi.fn(() => [])}},
      ],
    })
      .overrideComponent(PrintDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('requests print capabilities when the dialog is created', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(PrintDialogComponent);
    expect(dispatch).toHaveBeenCalledWith(PrintActions.fetchCapabilitiesValidCombinations());
  });

  it('does not submit an incomplete print form', () => {
    fixture = TestBed.createComponent(PrintDialogComponent);
    const dispatch = vi.spyOn(store, 'dispatch');
    dispatch.mockClear();
    fixture.componentInstance.print();
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({type: PrintActions.requestPrintCreation.type}));
    expect(printService.createPrintCreation).not.toHaveBeenCalled();
  });

  it('closes the print drawer through the map UI action', () => {
    fixture = TestBed.createComponent(PrintDialogComponent);
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.close();
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.hideMapSideDrawerContent());
  });
});
