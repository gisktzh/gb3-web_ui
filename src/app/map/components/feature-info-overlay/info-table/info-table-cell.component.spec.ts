import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {InfoTableCellComponent} from './info-table-cell.component';
import {TableCell} from './info-table.types';

describe('InfoTableCellComponent', () => {
  let fixture: ComponentFixture<InfoTableCellComponent>;
  let compiled: HTMLElement;

  const cellValue = signal<TableCell>({cellType: 'text', displayValue: 'Parcel 42'});

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [InfoTableCellComponent]}).compileComponents();

    cellValue.set({cellType: 'text', displayValue: 'Parcel 42'});
    fixture = TestBed.createComponent(InfoTableCellComponent, {
      bindings: [inputBinding('cellValue', cellValue)],
    });
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders text values', () => {
    expect(compiled.textContent?.trim()).toBe('Parcel 42');
  });

  it('renders URLs as safe external links', () => {
    cellValue.set({cellType: 'url', displayValue: 'Cadastre', url: 'https://example.test/cadastre'});
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('a');
    expect(link?.textContent?.trim()).toBe('Cadastre');
    expect(link?.getAttribute('href')).toBe('https://example.test/cadastre');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.getAttribute('title')).toBe('Cadastre');
  });

  it('renders image metadata and uses default dimensions', () => {
    cellValue.set({
      cellType: 'image',
      displayValue: 'Legend symbol',
      url: 'https://example.test/legend',
      src: 'https://example.test/legend.png',
      alt: 'Blue area',
    });
    fixture.detectChanges();

    const image = compiled.querySelector<HTMLImageElement>('img');
    expect(image?.getAttribute('src')).toBe('https://example.test/legend.png');
    expect(image?.getAttribute('alt')).toBe('Blue area');
    expect(image?.getAttribute('width')).toBe('200');
    expect(image?.getAttribute('height')).toBe('200');
    expect(image?.closest('a')?.getAttribute('href')).toBe('https://example.test/legend');
  });

  it('honours explicit image dimensions', () => {
    cellValue.set({
      cellType: 'image',
      displayValue: 'Legend symbol',
      url: 'https://example.test/legend',
      src: 'https://example.test/legend.png',
      alt: 'Blue area',
      width: 24,
      height: 16,
    });
    fixture.detectChanges();

    const image = compiled.querySelector<HTMLImageElement>('img');
    expect(image?.getAttribute('width')).toBe('24');
    expect(image?.getAttribute('height')).toBe('16');
  });

  it('renders nested lists recursively', () => {
    cellValue.set({
      cellType: 'list',
      displayValue: '',
      items: [
        {cellType: 'text', displayValue: 'First'},
        {cellType: 'url', displayValue: 'Second', url: 'https://example.test/second'},
      ],
    });
    fixture.detectChanges();

    const items = compiled.querySelectorAll(':scope > .info-table-cell__list > li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent?.trim()).toBe('First');
    expect(items[1].querySelector('a')?.getAttribute('href')).toBe('https://example.test/second');
  });
});
