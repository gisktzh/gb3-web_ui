import {Component} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {ClickOnSpaceBarDirective} from './click-on-spacebar.directive';

@Component({
  template: `<button clickOnSpaceBar (click)="onClick()">Click me</button>`,
  imports: [ClickOnSpaceBarDirective],
  standalone: true,
})
class TestComponent {
  public onClick = vi.fn();
}

describe('ClickOnSpaceBarDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, ClickOnSpaceBarDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    button = fixture.nativeElement.querySelector('button');
  });

  it('clicks the element when space bar is pressed', () => {
    const clickSpy = vi.spyOn(button, 'click');

    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
    });

    button.dispatchEvent(event);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('prevents default behavior on space key press', () => {
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    button.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
