import {Directive, effect, ElementRef, inject, input, Type} from '@angular/core';
import {AnimatedDialogService} from 'src/app/shared/services/animated-dialog.service';

@Directive({
  selector: '[animationTargetForDialog]',
  standalone: true,
})
export class AnimationTargetForDialogDirective {
  public readonly animationTargetForDialog = input.required<Type<unknown>>();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly animatedDialogService = inject(AnimatedDialogService);

  constructor() {
    effect((onCleanup) => {
      const target = this.animationTargetForDialog();
      this.animatedDialogService.registerAnimationTarget(target, this.elementRef.nativeElement);

      onCleanup(() => {
        this.animatedDialogService.unregisterAnimationTarget(target);
      });
    });
  }
}
