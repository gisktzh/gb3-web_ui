import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LinkGridListItemComponent} from './link-grid-list-item.component';
import {inputBinding, signal} from '@angular/core';
import {MainPage} from 'src/app/shared/enums/main-page.enum';

describe('LinkGridListItemComponent', () => {
  let component: LinkGridListItemComponent;
  let fixture: ComponentFixture<LinkGridListItemComponent>;
  let compiled: HTMLElement;

  const title = signal('Test title');
  const url = signal<string | undefined>(undefined);
  const internalLink = signal<MainPage | undefined>(undefined);
  const internalQueryParams = signal<Record<string, string> | undefined>(undefined);
  const entryType = signal<string | undefined>(undefined);
  const entryDate = signal<string | undefined>(undefined);
  const size = signal<'small' | 'large'>('small');
  const imageUrl = signal<string | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkGridListItemComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkGridListItemComponent, {
      bindings: [
        inputBinding('title', title),
        inputBinding('url', url),
        inputBinding('internalLink', internalLink),
        inputBinding('internalQueryParams', internalQueryParams),
        inputBinding('entryType', entryType),
        inputBinding('entryDate', entryDate),
        inputBinding('size', size),
        inputBinding('imageUrl', imageUrl),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('external link', () => {
    beforeEach(() => {
      internalLink.set(undefined);
      url.set('https://example.com');
      fixture.detectChanges();
    });

    it('should render external link', () => {
      const link = compiled.querySelector<HTMLAnchorElement>('.link-grid-list-item__wrapper');

      expect(link).toBeTruthy();
      expect(link?.href).toBe('https://example.com/');
      expect(link?.target).toBe('_blank');
      expect(link?.rel).toBe('noopener noreferrer');
    });

    it('should bind title attribute', () => {
      const link = compiled.querySelector<HTMLAnchorElement>('.link-grid-list-item__wrapper');

      expect(link?.title).toBe('Test title');
    });
  });

  describe('internal link', () => {
    it('should render router link when internalLink is set', () => {
      internalLink.set(MainPage.Start);
      internalQueryParams.set({
        test: 'value',
      });

      fixture.detectChanges();

      const link = compiled.querySelector<HTMLAnchorElement>('.link-grid-list-item__wrapper');

      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toContain(MainPage.Start);
    });
  });

  describe('size handling', () => {
    it('should apply large class when size is large', () => {
      size.set('large');

      fixture.detectChanges();

      const item = compiled.querySelector<HTMLLIElement>('.link-grid-list-item');

      expect(item?.classList).toContain('link-grid-list-item--large');
    });

    it('should not apply large class when size is small', () => {
      size.set('small');

      fixture.detectChanges();

      const item = compiled.querySelector<HTMLLIElement>('.link-grid-list-item');

      expect(item?.classList).not.toContain('link-grid-list-item--large');
    });
  });

  describe('content rendering', () => {
    it('should render entry type when provided', () => {
      entryType.set('News');

      fixture.detectChanges();

      const header = compiled.querySelector<HTMLElement>('.link-grid-list-item__wrapper__content__header');

      expect(header?.textContent).toContain('News');
    });

    it('should render entry date when provided', () => {
      entryDate.set('2026-06-17');

      fixture.detectChanges();

      const header = compiled.querySelector<HTMLElement>('.link-grid-list-item__wrapper__content__header');

      expect(header?.textContent).toContain('2026-06-17');
    });

    it('should not render entry type when not provided', () => {
      entryType.set(undefined);

      fixture.detectChanges();

      const header = compiled.querySelector<HTMLElement>('.link-grid-list-item__wrapper__content__header');

      expect(header?.textContent).not.toContain('News');
    });

    it('should render title', () => {
      const titleElement = compiled.querySelector<HTMLElement>('.link-grid-list-item__wrapper__content__title');

      expect(titleElement?.textContent).toContain('Test title');
    });
  });

  describe('image rendering', () => {
    it('should render image for large items with imageUrl', () => {
      size.set('large');
      imageUrl.set('https://example.com/image.png');

      fixture.detectChanges();

      const image = compiled.querySelector<HTMLImageElement>('.link-grid-list-item__wrapper__image');

      expect(image).toBeTruthy();
      expect(image?.src).toBe('https://example.com/image.png');
    });

    it('should not render image for small items', () => {
      size.set('small');
      imageUrl.set('https://example.com/image.png');

      fixture.detectChanges();

      expect(compiled.querySelector('.link-grid-list-item__wrapper__image')).toBeFalsy();
    });

    it('should not render image without imageUrl', () => {
      size.set('large');
      imageUrl.set(undefined);

      fixture.detectChanges();

      expect(compiled.querySelector('.link-grid-list-item__wrapper__image')).toBeFalsy();
    });
  });
});
