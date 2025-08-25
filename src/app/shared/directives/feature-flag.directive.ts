import {Directive, Input, TemplateRef, ViewContainerRef, inject} from '@angular/core';
import {FeatureFlags} from '../interfaces/feature-flags.interface';
import {FeatureFlagsService} from '../services/feature-flags.service';

@Directive({
  selector: '[featureFlag]',
  standalone: true,
})
export class FeatureFlagDirective {
  private readonly templateRef = inject<TemplateRef<never>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly featureFlagsService = inject(FeatureFlagsService);

  @Input() public set featureFlag(featureName: keyof FeatureFlags) {
    if (this.featureFlagsService.getFeatureFlag(featureName)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
