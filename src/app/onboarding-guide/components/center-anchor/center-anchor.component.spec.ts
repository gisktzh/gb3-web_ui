import {Directive, input, inputBinding, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {TourAnchorMatMenuDirective} from 'ngx-ui-tour-md-menu';
import {OnboardingGuideAnchor} from '../../types/onboarding-guide-anchor.type';
import {CenterAnchorComponent} from './center-anchor.component';

@Directive({selector: '[tourAnchor]', host: {'[attr.data-anchor]': 'tourAnchor()'}})
class TourAnchorStubDirective {
  public readonly tourAnchor = input<OnboardingGuideAnchor>();
}

describe('CenterAnchorComponent', () => {
  it('places the configured tour anchor in the center target', async () => {
    const anchor = signal('map' as OnboardingGuideAnchor);
    await TestBed.configureTestingModule({imports: [CenterAnchorComponent]})
      .overrideComponent(CenterAnchorComponent, {
        remove: {imports: [TourAnchorMatMenuDirective]},
        add: {imports: [TourAnchorStubDirective]},
      })
      .compileComponents();
    const fixture = TestBed.createComponent(CenterAnchorComponent, {bindings: [inputBinding('anchorName', anchor)]});
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.center-anchor')?.getAttribute('data-anchor')).toBe('map');
    anchor.set('search' as OnboardingGuideAnchor);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.center-anchor')?.getAttribute('data-anchor')).toBe('search');
  });
});
