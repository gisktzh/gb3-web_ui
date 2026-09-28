import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {provideMockStore} from '@ngrx/store/testing';
import {selectScrollbarWidth} from 'src/app/state/app/reducers/app-layout.reducer';
import {ResizableInfoTableComponent, TableData} from './resizable-info-table.component';

describe('ResizableInfoTableComponent', () => {
  let fixture: ComponentFixture<ResizableInfoTableComponent>;
  let component: ResizableInfoTableComponent;
  let compiled: HTMLElement;
  const observeSpy = vi.fn();
  const disconnectSpy = vi.fn();

  const tableData = signal<TableData>({
    tableHeaders: [
      {displayValue: 'Resultat 1/2', fid: 1, hasGeometry: true},
      {displayValue: 'Resultat 2/2', fid: 2, hasGeometry: false},
    ],
    tableRows: new Map([
      [
        'Parcel number',
        [
          {cellType: 'text' as const, displayValue: 'A-1'},
          {cellType: 'text' as const, displayValue: 'A-2'},
        ],
      ],
      ['Owner', [{cellType: 'text' as const, displayValue: 'City'}]],
    ]),
  });
  const tableLabel = signal('Feature information');
  const resizeContainer = signal<HTMLElement | undefined>(undefined);

  class MockResizeObserver implements ResizeObserver {
    public readonly observe = observeSpy;
    public readonly unobserve = vi.fn();
    public readonly disconnect = disconnectSpy;
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    observeSpy.mockClear();
    disconnectSpy.mockClear();
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    await TestBed.configureTestingModule({
      imports: [ResizableInfoTableComponent],
      providers: [provideMockStore({selectors: [{selector: selectScrollbarWidth, value: 17}]})],
    }).compileComponents();

    resizeContainer.set(undefined);
    fixture = TestBed.createComponent(ResizableInfoTableComponent, {
      bindings: [
        inputBinding('tableData', tableData),
        inputBinding('tableLabel', tableLabel),
        inputBinding('resizeContainer', resizeContainer),
      ],
    });
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders accessible headers and rows in source order', () => {
    expect(compiled.querySelector('table')?.getAttribute('aria-label')).toBe('Feature information');

    const rows = compiled.querySelectorAll('tr');
    expect(rows).toHaveLength(3);
    expect(rows[0].textContent).toContain('Resultat 1/2');
    expect(rows[0].textContent).toContain('Resultat 2/2');
    expect(rows[1].textContent).toContain('A-1');
    expect(rows[1].textContent).toContain('A-2');
    expect(rows[2].textContent).toContain('City');
  });

  it('updates the table header width from resize events', () => {
    component.resize({width: '240px'});
    fixture.detectChanges();

    expect(component.tableHeaderWidth()).toBe('240px');
    expect(compiled.querySelector<HTMLElement>('th')?.style.width).toBe('240px');
  });

  it('observes the supplied container and tracks its dimensions', () => {
    const container = document.createElement('div');
    Object.defineProperties(container, {
      clientWidth: {value: 320},
      scrollWidth: {value: 480},
    });
    resizeContainer.set(container);
    fixture.detectChanges();

    component.initResizeObserver();
    expect(observeSpy).toHaveBeenCalledWith(container);

    component.onResize();
    vi.runAllTimers();

    expect(component.containerWidth()).toBe(320);
    expect(component.containerScrollWidth()).toBe(480);
    expect(component.maxTableHeaderWidth()).toBe(256);
    expect(component.calculatedScrollbarHeight()).toBe(17);
  });

  it('reports resize lifecycle events to its parent', () => {
    const startSpy = vi.spyOn(component.resizeHandlerResizeStart, 'emit');
    const endSpy = vi.spyOn(component.resizeHandlerResizeEnd, 'emit');

    component.onResizeHandlerResizeStart();
    component.onResizeHandlerResizeEnd();

    expect(startSpy).toHaveBeenCalledOnce();
    expect(endSpy).toHaveBeenCalledOnce();
  });

  it('disconnects its observer on destruction', () => {
    fixture.destroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
