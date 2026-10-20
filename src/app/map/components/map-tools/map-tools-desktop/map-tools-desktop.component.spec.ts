import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconRegistry} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {TypedTourAnchorDirective} from '../../../../shared/directives/typed-tour-anchor.directive';
import {QueryModeActions} from '../../../../state/map/actions/query-mode.actions';
import {selectReady} from '../../../../state/map/reducers/map-config.reducer';
import {selectToolMenuVisibility} from '../../../../state/map/reducers/map-ui.reducer';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';
import {selectIsStatisticsAvailable} from '../../../../state/map/selectors/statistics-availability.selector';
import {MapToolsDesktopComponent} from './map-tools-desktop.component';

describe('MapToolsDesktopComponent statistics tooltip', () => {
  let fixture: ComponentFixture<MapToolsDesktopComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapToolsDesktopComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(MapToolsDesktopComponent, {remove: {imports: [TypedTourAnchorDirective]}})
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectReady, true);
    store.overrideSelector(selectIsStatisticsAvailable, false);
    store.overrideSelector(selectToolMenuVisibility, undefined);
    store.overrideSelector(selectActiveTool, undefined);
    vi.spyOn(TestBed.inject(MatIconRegistry), 'getNamedSvgIcon').mockImplementation(() =>
      of(document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
    );
    fixture = TestBed.createComponent(MapToolsDesktopComponent);
  });

  afterEach(() => store.resetSelectors());

  function statisticsButton() {
    return fixture.debugElement.query(By.css('[data-test-id="map-select-statistic"]'));
  }

  function wrapperTooltip() {
    return fixture.debugElement.query(By.css('.map-tools-desktop__list__statistics-tooltip')).injector.get(MatTooltip);
  }

  it.each([
    {ready: false, available: false},
    {ready: false, available: true},
    {ready: true, available: false},
    {ready: true, available: true},
  ])('uses one tooltip with the correct message when ready=$ready and available=$available', ({ready, available}) => {
    store.overrideSelector(selectReady, ready);
    store.overrideSelector(selectIsStatisticsAvailable, available);
    store.refreshState();
    fixture.detectChanges();

    const button = statisticsButton();
    const enabled = ready && available;
    expect(button.nativeElement.disabled).toBe(!enabled);
    expect(button.nativeElement.getAttribute('aria-label')).toBe('Statistik-Abfrage');
    expect(wrapperTooltip().disabled).toBe(enabled);
    expect(wrapperTooltip().message).toBe(
      ready && !available ? 'Für die aktiven Kartenebenen sind keine Statistiken verfügbar.' : 'Statistik-Abfrage',
    );
    expect(button.injector.get(MatTooltip).disabled).toBe(!enabled);
    expect(button.injector.get(MatTooltip).message).toBe('Statistik-Abfrage');
  });

  it('updates the tooltip and native disabled state as supported layers are added and removed', () => {
    const availability = store.overrideSelector(selectIsStatisticsAvailable, false);
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');

    statisticsButton().nativeElement.click();
    expect(dispatch).not.toHaveBeenCalled();
    expect(wrapperTooltip().message).toBe('Für die aktiven Kartenebenen sind keine Statistiken verfügbar.');

    availability.setResult(true);
    store.refreshState();
    fixture.detectChanges();
    expect(wrapperTooltip().disabled).toBe(true);
    expect(statisticsButton().injector.get(MatTooltip).disabled).toBe(false);
    statisticsButton().nativeElement.click();
    expect(dispatch).toHaveBeenCalledWith(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));

    availability.setResult(false);
    store.refreshState();
    fixture.detectChanges();
    expect(statisticsButton().nativeElement.disabled).toBe(true);
    expect(wrapperTooltip().disabled).toBe(false);
    expect(wrapperTooltip().message).toBe('Für die aktiven Kartenebenen sind keine Statistiken verfügbar.');
  });
});
