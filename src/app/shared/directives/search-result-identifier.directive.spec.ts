import {SearchResultIdentifierDirective} from './search-result-identifier.directive';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ComponentRef, ElementRef, input, signal} from '@angular/core';
import {By} from '@angular/platform-browser';

/**
 * Host component to trigger events on.
 */
@Component({
  standalone: true,
  imports: [SearchResultIdentifierDirective],
  template: `<button searchResultIdentifier [isMapResult]="isMapResult()" [isFocusable]="isFocusable()" [text]="text()">Button</button>`,
})
class HostComponent {
  public isMapResult = input(false);
  public isFocusable = input(false);
  public text = signal('Lorem ipsum');
}

describe('SearchResultIdentifierDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: ComponentRef<HostComponent>;
  let directive: SearchResultIdentifierDirective;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SearchResultIdentifierDirective,
        {
          provide: ElementRef,
          useValue: new ElementRef(document.createElement('div')),
        },
      ],
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentRef;

    directive = fixture.debugElement
      .queryAll(By.directive(SearchResultIdentifierDirective))[0]
      .injector.get(SearchResultIdentifierDirective);

    fixture.detectChanges();

    el = fixture.nativeElement.querySelector('button');
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should emit addResultFromArrowNavigation when element is focussed and isMapResult is true', async () => {
    vi.useFakeTimers();
    vi.spyOn(directive.addResultFromArrowNavigation, 'emit');
    host.setInput('isMapResult', true);
    await vi.runAllTimersAsync();
    el.dispatchEvent(new FocusEvent('focus'));
    expect(directive.addResultFromArrowNavigation.emit).toHaveBeenCalled();
  });

  it('should emit addResultFromArrowNavigation when addTemporaryMap is called and isMapResult is true', async () => {
    vi.useFakeTimers();
    vi.spyOn(directive.addResultFromArrowNavigation, 'emit');
    host.setInput('isMapResult', true);
    await vi.runAllTimersAsync();
    directive.addTemporaryMap();
    expect(directive.addResultFromArrowNavigation.emit).toHaveBeenCalled();
  });

  it('should not emit addResultFromArrowNavigation when host element is focussed and isMapResult is false', () => {
    vi.spyOn(directive.addResultFromArrowNavigation, 'emit');
    el.dispatchEvent(new FocusEvent('focus'));
    expect(directive.addResultFromArrowNavigation.emit).not.toHaveBeenCalled();
  });

  it('should not emit addResultFromArrowNavigation when addTemporaryMap is called and isMapResult is false', () => {
    vi.spyOn(directive.addResultFromArrowNavigation, 'emit');
    directive.addTemporaryMap();
    expect(directive.addResultFromArrowNavigation.emit).not.toHaveBeenCalled();
  });

  it('should emit removeResultFromArrowNavigation when host element is blurred and isMapResult is true', async () => {
    vi.useFakeTimers();
    vi.spyOn(directive.removeResultFromArrowNavigation, 'emit');
    host.setInput('isMapResult', true);
    await vi.runAllTimersAsync();
    el.dispatchEvent(new FocusEvent('blur'));
    expect(directive.removeResultFromArrowNavigation.emit).toHaveBeenCalled();
  });

  it('should emit removeResultFromArrowNavigation when removeTemporaryMap is called and isMapResult is true', async () => {
    vi.useFakeTimers();
    vi.spyOn(directive.removeResultFromArrowNavigation, 'emit');
    host.setInput('isMapResult', true);
    await vi.runAllTimersAsync();
    directive.removeTemporaryMap();
    expect(directive.removeResultFromArrowNavigation.emit).toHaveBeenCalled();
  });

  it('should not emit removeResultFromArrowNavigation when element is blurred and isMapResult is false', () => {
    vi.spyOn(directive.removeResultFromArrowNavigation, 'emit');
    el.dispatchEvent(new FocusEvent('blur'));
    expect(directive.removeResultFromArrowNavigation.emit).not.toHaveBeenCalled();
  });

  it('should not emit removeResultFromArrowNavigation when removeTemporaryMap is called and isMapResult is false', () => {
    vi.spyOn(directive.removeResultFromArrowNavigation, 'emit');
    directive.removeTemporaryMap();
    expect(directive.removeResultFromArrowNavigation.emit).not.toHaveBeenCalled();
  });
});
