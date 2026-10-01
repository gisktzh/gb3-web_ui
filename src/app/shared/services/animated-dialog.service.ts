import {ComponentType} from '@angular/cdk/overlay';
import {Injectable, TemplateRef, Type} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

@Injectable({providedIn: 'root'})
export class AnimatedDialogService extends MatDialog {
  private readonly animationTargets = new Map<Type<unknown>, HTMLElement>();

  public registerAnimationTarget(dialog: Type<unknown>, element: HTMLElement) {
    this.animationTargets.set(dialog, element);
  }

  public unregisterAnimationTarget(dialog: Type<unknown>) {
    this.animationTargets.delete(dialog);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override open<T, D = any, R = any>(
    componentOrTemplate: ComponentType<T> | TemplateRef<T>,
    config?: MatDialogConfig<D>,
  ): MatDialogRef<T, R> {
    const ref = super.open(componentOrTemplate, config);

    ref.beforeClosed().subscribe(() => {
      if (!this.isComponentType(componentOrTemplate)) {
        return;
      }

      const animationTarget = this.getTargetFor(componentOrTemplate);
      const dialogEl = document.getElementById(ref.id);
      if (!dialogEl || !animationTarget) {
        return;
      }

      this.setAnimationProperties(dialogEl, animationTarget);
    });

    return ref;
  }

  private setAnimationProperties(dialog: HTMLElement, animationTarget: HTMLElement) {
    const dialogRect = dialog.getBoundingClientRect();
    const targetRect = animationTarget.getBoundingClientRect();

    const translateX = targetRect.left + targetRect.width / 2 - (dialogRect.left + dialogRect.width / 2);
    const translateY = targetRect.top + targetRect.height / 2 - (dialogRect.top + dialogRect.height / 2);
    const scale = Math.min(targetRect.width / dialogRect.width, targetRect.height / dialogRect.height);

    dialog.style.setProperty('--dialog-closing-target-x', `${translateX}px`);
    dialog.style.setProperty('--dialog-closing-target-y', `${translateY}px`);
    dialog.style.setProperty('--dialog-closing-target-scale', `${scale}`);
  }

  private getTargetFor(dialogClass: Type<unknown>) {
    return this.animationTargets.get(dialogClass);
  }

  private isComponentType<T>(componentOrTemplate: ComponentType<T> | TemplateRef<T>): componentOrTemplate is ComponentType<T> {
    return !(componentOrTemplate instanceof TemplateRef);
  }
}
