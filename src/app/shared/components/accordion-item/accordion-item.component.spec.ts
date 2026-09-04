import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {AccordionItemComponent} from './accordion-item.component';
import {inputBinding, signal} from '@angular/core';

describe('AccordionItemComponent', () => {
  let component: AccordionItemComponent;
  let fixture: ComponentFixture<AccordionItemComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const variant = signal<'light' | 'dark' | 'grey'>('light');
  const header = signal('Test header');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionItemComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture = TestBed.createComponent(AccordionItemComponent, {
      bindings: [inputBinding('variant', variant), inputBinding('header', header)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header', () => {
    const headerElement = compiled.querySelector<HTMLHeadingElement>('h4');

    expect(headerElement?.textContent).toContain('Test header');
  });

  it('should apply light variant class', () => {
    const content = compiled.querySelector<HTMLElement>('.accordion-item__content');

    expect(content?.classList).toContain('accordion-item__content--light');
  });

  it('should apply dark variant class', () => {
    variant.set('dark');
    fixture.detectChanges();

    const content = compiled.querySelector<HTMLElement>('.accordion-item__content');

    expect(content?.classList).toContain('accordion-item__content--dark');
  });

  it('should apply grey variant class', () => {
    variant.set('grey');
    fixture.detectChanges();

    const content = compiled.querySelector<HTMLElement>('.accordion-item__content');

    expect(content?.classList).toContain('accordion-item__content--grey');
  });

  it('should generate aria identifier from header', () => {
    expect(component.ariaIdentifier()).toBe(btoa('Test header'));
  });

  it('should toggle accordion on click of header', () => {
    const headerElement = compiled.querySelector<HTMLElement>('.accordion-item__content__header');

    expect(headerElement).toBeTruthy();

    headerElement?.click();
    fixture.detectChanges();

    const body = compiled.querySelector<HTMLElement>('.accordion-item__content__body');

    expect(body?.style.display).toBe('');
  });

  it('should hide body initially', () => {
    const body = compiled.querySelector<HTMLElement>('.accordion-item__content__body');

    expect(body?.style.display).toBe('none');
  });

  it('should show add icon when collapsed', () => {
    const icon = compiled.querySelector<HTMLElement>('mat-icon');

    expect(icon?.getAttribute('data-mat-icon-name')).toBe('ktzh_add');
  });

  it('should toggle via keyboard enter event', () => {
    const accordion = compiled.querySelector<HTMLElement>('cdk-accordion-item');

    expect(accordion).toBeTruthy();

    accordion?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
    fixture.detectChanges();

    const body = compiled.querySelector<HTMLElement>('.accordion-item__content__body');

    expect(body?.style.display).toBe('');
  });

  it('should toggle via keyboard spacebar event', () => {
    const accordion = compiled.querySelector<HTMLElement>('cdk-accordion-item');

    expect(accordion).toBeTruthy();

    accordion?.dispatchEvent(new KeyboardEvent('keydown', {key: 'space'}));
    fixture.detectChanges();

    const body = compiled.querySelector<HTMLElement>('.accordion-item__content__body');

    expect(body?.style.display).toBe('');
  });

  it('should call click on anchor target when toggle receives anchor event', () => {
    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click');

    const event = {
      preventDefault: vi.fn(),
      target: anchor,
    } as unknown as Event;

    component.toggle(event);

    expect(clickSpy).toHaveBeenCalled();
  });
});
