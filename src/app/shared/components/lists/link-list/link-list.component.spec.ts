import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LinkListComponent} from './link-list.component';
import {inputBinding, signal} from '@angular/core';
import {LinksGroup} from 'src/app/shared/interfaces/links-group.interface';

describe('LinkListComponent', () => {
  let component: LinkListComponent;
  let fixture: ComponentFixture<LinkListComponent>;
  let compiled: HTMLElement;

  const linksGroups = signal<LinksGroup[]>([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkListComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkListComponent, {
      bindings: [inputBinding('linksGroups', linksGroups)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no link groups when linksGroups is empty', () => {
    expect(compiled.querySelectorAll('.link-list').length).toBe(0);
  });

  it('should render one link list per links group', () => {
    linksGroups.set([
      {
        label: 'Group 1',
        links: [
          {
            href: 'https://example.com/one',
            title: 'First',
          },
        ],
      },
      {
        label: 'Group 2',
        links: [
          {
            href: 'https://example.com/two',
            title: 'Second',
          },
        ],
      },
    ]);

    fixture.detectChanges();

    const groups = compiled.querySelectorAll<HTMLDivElement>('.link-list');

    expect(groups.length).toBe(2);
  });

  it('should render group labels', () => {
    linksGroups.set([
      {
        label: 'External Links',
        links: [],
      },
      {
        label: 'Internal Links',
        links: [],
      },
    ]);

    fixture.detectChanges();

    const headings = compiled.querySelectorAll<HTMLHeadingElement>('.ktzh-h3-medium');

    expect(headings.length).toBe(2);
    expect(headings[0]?.textContent).toContain('External Links');
    expect(headings[1]?.textContent).toContain('Internal Links');
  });

  it('should pass links to link list item components', () => {
    linksGroups.set([
      {
        label: 'Links',
        links: [
          {
            href: 'https://example.com/example',
            title: 'Example',
          },
        ],
      },
    ]);

    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.link-list-item__item__link');

    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Example');
  });

  it('should update rendered groups when linksGroups changes', () => {
    linksGroups.set([
      {
        label: 'First',
        links: [],
      },
    ]);

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.link-list').length).toBe(1);

    linksGroups.set([
      {
        label: 'First',
        links: [],
      },
      {
        label: 'Second',
        links: [],
      },
      {
        label: 'Third',
        links: [],
      },
    ]);

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.link-list').length).toBe(3);
  });
});
