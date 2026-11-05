import {inputBinding, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {describe, expect, it} from 'vitest';

import {OerebNotConcernedThemesList} from './oereb-not-concerned-themes-list.component';
import {OerebInfoValueComponent} from '../oereb-info-value/oereb-info-value.component';
import {OerebExtractListItem} from 'src/app/map/types/oereb-extract-list-item.type';

describe('OerebNotConcernedThemesList', () => {
  const items: OerebExtractListItem[] = [
    {
      itemType: 'text',
      itemLabel: 'Text theme',
      text: 'Some text',
    },
    {
      itemType: 'url',
      itemLabel: 'URL theme',
      url: 'https://example.com',
    },
    {
      itemType: 'list',
      itemLabel: 'List theme',
      items: [
        {
          itemType: 'text',
          itemLabel: 'Nested theme',
          text: 'Nested text',
        },
      ],
    },
    {
      itemType: 'image',
      itemLabel: 'Image theme',
      url: 'https://example.com/image',
      src: 'data:image/png;base64,',
      alt: 'Example image',
      width: 100,
      height: 100,
    },
  ];

  it('should render all list items with their corresponding values', () => {
    const listItems = signal(items);

    const fixture = TestBed.configureTestingModule({
      imports: [OerebNotConcernedThemesList],
    }).createComponent(OerebNotConcernedThemesList, {
      bindings: [inputBinding('listItems', listItems)],
    });

    fixture.detectChanges();

    const listElements = fixture.nativeElement.querySelectorAll('ul.oereb-not-concerned-themes-list > li');
    const infoValueElements = fixture.debugElement.queryAll(By.directive(OerebInfoValueComponent));

    expect(listElements).toHaveLength(items.length);
    expect(infoValueElements).toHaveLength(items.length);

    expect(infoValueElements.map((element) => element.componentInstance.item)).toEqual(items);

    expect(infoValueElements.every((element) => element.componentInstance.showListLabel)).toBe(true);
  });

  it('should update the rendered list when list items change', () => {
    const listItems = signal<OerebExtractListItem[]>([items[0]]);

    const fixture = TestBed.configureTestingModule({
      imports: [OerebNotConcernedThemesList],
    }).createComponent(OerebNotConcernedThemesList, {
      bindings: [inputBinding('listItems', listItems)],
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('ul > li')).toHaveLength(1);

    listItems.set(items);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('ul > li')).toHaveLength(4);
  });
});
