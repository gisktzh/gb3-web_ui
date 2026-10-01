import {Component, DOCUMENT, TemplateRef, viewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatDialogModule} from '@angular/material/dialog';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {describe, expect, beforeEach, afterEach, it} from 'vitest';
import {AnimatedDialogService} from './animated-dialog.service';

@Component({standalone: true, template: ''})
class TestDialogComponent {}

@Component({
  standalone: true,
  template: ` <ng-template #template> Test template </ng-template> `,
})
class TemplateHostComponent {
  public readonly template = viewChild.required<TemplateRef<unknown>>('template');
}

describe('AnimatedDialogService', () => {
  let service: AnimatedDialogService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [MatDialogModule], providers: [AnimatedDialogService, provideNoopAnimations()]});
    service = TestBed.inject(AnimatedDialogService);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((element) => {
      element.remove();
    });
  });

  it('should open a component dialog using MatDialog', () => {
    const ref = service.open(TestDialogComponent);

    expect(ref).toBeDefined();
    expect(ref.componentInstance).toBeInstanceOf(TestDialogComponent);

    ref.close();
  });

  it('should calculate and set the closing animation variables when the dialog closes', async () => {
    vi.useFakeTimers();
    const targetElement = document.createElement('div');
    document.body.appendChild(targetElement);
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      left: 50,
      width: 100,
      height: 100,
      right: 150,
      bottom: 150,
      x: 50,
      y: 50,
      toJSON: () => ({}),
    });
    service.registerAnimationTarget(TestDialogComponent, targetElement);
    const ref = service.open(TestDialogComponent);

    await vi.runAllTimersAsync();

    const dialogElement = document.getElementById(ref.id);

    expect(dialogElement).not.toBeNull();

    vi.spyOn(dialogElement!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 400,
      height: 200,
      right: 500,
      bottom: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });
    ref.close();

    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-x')).toBe('-200px');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-y')).toBe('-100px');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-scale')).toBe('0.25');
  });

  it('should use the most recently registered target for a dialog type', async () => {
    vi.useFakeTimers();

    const firstTarget = document.createElement('div');
    const secondTarget = document.createElement('div');
    document.body.append(firstTarget, secondTarget);

    vi.spyOn(firstTarget, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      width: 50,
      height: 50,
      right: 50,
      bottom: 50,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    vi.spyOn(secondTarget, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      left: 50,
      width: 100,
      height: 100,
      right: 150,
      bottom: 150,
      x: 50,
      y: 50,
      toJSON: () => ({}),
    });

    service.registerAnimationTarget(TestDialogComponent, firstTarget);
    service.registerAnimationTarget(TestDialogComponent, secondTarget);
    const ref = service.open(TestDialogComponent);

    await vi.runAllTimersAsync();

    const dialogElement = document.getElementById(ref.id);
    expect(dialogElement).not.toBeNull();

    vi.spyOn(dialogElement!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 400,
      height: 200,
      right: 500,
      bottom: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    ref.close();

    // Uses secondTarget, not firstTarget.
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-x')).toBe('-200px');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-y')).toBe('-100px');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-scale')).toBe('0.25');
  });

  it('should not set animation variables when no target is registered', async () => {
    vi.useFakeTimers();

    const ref = service.open(TestDialogComponent);

    await vi.runAllTimersAsync();

    const dialogElement = document.getElementById(ref.id);
    expect(dialogElement).not.toBeNull();

    ref.close();
    await vi.runAllTimersAsync();

    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-x')).toBe('');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-y')).toBe('');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-scale')).toBe('');
  });

  it('should not set animation variables for a template dialog', async () => {
    vi.useFakeTimers();
    // Deliberately obtain a TemplateRef through a tiny host component below.
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();

    const template = fixture.componentInstance.template();

    const ref = service.open(template);

    await vi.runAllTimersAsync();

    const dialogElement = document.getElementById(ref.id);
    expect(dialogElement).not.toBeNull();

    ref.close();

    await vi.runAllTimersAsync();

    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-x')).toBe('');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-y')).toBe('');
    expect(dialogElement!.style.getPropertyValue('--dialog-closing-target-scale')).toBe('');
  });

  it('should not set animation variables when the dialog element cannot be found', async () => {
    vi.useFakeTimers();
    const targetElement = document.createElement('div');
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    service.registerAnimationTarget(TestDialogComponent, targetElement);

    const ref = service.open(TestDialogComponent);

    await vi.runAllTimersAsync();

    const dialogElement = document.getElementById(ref.id);

    expect(dialogElement).not.toBeNull(); // Remove the dialog element before closing it.
    dialogElement!.remove();
    expect(() => ref.close()).not.toThrow();
  });
});
