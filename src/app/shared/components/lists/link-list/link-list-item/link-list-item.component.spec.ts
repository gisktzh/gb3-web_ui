import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LinkListItemComponent} from './link-list-item.component';
import {inputBinding, signal} from '@angular/core';
import {LinkObject} from 'src/app/shared/interfaces/link-object.interface';

describe('LinkListItemComponent', () => {
  let component: LinkListItemComponent;
  let fixture: ComponentFixture<LinkListItemComponent>;
  let compiled: HTMLElement;

  const links = signal<LinkObject[]>([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkListItemComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkListItemComponent, {
      bindings: [inputBinding('links', links)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no items when links are empty', () => {
    expect(compiled.querySelectorAll('.link-list-item__item').length).toBe(0);
  });

  it('should render a link item for every link', () => {
    links.set([
      {
        href: 'https://example.com/one',
        title: 'First link',
      },
      {
        href: 'https://example.com/two',
        title: 'Second link',
      },
    ]);

    fixture.detectChanges();

    const items = compiled.querySelectorAll<HTMLLIElement>('.link-list-item__item');

    expect(items.length).toBe(2);

    expect(items[0]?.textContent).toContain('First link');
    expect(items[1]?.textContent).toContain('Second link');
  });

  it('should use href as title when link title is missing', () => {
    links.set([
      {
        href: 'https://example.com/no-title',
      },
    ]);

    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.link-list-item__item__link');

    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('https://example.com/no-title');
    expect(link?.title).toBe('https://example.com/no-title');
  });

  it('should bind href correctly', () => {
    links.set([
      {
        href: 'https://example.com/page',
        title: 'Example',
      },
    ]);

    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.link-list-item__item__link');

    expect(link?.href).toBe('https://example.com/page');
  });

  it('should render link attributes correctly', () => {
    links.set([
      {
        href: 'https://example.com/page',
        title: 'Example',
      },
    ]);

    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.link-list-item__item__link');

    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
  });

  it('should render an arrow icon for each link', () => {
    links.set([
      {
        href: 'https://example.com/one',
      },
      {
        href: 'https://example.com/two',
      },
    ]);

    fixture.detectChanges();

    const icons = compiled.querySelectorAll<HTMLElement>('.link-list-item__item__link__icon');

    expect(icons.length).toBe(2);
  });

  it('should update rendered items when links change', () => {
    links.set([
      {
        href: 'https://example.com/one',
      },
    ]);

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.link-list-item__item').length).toBe(1);

    links.set([
      {
        href: 'https://example.com/one',
      },
      {
        href: 'https://example.com/two',
      },
      {
        href: 'https://example.com/three',
      },
    ]);

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.link-list-item__item').length).toBe(3);
  });
});
