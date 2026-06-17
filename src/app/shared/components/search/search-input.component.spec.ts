import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {Mock} from 'vitest';
import {SearchInputComponent} from './search-input.component';
import {inputBinding, signal} from '@angular/core';
import {TypedTourAnchorDirective} from '../../directives/typed-tour-anchor.directive';
import {provideUiTour} from 'ngx-ui-tour-md-menu';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const placeholderText = signal('');
  const showFilterButton = signal<boolean>(false);
  const alwaysEnableClearButton = signal(false);
  const clearButtonLabel = signal('');
  const mode = signal('normal');
  const focusOnInit = signal(undefined);
  const disabled = signal(false);
  const isAnyFilterActive = signal(undefined);
  let focusEventSpy: Mock;
  let changeSearchTermEventSpy: Mock;
  let clearSearchTermEventSpy: Mock;
  let openFilterEventSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, TypedTourAnchorDirective],
      providers: [provideMockStore(), provideUiTour()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    showFilterButton.set(false);
    clearButtonLabel.set('');

    fixture = TestBed.createComponent(SearchInputComponent, {
      bindings: [
        inputBinding('placeholderText', placeholderText),
        inputBinding('showFilterButton', showFilterButton),
        inputBinding('alwaysEnableClearButton', alwaysEnableClearButton),
        inputBinding('clearButtonLabel', clearButtonLabel),
        inputBinding('mode', mode),
        inputBinding('focusOnInit', focusOnInit),
        inputBinding('disabled', disabled),
        inputBinding('isAnyFilterActive', isAnyFilterActive),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    focusEventSpy = vi.spyOn(component.focusEvent, 'emit');
    changeSearchTermEventSpy = vi.spyOn(component.changeSearchTermEvent, 'emit');
    clearSearchTermEventSpy = vi.spyOn(component.clearSearchTermEvent, 'emit');
    openFilterEventSpy = vi.spyOn(component.openFilterEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('search term input', () => {
    it('should not emit an event if the public API is used and the flag is not set', async () => {
      vi.useFakeTimers();
      component.setTerm('Something something go go yes', false);

      await vi.runAllTimersAsync();

      expect(changeSearchTermEventSpy).not.toHaveBeenCalled();
    });

    it('should emit an event if the public API is used and the flag is set', async () => {
      vi.useFakeTimers();
      component.setTerm('Something something go go yes', true);

      await vi.runAllTimersAsync();

      expect(changeSearchTermEventSpy).toHaveBeenCalledWith('Something something go go yes');
    });

    it('should emit an event when typing in the input field', async () => {
      vi.useFakeTimers();
      const input = compiled.querySelector('input');
      expect(input).toBeDefined();

      let e = new KeyboardEvent('keyup', {
        key: 'a',
      });
      input!.value = 'a';
      input!.dispatchEvent(e);
      await vi.advanceTimersByTimeAsync(50);

      e = new KeyboardEvent('keyup', {
        key: 's',
      });
      input!.value += 's';
      input!.dispatchEvent(e);
      await vi.advanceTimersByTimeAsync(50);

      e = new KeyboardEvent('keyup', {
        key: 'd',
      });
      input!.value += 'd';
      input!.dispatchEvent(e);
      await vi.advanceTimersByTimeAsync(50);

      e = new KeyboardEvent('keyup', {
        key: 'f',
      });
      input!.value += 'f';
      input!.dispatchEvent(e);

      await vi.runAllTimersAsync();

      expect(changeSearchTermEventSpy).toHaveBeenCalledExactlyOnceWith('asdf');
    });
  });

  describe('focus', () => {
    it('should focus the input element when the public focus API is used', () => {
      component.focus();

      expect(document.activeElement).toBe(component.inputRef().nativeElement);
      expect(focusEventSpy).toHaveBeenCalled();
    });

    it('should emit an event when the input element is focused', () => {
      component.inputRef().nativeElement.focus();
      expect(focusEventSpy).toHaveBeenCalled();
    });
  });

  describe('filter buttons', () => {
    it('should emit an event when the public API to open the filter is used', () => {
      component.openFilter();

      expect(openFilterEventSpy).toHaveBeenCalledOnce();
    });

    it('should emit an event when the respective button is pressed in normal search mode', () => {
      let filterButton = compiled.querySelector<HTMLButtonElement>('.search__filter-button');
      expect(filterButton).toBeNull();

      showFilterButton.set(true);
      fixture.detectChanges();

      filterButton = compiled.querySelector<HTMLButtonElement>('.search__filter-button');
      expect(filterButton).not.toBeNull();

      filterButton!.click();

      expect(openFilterEventSpy).toHaveBeenCalled();
    });

    it('should emit an event when the respective button is pressed in compact search mode', () => {
      mode.set('compact');
      fixture.detectChanges();

      let filterButton = compiled.querySelector<HTMLButtonElement>('[aria-label="Suchresultate verfeinern"]');
      expect(filterButton).toBeNull();

      showFilterButton.set(true);
      fixture.detectChanges();

      filterButton = compiled.querySelector<HTMLButtonElement>('[aria-label="Suchresultate verfeinern"]');
      expect(filterButton).not.toBeNull();

      filterButton!.click();

      expect(openFilterEventSpy).toHaveBeenCalled();
    });

    it('should emit an event when the respective button is pressed in mobile search mode', () => {
      mode.set('mobile');
      fixture.detectChanges();

      let filterButton = compiled.querySelector<HTMLButtonElement>('[aria-label="Suchresultate verfeinern"]');
      expect(filterButton).toBeNull();

      showFilterButton.set(true);
      fixture.detectChanges();

      filterButton = compiled.querySelector<HTMLButtonElement>('[aria-label="Suchresultate verfeinern"]');
      expect(filterButton).not.toBeNull();

      filterButton!.click();

      expect(openFilterEventSpy).toHaveBeenCalled();
    });

    it('shows a filter button no matter the search mode', () => {
      showFilterButton.set(true);

      mode.set('normal');
      fixture.detectChanges();
      expect(compiled.querySelector('.search__filter-button')).not.toBeNull();
      expect(compiled.querySelector('[aria-label="Suchresultate verfeinern"]')).toBeNull();

      mode.set('compact');
      fixture.detectChanges();
      expect(compiled.querySelector('.search__filter-button')).toBeNull();
      expect(compiled.querySelector('[aria-label="Suchresultate verfeinern"]')).not.toBeNull();

      mode.set('mobile');
      fixture.detectChanges();
      expect(compiled.querySelector('.search__filter-button')).toBeNull();
      expect(compiled.querySelector('[aria-label="Suchresultate verfeinern"]')).not.toBeNull();
    });

    it('disables all filter buttons in any search mode', () => {
      showFilterButton.set(true);
      disabled.set(true);

      mode.set('normal');
      fixture.detectChanges();
      expect(compiled.querySelector('.search__filter-button')?.getAttribute('disabled')).toBeTruthy();
      expect(compiled.querySelector('[aria-label="Suchresultate verfeinern"]')).toBeNull();

      mode.set('compact');
      fixture.detectChanges();
      expect(compiled.querySelector('.search__filter-button')).toBeNull();
      expect(compiled.querySelector('[aria-label="Suchresultate verfeinern"]')?.getAttribute('disabled')).toBeTruthy();

      mode.set('mobile');
      fixture.detectChanges();
      expect(compiled.querySelector('.search__filter-button')).toBeNull();
      expect(compiled.querySelector('[aria-label="Suchresultate verfeinern"]')?.getAttribute('disabled')).toBeTruthy();
    });
  });

  describe('clear button', () => {
    it('should emit an event when the search term is cleared and it should clear the search term', async () => {
      vi.useFakeTimers();
      component.clearInput();
      await vi.runAllTimersAsync();

      expect(changeSearchTermEventSpy).not.toHaveBeenCalled();
      expect(clearSearchTermEventSpy).toHaveBeenCalled();
      expect(component.searchTerm()).toBe('');
    });

    it('should show different icons on mobile and regular', async () => {
      vi.useFakeTimers();

      const button = compiled.querySelector('.search__bar__close-icon-button');
      expect(button).not.toBeNull();

      expect(button!.textContent).toBe('close');

      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();
      fixture.detectChanges();

      await vi.runAllTimersAsync();

      expect(button!.textContent).toBe('cancel');
    });

    it('should show a button label on mobile and regular if one is given', async () => {
      vi.useFakeTimers();

      clearButtonLabel.set('Lorem ipsum');
      fixture.detectChanges();

      await vi.runAllTimersAsync();

      expect(compiled.querySelector('.search__bar__close-icon-button')).toBeNull();

      const labelOnlyButton = compiled.querySelector('.search__bar__close-button');
      expect(labelOnlyButton).not.toBeNull();
      expect(labelOnlyButton!.textContent).toContain('Lorem ipsum');
    });

    it('should clear the search input when the icon-only button is clicked', async () => {
      vi.useFakeTimers();

      component.setTerm('Something something go go yes', false);
      alwaysEnableClearButton.set(true);
      fixture.detectChanges();

      await vi.runAllTimersAsync();

      const button = compiled.querySelector<HTMLButtonElement>('.search__bar__close-icon-button');
      expect(button).not.toBeNull();

      button!.dispatchEvent(new MouseEvent('click'));

      await vi.runAllTimersAsync();

      expect(changeSearchTermEventSpy).not.toHaveBeenCalled();
      expect(clearSearchTermEventSpy).toHaveBeenCalled();
      expect(component.searchTerm()).toBe('');
    });

    it('should clear the search input when the label-only button is clicked', async () => {
      vi.useFakeTimers();

      clearButtonLabel.set('Lorem ipsum');
      alwaysEnableClearButton.set(true);
      component.setTerm('Something something go go yes', false);
      fixture.detectChanges();

      await vi.runAllTimersAsync();

      expect(component.searchTerm()).toBe('Something something go go yes');

      const labelOnlyButton = compiled.querySelector<HTMLButtonElement>('.search__bar__close-button');
      expect(labelOnlyButton).not.toBeNull();

      labelOnlyButton!.dispatchEvent(new MouseEvent('click'));

      await vi.runAllTimersAsync();

      expect(changeSearchTermEventSpy).not.toHaveBeenCalled();
      expect(clearSearchTermEventSpy).toHaveBeenCalled();
      expect(component.searchTerm()).toBe('');
    });

    it('should disable the icon-only button when the disabled flag is set', async () => {
      vi.useFakeTimers();

      disabled.set(true);
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      const button = compiled.querySelector<HTMLButtonElement>('.search__bar__close-icon-button');
      expect(button).not.toBeNull();
      expect(button!.disabled).toBeTruthy();
    });

    it('should disable the label-only button when the disabled flag is set', async () => {
      vi.useFakeTimers();

      clearButtonLabel.set('Lorem ipsum');
      disabled.set(true);
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      const labelOnlyButton = compiled.querySelector<HTMLButtonElement>('.search__bar__close-button');
      expect(labelOnlyButton).not.toBeNull();
      expect(labelOnlyButton!.disabled).toBeTruthy();
    });
  });
});
