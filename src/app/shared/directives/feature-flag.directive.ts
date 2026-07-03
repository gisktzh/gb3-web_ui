import {Directive, TemplateRef, ViewContainerRef, inject, input, effect} from '@angular/core';
import {FeatureFlags} from '../interfaces/feature-flags.interface';
import {FeatureFlagsService} from '../services/feature-flags.service';

@Directive({
  selector: '[featureFlag]',
  standalone: true,
})
export class FeatureFlagDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly featureFlagsService = inject(FeatureFlagsService);

  public readonly featureFlag = input.required<keyof FeatureFlags>();

  constructor() {
    effect(() => {
      const featureName = this.featureFlag();
      const isEnabled = this.featureFlagsService.getFeatureFlag(featureName);

      this.viewContainer.clear();

      if (isEnabled) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
