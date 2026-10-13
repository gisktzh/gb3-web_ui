import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DataDisplayComponent} from './data-display.component';

describe('DataDisplayComponent', () => {
  let fixture: ComponentFixture<DataDisplayComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [DataDisplayComponent]}).compileComponents();
    fixture = TestBed.createComponent(DataDisplayComponent);
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders text, links and lists using their public display semantics', () => {
    fixture.componentRef.setInput('elements', [
      {title: 'Description', value: null, type: 'text'},
      {title: 'Website', value: {href: 'https://example.com', title: 'Example'}, type: 'url'},
      {title: 'Topics', value: ['One', 'Two'], type: 'textList'},
      {
        title: 'Downloads',
        value: [{href: 'https://example.com/a', title: 'A'}, {href: 'https://example.com/b'}],
        type: 'urlList',
      },
    ]);
    fixture.detectChanges();

    const rows = element.querySelectorAll('.data-display__item');
    expect(rows).toHaveLength(4);
    expect(rows[0].textContent).toContain('Description');
    expect(rows[0].textContent).toContain('-');
    expect(rows[1].querySelector('a')?.textContent).toContain('Example');
    expect(rows[1].querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(rows[2].textContent).toContain('One; Two');
    expect(rows[3].querySelectorAll('li')).toHaveLength(2);
    expect(rows[3].querySelectorAll('a')[1].textContent).toContain('https://example.com/b');
  });

  it('renders placeholders for missing URL collections', () => {
    fixture.componentRef.setInput('elements', [
      {title: 'Website', value: null, type: 'url'},
      {title: 'Downloads', value: [], type: 'urlList'},
    ]);
    fixture.detectChanges();

    expect(Array.from(element.querySelectorAll('.data-display__item__value')).map((value) => value.textContent?.trim())).toEqual([
      '-',
      '-',
    ]);
  });
});
