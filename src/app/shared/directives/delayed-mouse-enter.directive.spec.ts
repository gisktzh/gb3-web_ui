import {Component} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {DelayedMouseEnterDirective} from './delayed-mouse-enter.directive';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

@Component({
  template: ` <div [delayDurationInMs]="delay" (delayedMouseEnter)="mouseEnter()">Test</div> `,
  imports: [DelayedMouseEnterDirective],
  standalone: true,
})
class TestComponent {
  public delay = 1000;
  public mouseEnter = vi.fn();
}

describe('DelayedMouseEnterDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [TestComponent, DelayedMouseEnterDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    element = fixture.nativeElement.querySelector('div');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('emits delayedMouseEnter after the specified delay', () => {
    element.dispatchEvent(new MouseEvent('mouseenter'));
    expect(fixture.componentInstance.mouseEnter).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(fixture.componentInstance.mouseEnter).toHaveBeenCalledTimes(1);
  });

  it('cancels emission if mouseleave occurs before delay completes', () => {
    element.dispatchEvent(new MouseEvent('mouseenter'));
    element.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1000);
    expect(fixture.componentInstance.mouseEnter).not.toHaveBeenCalled();
  });

  it('clears timeout on destroy', () => {
    element.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.destroy();
    vi.advanceTimersByTime(1000);
    expect(fixture.componentInstance.mouseEnter).not.toHaveBeenCalled();
  });
});
