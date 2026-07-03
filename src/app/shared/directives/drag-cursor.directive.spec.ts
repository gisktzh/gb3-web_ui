import {Component} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {DragCursorDirective} from './drag-cursor.directive';

@Component({
  template: `<div cdkDrag dragCursor><span>Test</span></div>`,
  imports: [DragCursorDirective],
  standalone: true,
})
class TestComponent {}

describe('DragCursorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  let started$: Subject<void>;
  let ended$: Subject<void>;

  beforeEach(() => {
    started$ = new Subject<void>();
    ended$ = new Subject<void>();

    TestBed.configureTestingModule({
      imports: [TestComponent, DragCursorDirective],
      providers: [
        {
          provide: CdkDrag,
          useValue: {
            started: started$.asObservable(),
            ended: ended$.asObservable(),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const body = fixture.debugElement.nativeElement.ownerDocument.body;
    body.style.cursor = 'pointer';
  });

  it('sets cursor to grabbing on drag start', () => {
    const setPropertySpy = vi.spyOn(document.body.style, 'setProperty');
    started$.next();

    expect(setPropertySpy).toHaveBeenCalledWith('cursor', 'grabbing');
  });

  it('resets cursor to auto on drag end', () => {
    const setPropertySpy = vi.spyOn(document.body.style, 'setProperty');
    started$.next();
    ended$.next();

    expect(setPropertySpy).toHaveBeenCalledWith('cursor', 'auto');
  });
});
