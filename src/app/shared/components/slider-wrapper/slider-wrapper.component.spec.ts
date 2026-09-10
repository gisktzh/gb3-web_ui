import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SliderWrapperComponent} from './slider-wrapper.component';
import {Component, inputBinding, signal} from '@angular/core';

describe('SliderWrapperComponent', () => {
  let component: SliderWrapperComponent<string>;
  let fixture: ComponentFixture<SliderWrapperComponent<string>>;
  let compiled: HTMLElement;

  const title = signal('Lorem ipsum');
  const description = signal<string | undefined>(undefined);
  const value = signal('12%');
  const maxValue = signal('100%');
  const minValue = signal('0%');
  const overwriteHeader = signal(false);
  const overwriteFooter = signal(false);

  describe('standalone behaviour', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SliderWrapperComponent],
        providers: [],
      }).compileComponents();

      fixture = TestBed.createComponent(SliderWrapperComponent<string>, {
        bindings: [
          inputBinding('title', title),
          inputBinding('description', description),
          inputBinding('value', value),
          inputBinding('maxValue', maxValue),
          inputBinding('minValue', minValue),
          inputBinding('overwriteHeader', overwriteHeader),
          inputBinding('overwriteFooter', overwriteFooter),
        ],
      });

      component = fixture.componentInstance;
      compiled = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display the given fields correctly', () => {
      const footerContainers = compiled.querySelectorAll('.slider-wrapper__footer > *');
      expect(footerContainers[0].textContent).toBe(minValue());
      expect(footerContainers[1].textContent).toBe(maxValue());

      expect(compiled.querySelector('.slider-wrapper__header__value')?.textContent).toBe(value());
      expect(compiled.querySelector('.slider-wrapper__header__title__text')?.textContent).toBe(title());
      expect(compiled.querySelectorAll('.slider-wrapper__header__title__info')?.length).toBe(0);

      const newDescription = 'Dolor sit amet';
      description.set(newDescription);
      fixture.detectChanges();

      const descriptionEls = compiled.querySelectorAll('.slider-wrapper__header__title__info');
      expect(descriptionEls?.length).toBe(1);
      expect(descriptionEls[0].textContent).toBe('info');
    });
  });

  describe('behaviour with overwritten header', () => {
    beforeEach(() => {
      overwriteHeader.set(false);
      overwriteFooter.set(false);

      @Component({
        template: `
          <slider-wrapper
            [title]="title()"
            [description]="description()"
            [value]="value()"
            [maxValue]="maxValue()"
            [minValue]="minValue()"
            [overwriteHeader]="overwriteHeader()"
            [overwriteFooter]="overwriteFooter()"
          >
            <div class="replacement-header" header>This is a replacement header</div>
          </slider-wrapper>
        `,
        imports: [SliderWrapperComponent],
      })
      class HeaderHavingHost extends SliderWrapperComponent<string> {}

      fixture = TestBed.createComponent(HeaderHavingHost, {
        bindings: [
          inputBinding('title', title),
          inputBinding('description', description),
          inputBinding('value', value),
          inputBinding('maxValue', maxValue),
          inputBinding('minValue', minValue),
          inputBinding('overwriteHeader', overwriteHeader),
          inputBinding('overwriteFooter', overwriteFooter),
        ],
      });

      component = fixture.componentInstance;
      compiled = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    it('should overwrite the header if the appropriate flag is set', async () => {
      vi.useFakeTimers();
      expect(compiled.querySelectorAll('.slider-wrapper__header__title').length).toBe(1);
      expect(compiled.textContent).not.toContain('This is a replacement header');
      overwriteHeader.set(true);
      fixture.detectChanges();

      await vi.runAllTimersAsync();

      expect(compiled.querySelectorAll('.slider-wrapper__header__title').length).toBe(0);
      expect(compiled.textContent).toContain('This is a replacement header');

      // Assert that the footer hasn't been touched
      const footerContainers = compiled.querySelectorAll('.slider-wrapper__footer > *');
      expect(footerContainers[0].textContent).toBe(minValue());
      expect(footerContainers[1].textContent).toBe(maxValue());
    });
  });

  describe('behaviour with overwritten footer', () => {
    beforeEach(() => {
      overwriteHeader.set(false);
      overwriteFooter.set(false);

      @Component({
        template: `
          <slider-wrapper
            [title]="title()"
            [description]="description()"
            [value]="value()"
            [maxValue]="maxValue()"
            [minValue]="minValue()"
            [overwriteHeader]="overwriteHeader()"
            [overwriteFooter]="overwriteFooter()"
          >
            <div class="replacement-footer" footer>This is a replacement footer</div>
          </slider-wrapper>
        `,
        imports: [SliderWrapperComponent],
      })
      class HeaderHavingHost extends SliderWrapperComponent<string> {}

      fixture = TestBed.createComponent(HeaderHavingHost, {
        bindings: [
          inputBinding('title', title),
          inputBinding('description', description),
          inputBinding('value', value),
          inputBinding('maxValue', maxValue),
          inputBinding('minValue', minValue),
          inputBinding('overwriteHeader', overwriteHeader),
          inputBinding('overwriteFooter', overwriteFooter),
        ],
      });

      component = fixture.componentInstance;
      compiled = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    it('should overwrite the footer if the appropriate flag is set', async () => {
      vi.useFakeTimers();

      expect(compiled.querySelectorAll('.slider-wrapper__header__title').length).toBe(1);
      expect(compiled.textContent).not.toContain('This is a replacement footer');
      overwriteFooter.set(true);
      fixture.detectChanges();

      await vi.runAllTimersAsync();

      expect(compiled.querySelectorAll('.slider-wrapper__header__title').length).toBe(1);
      expect(compiled.textContent).toContain('This is a replacement footer');
      const footerContainers = compiled.querySelectorAll('.slider-wrapper__footer > *');
      expect(footerContainers.length).toBe(0);

      // Assert that the header hasn't been touched
      expect(compiled.querySelectorAll('.slider-wrapper__header__title').length).toBe(1);
    });
  });
});
