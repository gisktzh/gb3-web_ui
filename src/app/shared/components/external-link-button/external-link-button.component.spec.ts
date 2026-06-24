import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExternalLinkButtonComponent} from './external-link-button.component';
import {inputBinding, signal} from '@angular/core';

describe('ExternalLinkButtonComponent', () => {
  let component: ExternalLinkButtonComponent;
  let fixture: ComponentFixture<ExternalLinkButtonComponent>;
  let compiled: HTMLElement;

  const url = signal<string>('https://example.com');
  const size = signal<'small' | 'regular'>('regular');
  const highlighted = signal<boolean>(false);
  const color = signal<'primary' | 'accent'>('primary');
  const toolTip = signal<string>('Open external link');
  const disableTabFocus = signal<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalLinkButtonComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalLinkButtonComponent, {
      bindings: [
        inputBinding('url', url),
        inputBinding('size', size),
        inputBinding('highlighted', highlighted),
        inputBinding('color', color),
        inputBinding('toolTip', toolTip),
        inputBinding('disableTabFocus', disableTabFocus),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind href correctly', () => {
    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link).toBeTruthy();
    expect(link?.href).toBe('https://example.com/');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
  });

  it('should apply small size class when size is small', () => {
    size.set('small');
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLElement>('.external-link-button');

    expect(link?.classList).toContain('external-link-button--small');
  });

  it('should not apply small class when size is regular', () => {
    size.set('regular');
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLElement>('.external-link-button');

    expect(link?.classList).not.toContain('external-link-button--small');
  });

  it('should apply highlighted class when highlighted is true', () => {
    highlighted.set(true);
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLElement>('.external-link-button');

    expect(link?.classList).toContain('external-link-button--highlighted');
  });

  it('should set accent color when color is accent', async () => {
    vi.useFakeTimers();
    color.set('accent');
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    const link = compiled.querySelector<HTMLElement>('.external-link-button');

    expect(link?.classList).toContain('mat-accent');
  });

  it('should set primary color when color is primary', async () => {
    vi.useFakeTimers();
    color.set('primary');
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    const link = compiled.querySelector<HTMLElement>('.external-link-button');

    expect(link?.classList).toContain('mat-primary');
  });

  it('should set tooltip and aria-label from toolTip input', async () => {
    vi.useFakeTimers();
    toolTip.set('Open in new tab');
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link?.getAttribute('aria-label')).toBe('Open in new tab');
  });

  it('should disable tab focus when disableTabFocus is true', () => {
    disableTabFocus.set(true);
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link?.getAttribute('tabindex')).toBe('-1');
  });

  it('should enable tab focus when disableTabFocus is false', () => {
    disableTabFocus.set(false);
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link?.getAttribute('tabindex')).toBe('0');
  });
});
