import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {hyphenateSync} from 'hyphen/de';
import {selectScrollbarWidth} from 'src/app/state/app/reducers/app-layout.reducer';
import {ResizableInfoTableComponent} from './resizable-info-table.component';

const resizeObserverObserve = vi.fn();
const resizeObserverDisconnect = vi.fn();

class ResizeObserverStub {
  public readonly observe = resizeObserverObserve;
  public readonly unobserve = vi.fn();
  public readonly disconnect = resizeObserverDisconnect;

  constructor(_callback: ResizeObserverCallback) {
    void _callback;
  }
}

describe('ResizableInfoTableComponent', () => {
  let fixture: ComponentFixture<ResizableInfoTableComponent>;

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.mocked(hyphenateSync).mockImplementation((value) => value);

    await TestBed.configureTestingModule({
      imports: [ResizableInfoTableComponent],
      providers: [provideMockStore({selectors: [{selector: selectScrollbarWidth, value: 12}]})],
    }).compileComponents();

    fixture = TestBed.createComponent(ResizableInfoTableComponent);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders ordered duplicate row labels with semantic row headers and default cells', () => {
    fixture.componentRef.setInput('tableLabel', 'Test information');
    fixture.componentRef.setInput('tableData', {
      headers: [],
      rows: [
        {label: 'Duplicate', cells: [{cellType: 'text', displayValue: 'First'}]},
        {label: 'Duplicate', cells: [{cellType: 'text', displayValue: 'Second'}]},
      ],
    });
    fixture.detectChanges();

    const table: HTMLTableElement = fixture.nativeElement.querySelector('table');
    const rows = table.querySelectorAll('tbody tr');

    expect(table.getAttribute('aria-label')).toBe('Test information');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector('th')?.getAttribute('scope')).toBe('row');
    expect(rows[0].querySelector('th')?.textContent).toContain('Duplicate');
    expect(rows[0].querySelector('td')?.textContent).toContain('First');
    expect(rows[1].querySelector('th')?.textContent).toContain('Duplicate');
    expect(rows[1].querySelector('td')?.textContent).toContain('Second');
  });

  it('renders column headers in a semantic table head', () => {
    fixture.componentRef.setInput('tableLabel', 'Test information');
    fixture.componentRef.setInput('tableData', {
      headers: [{displayValue: 'First'}, {displayValue: 'Second'}],
      rows: [
        {
          label: 'Value',
          cells: [
            {cellType: 'text', displayValue: '1'},
            {cellType: 'text', displayValue: '2'},
          ],
        },
      ],
    });
    fixture.detectChanges();

    const headerCells = fixture.nativeElement.querySelectorAll('thead th');

    expect(headerCells).toHaveLength(3);
    expect(Array.from<HTMLElement>(headerCells).every((cell) => cell.getAttribute('scope') === 'col')).toBe(true);
    expect(headerCells[1].textContent).toContain('First');
    expect(headerCells[2].textContent).toContain('Second');
    expect(fixture.nativeElement.querySelectorAll('tbody td')).toHaveLength(2);
  });

  it('omits the table head when there are no column headers', () => {
    fixture.componentRef.setInput('tableLabel', 'Headerless information');
    fixture.componentRef.setInput('tableData', {
      headers: [],
      rows: [{label: 'Value', cells: [{cellType: 'text', displayValue: '42'}]}],
    });
    fixture.detectChanges();

    const table: HTMLTableElement = fixture.nativeElement.querySelector('table');

    expect(table.querySelector('thead')).toBeNull();
    expect(table.querySelector('tbody')).not.toBeNull();
    expect(table.classList.contains('info-table__table--has-headers')).toBe(false);
  });

  it('measures and observes its own scroll container, then disconnects on destroy', () => {
    vi.useFakeTimers();
    fixture.componentRef.setInput('tableLabel', 'Measured information');
    fixture.componentRef.setInput('tableData', {
      headers: [],
      rows: [{label: 'Value', cells: [{cellType: 'text', displayValue: '42'}]}],
    });
    fixture.detectChanges();

    const scrollContainer: HTMLElement = fixture.nativeElement.querySelector('.info-table__scroll-container');
    Object.defineProperties(scrollContainer, {
      clientWidth: {configurable: true, value: 320},
      scrollWidth: {configurable: true, value: 480},
    });

    vi.runAllTimers();

    expect(resizeObserverObserve).toHaveBeenCalledWith(scrollContainer);
    expect(fixture.componentInstance.containerWidth()).toBe(320);
    expect(fixture.componentInstance.containerScrollWidth()).toBe(480);
    expect(fixture.componentInstance.calculatedScrollbarHeight()).toBe(12);
    expect(fixture.componentInstance.maxRowHeaderWidth()).toBe(256);

    fixture.destroy();
    expect(resizeObserverDisconnect).toHaveBeenCalledOnce();
  });
});
