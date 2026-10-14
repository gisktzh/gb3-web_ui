import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapConfigActions} from 'src/app/state/map/actions/map-config.actions';
import {MapRotationButtonComponent} from './map-rotation-button.component';

describe('MapRotationButtonComponent', () => {
  let component: MapRotationButtonComponent;
  let fixture: ComponentFixture<MapRotationButtonComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const rotation = signal(0);

  beforeEach(async () => {
    rotation.set(0);

    await TestBed.configureTestingModule({
      imports: [MapRotationButtonComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(MapRotationButtonComponent, {
      bindings: [inputBinding('rotation', rotation)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the rotation button', () => {
    const button = compiled.querySelector('.map-rotation-button--button') as HTMLButtonElement | null;

    expect(button).toBeTruthy();
    expect(button?.getAttribute('aria-label')).toBe('Kartenrotation: Klicken um nach Norden auszurichten');
    expect(button?.getAttribute('mattooltip')).toBe('Kartenrotation: Klicken um nach Norden auszurichten');
  });

  it('should render the explore icon', () => {
    const icon = compiled.querySelector('mat-icon');

    expect(icon).toBeTruthy();
    expect(icon?.textContent?.trim()).toBe('explore');
  });

  it('should not have the mobile class in regular screen mode', () => {
    const container = compiled.querySelector('.map-rotation-button');

    expect(container?.classList.contains('map-rotation-button--mobile')).toBe(false);
  });

  it('should have the mobile class in mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    const container = compiled.querySelector('.map-rotation-button');

    expect(container?.classList.contains('map-rotation-button--mobile')).toBe(true);
  });

  it('should not have the mobile class when switching back to regular screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    fixture.detectChanges();

    const container = compiled.querySelector('.map-rotation-button');

    expect(container?.classList.contains('map-rotation-button--mobile')).toBe(false);
  });

  it('should apply the rotation through the map rotation pipe', () => {
    rotation.set(45);
    fixture.detectChanges();

    const icon = compiled.querySelector('mat-icon') as HTMLElement;

    expect(icon?.style.transform).toBeTruthy();
    expect(icon?.style.transform).not.toBe('');
  });

  it('should update the icon transform when the rotation changes', () => {
    rotation.set(90);
    fixture.detectChanges();

    const icon = compiled.querySelector('mat-icon') as HTMLElement;
    const firstTransform = icon?.style.transform;

    rotation.set(180);
    fixture.detectChanges();

    const secondTransform = icon?.style.transform;

    expect(firstTransform).toBeTruthy();
    expect(secondTransform).toBeTruthy();
    expect(secondTransform).not.toBe(firstTransform);
  });

  it('should dispatch a reset rotation action when the button is clicked', () => {
    const button = compiled.querySelector('.map-rotation-button--button') as HTMLButtonElement;

    button.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.setRotation({rotation: 0}));
  });

  it('should dispatch a reset rotation action when resetRotation is called', () => {
    component.resetRotation();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.setRotation({rotation: 0}));
  });

  it('should keep the configured rotation value after rendering', () => {
    rotation.set(123);
    fixture.detectChanges();

    expect(component.rotation()).toBe(123);
  });
});
