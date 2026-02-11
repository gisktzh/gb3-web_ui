import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideUiTour, TourAnchorMatMenuDirective} from 'ngx-ui-tour-md-menu';
import {TypedTourAnchorDirective} from './typed-tour-anchor.directive';
import {OnboardingGuideAnchor} from '../../onboarding-guide/types/onboarding-guide-anchor.type';
import {SIGNAL} from '@angular/core/primitives/signals';

const testAnchor: OnboardingGuideAnchor = 'map.tour.start';

@Component({
  template: `<div [typedTourAnchor]="anchor">Test Content</div>`,
  imports: [TypedTourAnchorDirective],
})
class TestComponent {
  public anchor: OnboardingGuideAnchor = testAnchor;
}

describe('TypedTourAnchorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let directiveElement: DebugElement;
  let directiveInstance: TypedTourAnchorDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideUiTour()],
      imports: [TypedTourAnchorDirective, TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(TypedTourAnchorDirective));
    directiveInstance = directiveElement.injector.get(TypedTourAnchorDirective);
  });

  it('should create an instance', () => {
    expect(directiveInstance).toBeTruthy();
  });

  it('should accept a typed tour anchor input', () => {
    component.anchor = 'map.search.input';
    fixture.detectChanges();

    expect(directiveInstance.typedTourAnchor).toBe('map.search.input');
  });

  it('should set tourAnchor signal value to the typedTourAnchor value on init', () => {
    fixture.detectChanges();

    expect(directiveInstance.tourAnchor[SIGNAL].value).toBe(testAnchor);
  });

  it('should call super.ngOnInit()', () => {
    const superNgOnInitSpy = spyOn(TourAnchorMatMenuDirective.prototype, 'ngOnInit');
    fixture.detectChanges();

    expect(superNgOnInitSpy).toHaveBeenCalled();
  });
});
