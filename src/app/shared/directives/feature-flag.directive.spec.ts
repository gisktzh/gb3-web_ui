import {FeatureFlagDirective} from './feature-flag.directive';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideMockStore} from '@ngrx/store/testing';
import {FeatureFlagsService} from '../services/feature-flags.service';
import {FeatureFlags} from '../interfaces/feature-flags.interface';

const featureFlagToCheck: keyof FeatureFlags = 'oerebExtract';
@Component({
  standalone: true,
  template: `<div><span *featureFlag="featureFlagToCheck">Test</span></div>`,
  imports: [FeatureFlagDirective],
})
class TestComponent {
  public featureFlagToCheck: keyof FeatureFlags = featureFlagToCheck;
}

describe('FeatureFlagDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let service: FeatureFlagsService;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      providers: [provideMockStore(), FeatureFlagsService],
      imports: [FeatureFlagDirective, TestComponent],
    }).createComponent(TestComponent);

    service = TestBed.inject(FeatureFlagsService);
  });

  it('calls FeatureFlagService.getFeatureFlag with the supplied flag', () => {
    const spy = spyOn(service, 'getFeatureFlag').and.callThrough();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledOnceWith(featureFlagToCheck);
  });

  it('should not render element if feature flag is false', () => {
    spyOn(service, 'getFeatureFlag').and.returnValue(false);
    fixture.detectChanges();

    const elementQuery = fixture.debugElement.query(By.css('span'));

    expect(elementQuery).toBeNull();
  });

  it('should render element if feature flag is true', () => {
    spyOn(service, 'getFeatureFlag').and.returnValue(true);
    fixture.detectChanges();

    const elementQuery = fixture.debugElement.query(By.css('span'));

    expect(elementQuery).not.toBeNull();
  });
});
