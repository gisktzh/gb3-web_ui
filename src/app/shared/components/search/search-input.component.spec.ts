import {inputBinding, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {SearchMode} from '../../types/search-mode.type';
import {SearchInputComponent} from './search-input.component';
import {SearchInputHarness} from './search-input.harness';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;
  let harness: SearchInputHarness;
  let store: MockStore;

  const placeholderText = signal('Search maps');
  const showFilterButton = signal(true);
  const alwaysEnableClearButton = signal(false);
  const clearButtonLabel = signal<string | undefined>(undefined);
  const mode = signal<SearchMode>('normal');
  const disabled = signal(false);
  const isAnyFilterActive = signal(false);

  beforeEach(async () => {
    placeholderText.set('Search maps');
    showFilterButton.set(true);
    alwaysEnableClearButton.set(false);
    clearButtonLabel.set(undefined);
    mode.set('normal');
    disabled.set(false);
    isAnyFilterActive.set(false);

    await TestBed.configureTestingModule({
      imports: [SearchInputComponent],
      providers: [provideMockStore(), provideUiTour()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    fixture = TestBed.createComponent(SearchInputComponent, {
      bindings: [
        inputBinding('placeholderText', placeholderText),
        inputBinding('showFilterButton', showFilterButton),
        inputBinding('alwaysEnableClearButton', alwaysEnableClearButton),
        inputBinding('clearButtonLabel', clearButtonLabel),
        inputBinding('mode', mode),
        inputBinding('disabled', disabled),
        inputBinding('isAnyFilterActive', isAnyFilterActive),
      ],
    });
    fixture.detectChanges();
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchInputHarness);
  });

  afterEach(() => vi.useRealTimers());

  it('debounces emitted search terms', async () => {
    vi.useFakeTimers();
    const emit = vi.spyOn(component.changeSearchTermEvent, 'emit');

    component.setTerm('cadastral map', true);
    fixture.detectChanges();
    expect(emit).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(299);
    expect(emit).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(emit).toHaveBeenCalledExactlyOnceWith('cadastral map');
  });

  it('allows callers to replace the term without emitting a user search', async () => {
    vi.useFakeTimers();
    const emit = vi.spyOn(component.changeSearchTermEvent, 'emit');

    component.setTerm('restored query', false);
    await vi.runAllTimersAsync();

    expect(await harness.getValue()).toBe('restored query');
    expect(emit).not.toHaveBeenCalled();
  });

  it('clears the term and reports the explicit clear action', async () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(component.clearSearchTermEvent, 'emit');
    const search = vi.spyOn(component.changeSearchTermEvent, 'emit');

    component.setTerm('orthophoto', false);
    fixture.detectChanges();
    await harness.clear();
    await vi.runAllTimersAsync();

    expect(await harness.getValue()).toBe('');
    expect(clear).toHaveBeenCalledOnce();
    expect(search).not.toHaveBeenCalled();
  });

  it('disables clearing an empty term unless the consumer explicitly allows it', async () => {
    expect(await harness.isClearDisabled()).toBe(true);

    alwaysEnableClearButton.set(true);
    fixture.detectChanges();

    expect(await harness.isClearDisabled()).toBe(false);
  });

  it.each(['normal', 'compact', 'mobile'] as const)('offers filtering in %s mode', async (searchMode) => {
    const openFilter = vi.spyOn(component.openFilterEvent, 'emit');
    mode.set(searchMode);
    fixture.detectChanges();

    expect(await harness.hasFilterButton()).toBe(true);
    await harness.openFilter();

    expect(openFilter).toHaveBeenCalledOnce();
  });

  it('hides filtering when the consumer disables that capability', async () => {
    showFilterButton.set(false);
    fixture.detectChanges();

    expect(await harness.hasFilterButton()).toBe(false);
  });

  it('focuses the native input through its public API', async () => {
    const focus = vi.spyOn(component.focusEvent, 'emit');

    component.focus();

    expect(document.activeElement).toBe(component.inputRef().nativeElement);
    expect(focus).toHaveBeenCalledOnce();
    await expect(harness.getValue()).resolves.toBe('');
  });
});
