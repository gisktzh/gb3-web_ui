import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {OerebExtractListItem} from 'src/app/map/types/oereb-extract-list-item.type';
import {OerebInfoValueComponent} from './oereb-info-value.component';

describe('OerebInfoValueComponent', () => {
  let fixture: ComponentFixture<OerebInfoValueComponent>;
  let compiled: HTMLElement;

  const item = signal<OerebExtractListItem>({itemType: 'text', itemLabel: 'Area', text: '120m2'});

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [OerebInfoValueComponent]}).compileComponents();

    item.set({itemType: 'text', itemLabel: 'Area', text: '120m2'});
    fixture = TestBed.createComponent(OerebInfoValueComponent, {bindings: [inputBinding('item', item)]});
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders text values', () => {
    expect(compiled.textContent?.trim()).toBe('120m2');
  });

  it('renders external URLs with their label', () => {
    item.set({itemType: 'url', itemLabel: 'Legal provision', url: 'https://example.test/law'});
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('a');
    expect(link?.textContent?.trim()).toBe('Legal provision');
    expect(link?.getAttribute('href')).toBe('https://example.test/law');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders image links with the supplied dimensions and alternative text', () => {
    item.set({
      itemType: 'image',
      itemLabel: 'Illustration',
      url: 'https://example.test/map',
      src: 'https://example.test/map.png',
      alt: 'Restriction map',
      width: 23,
      height: 13,
    });
    fixture.detectChanges();

    const image = compiled.querySelector<HTMLImageElement>('img');
    expect(image?.getAttribute('src')).toBe('https://example.test/map.png');
    expect(image?.getAttribute('alt')).toBe('Restriction map');
    expect(image?.getAttribute('width')).toBe('23');
    expect(image?.getAttribute('height')).toBe('13');
    expect(image?.closest('a')?.getAttribute('href')).toBe('https://example.test/map');
  });

  it('renders nested values recursively', () => {
    item.set({
      itemType: 'list',
      itemLabel: 'Details',
      items: [
        {itemType: 'text', itemLabel: 'Area', text: '120m2'},
        {itemType: 'url', itemLabel: 'Office', url: 'https://example.test/office'},
      ],
    });
    fixture.detectChanges();

    const items = compiled.querySelectorAll(':scope > .oereb-detail-list > li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent?.trim()).toBe('120m2');
    expect(items[1].querySelector('a')?.textContent?.trim()).toBe('Office');
  });
});
