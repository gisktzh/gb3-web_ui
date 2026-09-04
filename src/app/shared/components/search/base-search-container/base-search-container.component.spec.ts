import {Component, signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectTerm} from '../../../../state/app/reducers/search.reducer';
import {DOCUMENT} from '@angular/core';
import {BaseSearchContainerComponent} from './base-search-container.component';
import {SearchResultIdentifierDirective} from '../../../directives/search-result-identifier.directive';
import {SearchBarComponent} from '../search-bar/search-bar.component';
import {SearchInputComponent} from '../search-input.component';
import {selectIsAnySearchFilterActiveSelector} from 'src/app/state/app/selectors/is-any-search-filter-active.selector';

@Component({
  selector: 'test-search-container',
  standalone: true,
  imports: [SearchBarComponent],
  template: '<search-bar />',
})
class TestSearchContainerComponent extends BaseSearchContainerComponent {
  public readonly allSearchResults: WritableSignal<readonly SearchResultIdentifierDirective[]> = signal([]);
}

class MockSearchResultIdentifierDirective {
  public readonly host = {
    nativeElement: {
      focus: vi.fn(),
      click: vi.fn(),
    },
  };

  public text(): string {
    return 'result';
  }

  public isFocusable(): boolean {
    return true;
  }
}

describe('BaseSearchContainerComponent', () => {
  let component: TestSearchContainerComponent;
  let fixture: ComponentFixture<TestSearchContainerComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSearchContainerComponent, SearchBarComponent],
      providers: [{provide: DOCUMENT, useValue: document}, provideMockStore()],
    })
      .overrideComponent(SearchBarComponent, {
        set: {
          imports: [SearchInputComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectTerm, 'current term');
    store.overrideSelector(selectIsAnySearchFilterActiveSelector, false);
    store.refreshState();

    fixture = TestBed.createComponent(TestSearchContainerComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose total results count', () => {
    const results = [
      new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective,
      new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective,
    ];

    component.allSearchResults.set(results);

    expect(component.totalResults()).toBe(2);
  });

  it('should prevent default and focus next result on arrow down', () => {
    const result = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;
    component.allSearchResults.set([result]);

    const event = {
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    component.handleArrowDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.host.nativeElement.focus).toHaveBeenCalled();
  });

  it('should focus previous result on arrow up from empty selection', () => {
    const first = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;
    const second = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([first, second]);

    const event = {
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    component.handleArrowUp(event);

    expect(second.host.nativeElement.focus).toHaveBeenCalled();
  });

  it('should reset selection when moving down past last result', () => {
    const result = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([result]);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(result.host.nativeElement.focus).toHaveBeenCalledTimes(1);
  });

  it('should click selected result on enter', () => {
    const result = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([result]);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    const event = {
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    component.handleEnter(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.host.nativeElement.click).toHaveBeenCalled();
  });

  it('should not click result on enter when nothing is selected', () => {
    const result = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([result]);

    const event = {
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    component.handleEnter(event);

    expect(result.host.nativeElement.click).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should move focus back to search input when arrow down resets index', async () => {
    vi.useFakeTimers();
    const searchBar: SearchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent)).componentInstance;
    const focusSpy = vi.spyOn(searchBar.searchInput(), 'focus');
    const setTermSpy = vi.spyOn(searchBar.searchInput(), 'setTerm');

    component.allSearchResults.set([new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective]);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    fixture.detectChanges();

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(focusSpy).toHaveBeenCalled();
    expect(setTermSpy).toHaveBeenCalledWith('current term', false);
  });

  it('should prevent tab and focus next focusable result', async () => {
    vi.useFakeTimers();
    const first = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;
    const second = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([first, second]);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    fixture.detectChanges();

    const event = {
      preventDefault: vi.fn(),
      shiftKey: false,
    } as unknown as KeyboardEvent;

    component.handleTab(event);

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(event.preventDefault).toHaveBeenCalled();
    expect(second.host.nativeElement.focus).toHaveBeenCalled();
  });

  it('should reset index when tab has no focusable elements', async () => {
    vi.useFakeTimers();
    const result = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;
    vi.spyOn(result, 'isFocusable').mockReturnValue(false);

    component.allSearchResults.set([result]);

    const event = {
      preventDefault: vi.fn(),
      shiftKey: false,
    } as unknown as KeyboardEvent;

    component.handleTab(event);

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.host.nativeElement.focus).not.toHaveBeenCalled();
  });

  it('should handle arrow up when selection already exists', () => {
    const first = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;
    const second = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([first, second]);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    component.handleArrowUp({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(first.host.nativeElement.focus).toHaveBeenCalled();
  });

  it('should focus first selected element when shift tab moves backwards', async () => {
    vi.useFakeTimers();

    const first = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;
    const second = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([first, second]);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    const event = {
      preventDefault: vi.fn(),
      shiftKey: true,
    } as unknown as KeyboardEvent;

    component.handleTab(event);

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(event.preventDefault).toHaveBeenCalled();
    expect(first.host.nativeElement.focus).toHaveBeenCalled();
  });

  it('should reset index when shift tab moves before first focusable element', async () => {
    vi.useFakeTimers();

    const first = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([first]);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    const event = {
      preventDefault: vi.fn(),
      shiftKey: true,
    } as unknown as KeyboardEvent;

    component.handleTab(event);

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(first.host.nativeElement.focus).toHaveBeenCalledTimes(1);
  });

  it('should handle tab when active element is not a search result', async () => {
    vi.useFakeTimers();

    const first = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([first]);

    document.body.focus();

    const event = {
      preventDefault: vi.fn(),
      shiftKey: false,
    } as unknown as KeyboardEvent;

    component.handleTab(event);

    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle enter event from template host', () => {
    const result = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([result]);

    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
    });

    compiled.dispatchEvent(enterEvent);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    component.handleEnter(enterEvent);

    expect(result.host.nativeElement.click).toHaveBeenCalled();
  });

  it('should handle space event from template host', () => {
    const result = new MockSearchResultIdentifierDirective() as unknown as SearchResultIdentifierDirective;

    component.allSearchResults.set([result]);

    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
    });

    compiled.dispatchEvent(spaceEvent);

    component.handleArrowDown({
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    component.handleEnter(spaceEvent);

    expect(result.host.nativeElement.click).toHaveBeenCalled();
  });
});
