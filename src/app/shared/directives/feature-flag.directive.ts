import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {FeatureFlags} from '../interfaces/feature-flags.interface';
import {FeatureFlagsService} from '../services/feature-flags.service';

@Directive({
  selector: '[featureFlag]',
  standalone: true,
})
export class FeatureFlagDirective {
  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  @Input() public set featureFlag(featureName: keyof FeatureFlags) {
    if (this.featureFlagsService.getFeatureFlag(featureName)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
