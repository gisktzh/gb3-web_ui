import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {By} from '@angular/platform-browser';
import {selectTerms} from 'src/app/state/app/selectors/search-terms.selector';
import {
  selectFilteredAddressesAndPlacesMatches,
  selectFilteredActiveMapMatches,
  selectFilteredLayerCatalogMaps,
} from '../../../../state/app/selectors/search-results.selector';
import {selectSearchApiLoadingState, selectSelectedSearchResult} from '../../../../state/app/reducers/search.reducer';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ResultGroupsComponent} from './result-groups.component';
import {ResultGroupComponent} from './result-group/result-group.component';

describe('ResultGroupsComponent', () => {
  let component: ResultGroupsComponent;
  let fixture: ComponentFixture<ResultGroupsComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const showMultiplePanels = signal<boolean | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultGroupsComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectTerms, []);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, []);
    store.overrideSelector(selectFilteredActiveMapMatches, []);
    store.overrideSelector(selectFilteredLayerCatalogMaps, []);
    store.overrideSelector(selectSearchApiLoadingState, undefined);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();

    showMultiplePanels.set(undefined);

    fixture = TestBed.createComponent(ResultGroupsComponent, {
      bindings: [inputBinding('showMultiplePanels', showMultiplePanels)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the loading bar', () => {
    expect(compiled.querySelector('loading-and-process-bar')).toBeTruthy();
  });

  it('should not render the result accordion when there are no search terms', () => {
    store.overrideSelector(selectTerms, []);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        displayString: 'asdf',
      } as never,
    ]);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('mat-accordion')).toBeNull();
  });

  it('should not render the result accordion when the first search term is empty', () => {
    store.overrideSelector(selectTerms, ['']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        displayString: 'asdf search',
      } as never,
    ]);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('mat-accordion')).toBeNull();
  });

  it('should not render the result accordion when all result groups are empty', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, []);
    store.overrideSelector(selectFilteredActiveMapMatches, []);
    store.overrideSelector(selectFilteredLayerCatalogMaps, []);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('mat-accordion')).toBeNull();
  });

  it('should not render the result accordion when a search result is selected', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        displayString: 'asdf search',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, {} as never);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('mat-accordion')).toBeNull();
  });

  it('should render the result accordion when there are search terms and results', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        displayString: 'asdf search',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('mat-accordion')).toBeTruthy();
  });

  it('should render the addresses and places result group when results are available', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        displayString: 'asdf search',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    const resultGroups = fixture.debugElement.queryAll(By.directive(ResultGroupComponent));

    expect(resultGroups).toHaveLength(1);
    expect(resultGroups[0].componentInstance.header()).toBe('Orte / Adressen');
    expect(resultGroups[0].componentInstance.isExpanded()).toBe(true);
  });

  it('should render the active map result group when results are available', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredActiveMapMatches, [
      {
        displayString: 'asdf search',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    const resultGroups = fixture.debugElement.queryAll(By.directive(ResultGroupComponent));

    expect(resultGroups).toHaveLength(1);
    expect(resultGroups[0].componentInstance.header()).toBe('Objekte');
  });

  it('should render the maps result group when results are available', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredLayerCatalogMaps, [
      {
        displayString: 'asdf search',
        title: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    const resultGroups = fixture.debugElement.queryAll(By.directive(ResultGroupComponent));

    expect(resultGroups).toHaveLength(1);
    expect(resultGroups[0].componentInstance.header()).toBe('Karten');
  });

  it('should render all result groups when all result types are available', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        displayString: 'asdfsearchasdf',
        title: 'asdfsearchasdf',
      } as never,
    ]);
    store.overrideSelector(selectFilteredActiveMapMatches, [
      {
        displayString: 'asdf SEARCH',
        title: 'asdf SEARCH',
      } as never,
    ]);
    store.overrideSelector(selectFilteredLayerCatalogMaps, [
      {
        displayString: 'search asdf',
        title: 'search asdf',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    const resultGroups = fixture.debugElement.queryAll(By.directive(ResultGroupComponent));

    expect(resultGroups).toHaveLength(3);
    expect(resultGroups.map((group) => group.componentInstance.header())).toEqual(['Orte / Adressen', 'Objekte', 'Karten']);
  });

  it('should pass the search terms to every result group', () => {
    const terms = ['search', 'term'];

    store.overrideSelector(selectTerms, terms);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        displayString: 'search term asdf term',
        title: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectFilteredActiveMapMatches, [
      {
        displayString: 'search term asdf term',
        title: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectFilteredLayerCatalogMaps, [
      {
        displayString: 'search term asdf term',
        title: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    const resultGroups = fixture.debugElement.queryAll(By.directive(ResultGroupComponent));

    expect(resultGroups).toHaveLength(3);
    expect(resultGroups.every((group) => group.componentInstance.searchTerms() === terms)).toBe(true);
  });

  it('should expand the addresses and places result group by default', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    const resultGroup = fixture.debugElement.query(By.directive(ResultGroupComponent));

    expect(resultGroup.componentInstance.isExpanded()).toBe(true);
  });

  it('should pass showMultiplePanels to the accordion', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();

    showMultiplePanels.set(false);
    fixture.detectChanges();

    const accordion = compiled.querySelector('mat-accordion');

    expect(accordion).toBeTruthy();
    expect(component.showMultiplePanels()).toBe(false);
  });

  it('should update the accordion when showMultiplePanels changes', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    showMultiplePanels.set(true);
    fixture.detectChanges();

    expect(component.showMultiplePanels()).toBe(true);

    showMultiplePanels.set(false);
    fixture.detectChanges();

    expect(component.showMultiplePanels()).toBe(false);
  });

  it('should add the mobile class when screen mode is mobile', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectScreenMode, 'mobile');
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('.result-window__content--mobile')).toBeTruthy();
  });

  it('should not add the mobile class when screen mode is regular', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('.result-window__content--mobile')).toBeNull();
  });

  it('should expose the rendered result groups through viewChildren', () => {
    store.overrideSelector(selectTerms, ['search']);
    store.overrideSelector(selectFilteredAddressesAndPlacesMatches, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectFilteredActiveMapMatches, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectFilteredLayerCatalogMaps, [
      {
        title: 'search term asdf term',
        displayString: 'search term asdf term',
      } as never,
    ]);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    expect(component.resultGroupComponents()).toHaveLength(3);
  });
});
