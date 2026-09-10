import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Clipboard} from '@angular/cdk/clipboard';
import {ContactDetailComponent} from './contact-detail.component';
import {inputBinding, signal} from '@angular/core';

describe('ContactDetailComponent', () => {
  let component: ContactDetailComponent;
  let fixture: ComponentFixture<ContactDetailComponent>;
  let compiled: HTMLElement;

  const clipboardMock: Partial<Clipboard> = {
    copy: vi.fn(),
  };
  const contactType = signal<'address' | 'email' | 'link'>('address');
  const street = signal('Bahnhofstrasse 1');
  const place = signal('8000 Zürich');
  const email = signal('test@example.com');
  const coordinates = signal('47.3769,8.5417');
  const url = signal('https://example.com');
  const title = signal('Example');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailComponent],
      providers: [{provide: Clipboard, useValue: clipboardMock}],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailComponent, {
      bindings: [
        inputBinding('contactType', contactType),
        inputBinding('street', street),
        inputBinding('place', place),
        inputBinding('email', email),
        inputBinding('coordinates', coordinates),
        inputBinding('url', url),
        inputBinding('title', title),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render email contact details', () => {
    contactType.set('email');
    fixture.detectChanges();

    const emailLink = compiled.querySelector<HTMLAnchorElement>('.contact-detail__address a');

    expect(emailLink?.textContent).toContain('test@example.com');
    expect(emailLink?.getAttribute('href')).toBe('mailto:test@example.com');
  });

  it('should render link contact details', () => {
    contactType.set('link');
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.contact-detail__address a');

    expect(link?.textContent).toContain('Example');
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('target')).toBe('_blank');
  });

  it('should render address contact details', () => {
    contactType.set('address');
    fixture.detectChanges();

    const address = compiled.querySelector<HTMLElement>('.contact-detail__address address');

    expect(address?.textContent).toContain('Bahnhofstrasse 1');
    expect(address?.textContent).toContain('8000 Zürich');

    const routeLink = compiled.querySelector<HTMLAnchorElement>('.contact-detail__links a');

    expect(routeLink?.getAttribute('href')).toContain('https://www.google.com/maps/dir/?api=1&destination=47.3769,8.5417');
  });

  it('should copy address when clicking copy link', () => {
    contactType.set('address');
    fixture.detectChanges();

    const copyLink = compiled.querySelector<HTMLAnchorElement>('.contact-detail__links a[title="Adresse kopieren"]');

    copyLink?.click();

    expect(clipboardMock.copy).toHaveBeenCalledWith('Bahnhofstrasse 1, 8000 Zürich');
  });

  it('should prevent default event behaviour when copying address', () => {
    const preventDefaultSpy = vi.fn();

    component.copyToClipboard({
      preventDefault: preventDefaultSpy,
    } as unknown as Event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should render location icon for address contact type', () => {
    contactType.set('address');
    fixture.detectChanges();

    const icon = compiled.querySelector<HTMLElement>('mat-icon');

    expect(icon?.getAttribute('data-mat-icon-name')).toBe('ktzh_location');
  });

  it('should render email icon for non-address contact types', () => {
    contactType.set('email');
    fixture.detectChanges();

    const icon = compiled.querySelector<HTMLElement>('mat-icon');

    expect(icon?.getAttribute('data-mat-icon-name')).toBe('ktzh_envelope_open');
  });
});
