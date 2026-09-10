import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectTitle} from '../../../../../state/map/reducers/map-import.reducer';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {MapImportDisplayNameComponent} from './map-import-display-name.component';

describe('MapImportDisplayNameComponent', () => {
  let component: MapImportDisplayNameComponent;
  let fixture: ComponentFixture<MapImportDisplayNameComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapImportDisplayNameComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectTitle, undefined);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(MapImportDisplayNameComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    await new Promise<void>((resolve) => queueMicrotask(resolve));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the display name input', () => {
    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input).toBeTruthy();
    expect(input?.placeholder).toBe('Bitte einen Namen eingeben');
  });

  it('should render the display name label', () => {
    const label = compiled.querySelector('mat-label');

    expect(label?.textContent?.trim()).toBe('Anzeigenamen');
  });

  it('should initialize the name from the store title', async () => {
    vi.useFakeTimers();
    store.overrideSelector(selectTitle, 'Imported map');
    store.refreshState();

    fixture.detectChanges();
    await vi.runAllTimersAsync();

    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input?.value).toBe('Imported map');
  });

  it('should use an empty name when the store title is undefined', () => {
    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input?.value).toBe('');
  });

  it('should update the name when the store title changes', async () => {
    vi.useFakeTimers();
    store.overrideSelector(selectTitle, 'First title');
    store.refreshState();
    await vi.runAllTimersAsync();

    store.overrideSelector(selectTitle, 'Second title');
    store.refreshState();
    await vi.runAllTimersAsync();

    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input?.value).toBe('Second title');
  });

  it('should dispatch the valid initial name', async () => {
    vi.useFakeTimers();
    store.overrideSelector(selectTitle, 'Initial title');
    store.refreshState();

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapImportActions.setTitle({title: 'Initial title'}));
  });

  it('should dispatch a valid name entered by the user', () => {
    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input).toBeTruthy();

    if (!input) {
      return;
    }

    storeDispatchSpy.mockClear();

    input.value = 'New map name';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapImportActions.setTitle({title: 'New map name'}));
  });

  it('should not dispatch an empty name', () => {
    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input).toBeTruthy();

    if (!input) {
      return;
    }

    storeDispatchSpy.mockClear();

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should not dispatch a whitespace-only name', () => {
    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input).toBeTruthy();

    if (!input) {
      return;
    }

    storeDispatchSpy.mockClear();

    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should not dispatch a name shorter than one character', () => {
    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input).toBeTruthy();

    if (!input) {
      return;
    }

    storeDispatchSpy.mockClear();

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch a name containing surrounding whitespace', () => {
    const input = compiled.querySelector<HTMLInputElement>('input');

    expect(input).toBeTruthy();

    if (!input) {
      return;
    }

    storeDispatchSpy.mockClear();

    input.value = '  Map name  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapImportActions.setTitle({title: '  Map name  '}));
  });
});
