import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {StatisticsActions} from '../../../../state/map/actions/statistics.actions';
import {selectData as selectGeneralInfoData} from '../../../../state/map/reducers/general-info.reducer';
import {
  selectAreaInSquareMeters,
  selectData,
  selectGeometry,
  selectLoadingState,
  selectMode,
  selectRadiusInMeters,
} from '../../../../state/map/reducers/statistics.reducer';
import {maximumStatisticsRadiusInMeters} from '../../../../shared/configs/statistics.config';
import {StatisticsComponent} from './statistics.component';

describe('StatisticsComponent area validation', () => {
  let fixture: ComponentFixture<StatisticsComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsComponent],
      providers: [provideMockStore()],
    }).compileComponents();
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectGeneralInfoData, undefined);
    store.overrideSelector(selectAreaInSquareMeters, 42_000_000);
    store.overrideSelector(selectData, []);
    store.overrideSelector(selectGeometry, undefined);
    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectMode, 'umkreis');
    store.overrideSelector(selectRadiusInMeters, 500);
    fixture = TestBed.createComponent(StatisticsComponent);
    fixture.detectChanges();
  });

  afterEach(() => store.resetSelectors());

  it('allows the exact area limit and advertises the derived maximum radius', () => {
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('input').max).toBe(maximumStatisticsRadiusInMeters.toString());
  });

  it('explains oversized areas instead of displaying stale results or an empty-results message', () => {
    store.overrideSelector(selectAreaInSquareMeters, 42_000_001);
    store.refreshState();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('42 km²');
    expect(fixture.nativeElement.textContent).not.toContain('Keine Statistik-Daten');
  });

  it.each(['', 'NaN', 'Infinity', '0', (maximumStatisticsRadiusInMeters + 1).toString()])(
    'reports invalid radius input %j without changing the selection',
    (value) => {
      const dispatch = vi.spyOn(store, 'dispatch');
      fixture.componentInstance.setRadius(value);
      fixture.detectChanges();
      expect(dispatch).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('input').getAttribute('aria-invalid')).toBe('true');
      expect(fixture.nativeElement.querySelector('#statistics-radius-error').textContent).toContain('Radius zwischen');
    },
  );

  it('clears the radius error when valid input is submitted', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.setRadius('99999');
    fixture.componentInstance.setRadius('1000');
    fixture.detectChanges();
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsActions.setRadius({radiusInMeters: 1000}));
    expect(fixture.nativeElement.querySelector('#statistics-radius-error')).toBeNull();
  });
});
