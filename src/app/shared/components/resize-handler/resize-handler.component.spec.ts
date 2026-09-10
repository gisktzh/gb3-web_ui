import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Mock} from 'vitest';
import {ResizeHandlerComponent} from './resize-handler.component';
import {inputBinding, signal} from '@angular/core';
import {ResizeHandlerLocation} from '../../types/resize-handler-location.type';

describe('ResizeHandlerComponent', () => {
  let component: ResizeHandlerComponent;
  let fixture: ComponentFixture<ResizeHandlerComponent>;
  let compiled: HTMLElement;

  const minWidth = signal<number | undefined>(undefined);
  const minHeight = signal<number | undefined>(undefined);
  const maxWidth = signal<number | undefined>(0);
  const maxHeight = signal(0);
  const location = signal<ResizeHandlerLocation>('left');
  const usePrimaryColor = signal<boolean | undefined>(undefined);
  let resizeEventSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizeHandlerComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ResizeHandlerComponent, {
      bindings: [
        inputBinding('minWidth', minWidth),
        inputBinding('minHeight', minHeight),
        inputBinding('maxWidth', maxWidth),
        inputBinding('maxHeight', maxHeight),
        inputBinding('location', location),
        inputBinding('usePrimaryColor', usePrimaryColor),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    resizeEventSpy = vi.spyOn(component.resizeEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onResizeStart', () => {
    it('should activate resize state', () => {
      expect(component.isResizeActive()).toBe(false);

      component.onResizeStart();

      expect(component.isResizeActive()).toBe(true);
    });

    it('should apply resize-active class', () => {
      location.set('left');
      fixture.detectChanges();

      component.onResizeStart();
      fixture.detectChanges();

      const resizeHandle = compiled.querySelector('.resize-handle');
      expect(resizeHandle).not.toBeNull();
      expect(resizeHandle!.classList).toContain('resize-handle--right');
      expect(resizeHandle!.classList).toContain('resize-active');
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      minWidth.set(300);
      minHeight.set(220);
      maxWidth.set(1000);
      maxHeight.set(800);

      fixture.detectChanges();
    });

    it('should validate left resize correctly', () => {
      location.set('left');
      fixture.detectChanges();

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 500,
            height: 400,
          },
          edges: {},
        }),
      ).toBe(true);

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 200,
            height: 400,
          },
          edges: {},
        }),
      ).toBe(false);

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 1200,
            height: 400,
          },
          edges: {},
        }),
      ).toBe(false);
    });

    it('should validate right resize correctly', () => {
      location.set('right');
      fixture.detectChanges();

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 500,
            height: 400,
          },
          edges: {},
        }),
      ).toBe(true);

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 100,
            height: 400,
          },
          edges: {},
        }),
      ).toBe(false);
    });

    it('should validate top resize correctly', () => {
      location.set('top');
      fixture.detectChanges();

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 500,
            height: 400,
          },
          edges: {},
        }),
      ).toBe(true);

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 500,
            height: 100,
          },
          edges: {},
        }),
      ).toBe(false);

      expect(
        component.validate({
          rectangle: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 500,
            height: 1000,
          },
          edges: {},
        }),
      ).toBe(false);
    });

    it('should use viewport percentage as fallback max dimensions', () => {
      location.set('left');
      maxWidth.set(undefined);
      fixture.detectChanges();

      Object.defineProperty(window, 'innerWidth', {
        value: 1000,
        configurable: true,
      });

      expect(
        component.validate({
          rectangle: {
            width: 800,
            height: 300,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
          edges: {},
        }),
      ).toBe(true);

      expect(
        component.validate({
          rectangle: {
            width: 900,
            height: 300,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          edges: {},
        }),
      ).toBe(false);
    });
  });

  describe('onResizeEnd', () => {
    beforeEach(() => {
      resizeEventSpy.mockClear();
    });

    it('should update width style for left resize', () => {
      location.set('left');
      fixture.detectChanges();

      component.onResizeEnd({
        rectangle: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 450,
          height: 300,
        },
        edges: {},
      });

      expect(component.resizeableStyle()).toEqual({
        width: '450px',
      });

      expect(resizeEventSpy).toHaveBeenCalledWith({
        width: '450px',
      });

      expect(component.isResizeActive()).toBe(false);
    });

    it('should update width style for right resize', () => {
      location.set('right');
      fixture.detectChanges();

      component.onResizeEnd({
        rectangle: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 600,
          height: 300,
        },
        edges: {},
      });

      expect(component.resizeableStyle()).toEqual({
        width: '600px',
      });
    });

    it('should update fixed height style for top resize', () => {
      location.set('top');
      fixture.detectChanges();

      component.onResizeEnd({
        rectangle: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 600,
          height: 350,
        },
        edges: {},
      });

      expect(component.resizeableStyle()).toEqual({
        position: 'fixed',
        height: '350px',
      });

      expect(resizeEventSpy).toHaveBeenCalledWith({
        position: 'fixed',
        height: '350px',
      });
    });
  });

  describe('template bindings', () => {
    it('should render top indicator only for top location', () => {
      location.set('top');
      fixture.detectChanges();

      expect(compiled.querySelector('.resize-handle--top-indicator')).toBeTruthy();

      location.set('left');
      fixture.detectChanges();

      expect(compiled.querySelector('.resize-handle--top-indicator')).toBeFalsy();
    });

    it('should apply primary class when usePrimaryColor is true', () => {
      location.set('top');
      usePrimaryColor.set(true);

      fixture.detectChanges();

      expect(compiled.querySelector('.resize-handle--top-indicator')?.classList).toContain('resize-handle--top-indicator--primary');
    });

    it('should configure right resize edge for left location', () => {
      location.set('left');
      fixture.detectChanges();

      const handle = compiled.querySelector('.resize-handle');

      expect(handle?.classList).toContain('resize-handle--right');
    });

    it('should configure left resize edge for right location', () => {
      location.set('right');
      fixture.detectChanges();

      const handle = compiled.querySelector('.resize-handle');

      expect(handle?.classList).toContain('resize-handle--left');
    });
  });
});
