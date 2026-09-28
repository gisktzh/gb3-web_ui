import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {OerebExtractListListItem} from 'src/app/map/types/oereb-extract-list-item.type';
import {OerebInfoListMapOverlayComponent} from './oereb-info-list-map-overlay.component';

describe('OerebInfoListMapOverlayComponent', () => {
  let fixture: ComponentFixture<OerebInfoListMapOverlayComponent>;
  let compiled: HTMLElement;

  const listItem = signal<OerebExtractListListItem>({
    itemType: 'list',
    itemLabel: 'General information',
    items: [
      {itemType: 'text', itemLabel: 'Area', text: '120m2'},
      {itemType: 'url', itemLabel: 'Office', url: 'https://example.test/office'},
    ],
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OerebInfoListMapOverlayComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OerebInfoListMapOverlayComponent, {
      bindings: [inputBinding('listItem', listItem)],
    });
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('uses the list label as the overlay title', () => {
    const overlay = fixture.debugElement.children[0].componentInstance;
    expect(overlay.overlayTitle()).toBe('General information');
    expect(overlay.forceExpanded()).toBe(true);
  });

  it('renders each labelled item with its type and value', () => {
    const items = compiled.querySelectorAll('.oereb-info-list > li');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('.oereb-detail-list__title')?.textContent?.trim()).toBe('Area');
    expect(items[0].querySelector('.oereb-detail-list__item')?.getAttribute('data-type')).toBe('text');
    expect(items[0].querySelector('.oereb-detail-list__item')?.textContent?.trim()).toBe('120m2');
    expect(items[1].querySelector('.oereb-detail-list__title')?.textContent?.trim()).toBe('Office');
    expect(items[1].querySelector('a')?.getAttribute('href')).toBe('https://example.test/office');
  });
});
