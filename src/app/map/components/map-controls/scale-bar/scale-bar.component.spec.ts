import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScaleBarConfig} from '../../../../state/map/selectors/scale-bar-config.selector';
import {ScaleBarComponent} from './scale-bar.component';

describe('ScaleBarComponent', () => {
  let component: ScaleBarComponent;
  let fixture: ComponentFixture<ScaleBarComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScaleBarComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScaleBarConfig, undefined);
    store.refreshState();

    fixture = TestBed.createComponent(ScaleBarComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an empty label and hide the scale bar when no config is available', () => {
    const scaleBar = compiled.querySelector('.scale-bar');
    const label = compiled.querySelector('.scale-bar__label strong');

    expect(label?.textContent?.trim()).toBe('');
    expect(scaleBar?.classList.contains('scale-bar--hidden')).toBe(true);
    expect(scaleBar?.getAttribute('style')).toBe(null);
  });

  it('should render the scale bar label and width when config is available', () => {
    store.overrideSelector(selectScaleBarConfig, {
      value: 500,
      unit: 'm',
      scaleBarWidthInPx: 120,
    });
    store.refreshState();
    fixture.detectChanges();

    const scaleBar = compiled.querySelector('.scale-bar') as HTMLElement;
    const label = compiled.querySelector('.scale-bar__label strong');

    expect(label?.textContent?.trim()).toBe('500 m');
    expect(scaleBar?.classList.contains('scale-bar--hidden')).toBe(false);
    expect(scaleBar?.style.width).toBe('120px');
  });

  it('should update the rendered label and width when the config changes', () => {
    store.overrideSelector(selectScaleBarConfig, {
      value: 2,
      unit: 'km',
      scaleBarWidthInPx: 80,
    });
    store.refreshState();
    fixture.detectChanges();

    store.overrideSelector(selectScaleBarConfig, {
      value: 10,
      unit: 'm',
      scaleBarWidthInPx: 200,
    });
    store.refreshState();
    fixture.detectChanges();

    const scaleBar = compiled.querySelector('.scale-bar') as HTMLElement;
    const label = compiled.querySelector('.scale-bar__label strong');

    expect(label?.textContent?.trim()).toBe('10 m');
    expect(scaleBar?.classList.contains('scale-bar--hidden')).toBe(false);
    expect(scaleBar?.style.width).toBe('200px');
  });
});
