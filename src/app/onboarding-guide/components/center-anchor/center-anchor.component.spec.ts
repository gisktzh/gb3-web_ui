import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CenterAnchorComponent} from './center-anchor.component';
import {Directive, input, inputBinding, signal} from '@angular/core';
import {OnboardingGuideAnchor} from '../../types/onboarding-guide-anchor.type';
import {TourAnchorMatMenuDirective} from 'ngx-ui-tour-md-menu';

describe('CenterAnchorComponent', () => {
  let component: CenterAnchorComponent;
  let fixture: ComponentFixture<CenterAnchorComponent>;
  let compiled: HTMLElement;

  const anchorName = signal<OnboardingGuideAnchor>('test-anchor' as OnboardingGuideAnchor);

  @Directive({
    selector: '[tourAnchor]',
    standalone: true,
    host: {
      '[attr.data-anchor]': 'tourAnchor()',
    },
  })
  class MockTourAnchorMatMenuDirective {
    public readonly tourAnchor = input<OnboardingGuideAnchor | undefined>(undefined);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterAnchorComponent],
      providers: [],
    })
      .overrideComponent(CenterAnchorComponent, {
        remove: {
          imports: [TourAnchorMatMenuDirective],
        },
        add: {
          imports: [MockTourAnchorMatMenuDirective],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CenterAnchorComponent, {
      bindings: [inputBinding('anchorName', anchorName)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose anchorName input value', () => {
    expect(component.anchorName()).toBe('test-anchor');
  });

  it('should render center anchor element', () => {
    const element = compiled.querySelector('.center-anchor');

    expect(element).toBeTruthy();
  });

  it('should apply tourAnchor directive value', () => {
    const element = compiled.querySelector('.center-anchor');

    expect(element).toBeTruthy();
    expect(element!.getAttribute('data-anchor')).toBe('test-anchor');
  });

  it('should update rendered anchor when input changes', () => {
    anchorName.set('updated-anchor' as OnboardingGuideAnchor);
    fixture.detectChanges();

    expect(component.anchorName()).toBe('updated-anchor');

    const element = compiled.querySelector('.center-anchor');
    expect(element?.getAttribute('data-anchor')).toBe('updated-anchor');
  });

  it('should render only one anchor element', () => {
    expect(compiled.querySelectorAll('.center-anchor').length).toBe(1);
  });
});
