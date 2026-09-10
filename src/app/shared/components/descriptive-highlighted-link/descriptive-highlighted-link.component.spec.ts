import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DescriptiveHighlightedLinkComponent} from './descriptive-highlighted-link.component';
import {inputBinding, signal} from '@angular/core';

describe('DescriptiveHighlightedLinkComponent', () => {
  let component: DescriptiveHighlightedLinkComponent;
  let fixture: ComponentFixture<DescriptiveHighlightedLinkComponent>;
  let compiled: HTMLElement;

  const title = signal('Test title');
  const description = signal<string | undefined>(undefined);
  const id = signal<number | undefined>(undefined);
  const multiLine = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptiveHighlightedLinkComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptiveHighlightedLinkComponent, {
      bindings: [
        inputBinding('title', title),
        inputBinding('description', description),
        inputBinding('id', id),
        inputBinding('multiLine', multiLine),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and id', () => {
    id.set(5);
    fixture.detectChanges();

    const titleElement = compiled.querySelector<HTMLDivElement>('.descriptive-highlighted-link__content__title');

    expect(titleElement?.textContent).toContain('5 Test title');
  });

  it('should render description when provided', () => {
    description.set('A description text');
    fixture.detectChanges();

    const descriptionElement = compiled.querySelector<HTMLParagraphElement>('.descriptive-highlighted-link__content__description');

    expect(descriptionElement?.textContent).toContain('A description text');
  });

  it('should not render description when not provided', () => {
    description.set(undefined);
    fixture.detectChanges();

    const descriptionElement = compiled.querySelector<HTMLParagraphElement>('.descriptive-highlighted-link__content__description');

    expect(descriptionElement).toBeNull();
  });

  it('should add multiline class when multiLine is true', () => {
    multiLine.set(true);
    fixture.detectChanges();

    const container = compiled.querySelector<HTMLDivElement>('.descriptive-highlighted-link');

    expect(container?.classList).toContain('descriptive-highlighted-link--multiline');
  });

  it('should not add multiline class when multiLine is false', () => {
    multiLine.set(false);
    fixture.detectChanges();

    const container = compiled.querySelector<HTMLDivElement>('.descriptive-highlighted-link');

    expect(container?.classList).not.toContain('descriptive-highlighted-link--multiline');
  });
});
