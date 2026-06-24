import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Gb2ExitButtonComponent} from './gb2-exit-button.component';
import {inputBinding, signal} from '@angular/core';

describe('Gb2ExitButtonComponent', () => {
  let component: Gb2ExitButtonComponent;
  let fixture: ComponentFixture<Gb2ExitButtonComponent>;
  let compiled: HTMLElement;

  const url = signal<string>('https://example.com/old-gis');
  const size = signal<'small' | 'regular'>('regular');
  const highlighted = signal<boolean>(false);
  const color = signal<'primary' | 'accent'>('primary');
  const disableTabFocus = signal<boolean>(false);

  const toolTip = signal<string | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gb2ExitButtonComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(Gb2ExitButtonComponent, {
      bindings: [
        inputBinding('url', url),
        inputBinding('size', size),
        inputBinding('highlighted', highlighted),
        inputBinding('color', color),
        inputBinding('disableTabFocus', disableTabFocus),
        inputBinding('toolTip', toolTip),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use default tooltip when none is provided', () => {
    fixture = TestBed.createComponent(Gb2ExitButtonComponent, {
      bindings: [
        inputBinding('url', url),
        inputBinding('size', size),
        inputBinding('highlighted', highlighted),
        inputBinding('color', color),
        inputBinding('disableTabFocus', disableTabFocus),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link).not.toBeNull();
    expect(link?.getAttribute('aria-label')).toContain('Diese Karte ist noch nicht im neuen GIS-Browser verfügbar');
  });

  it('should reflect overridden tooltip when provided', () => {
    toolTip.set('Custom tooltip text');
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link?.getAttribute('aria-label')).toBe('Custom tooltip text');
  });

  it('should inherit base external link behavior', () => {
    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
  });

  it('should still apply small size class via inherited template', () => {
    size.set('small');
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLElement>('.external-link-button');

    expect(link?.classList).toContain('external-link-button--small');
  });

  it('should still apply highlighted class via inherited template', () => {
    highlighted.set(true);
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLElement>('.external-link-button');

    expect(link?.classList).toContain('external-link-button--highlighted');
  });

  it('should respect disableTabFocus when true', () => {
    disableTabFocus.set(true);
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.external-link-button');

    expect(link?.getAttribute('tabindex')).toBe('-1');
  });
});
