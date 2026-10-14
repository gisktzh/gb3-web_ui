import {Component, input, output, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {StatisticsResult} from 'src/app/shared/interfaces/statistics.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {TableData} from '../info-table/info-table.types';
import {ResizableInfoTableComponent} from '../info-table/resizable-info-table.component';
import {StatisticsItemComponent} from './statistics-item.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectHighlightedLayer, selectPinnedLayer} from '../../../../state/map/reducers/statistics.reducer';
import {StatisticsActions} from '../../../../state/map/actions/statistics.actions';
import {MAP_SERVICE} from '../../../../app.tokens';

@Component({
  selector: 'map-overlay-list-item',
  template: '<ng-content select="[header-icon]" /><ng-content />',
  host: {'[attr.data-overlay-title]': 'overlayTitle()'},
})
class MapOverlayListItemStubComponent {
  public readonly overlayTitle = input('');
  public readonly metaDataLink = input<string>();
  public readonly forceExpanded = input(false);
  public readonly hasBackgroundColor = input(true);
  public readonly showInteractiveElements = input(true);
}

@Component({
  selector: 'resizable-info-table',
  template: `
    <table>
      <thead>
        <tr>
          @for (header of tableData().headers; track $index) {
            <ng-container [ngTemplateOutlet]="tableHeaderTemplate() ?? null" [ngTemplateOutletContext]="{$implicit: header}" />
          }
        </tr>
      </thead>
      <tbody>
        @for (row of tableData().rows; track $index) {
          <tr>
            @for (cell of row.cells; track $index) {
              <ng-container [ngTemplateOutlet]="tableCellTemplate() ?? null" [ngTemplateOutletContext]="{$implicit: cell}" />
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  imports: [NgTemplateOutlet],
  host: {'[attr.data-table-label]': 'tableLabel()'},
})
class ResizableInfoTableStubComponent {
  public readonly tableData = input.required<TableData>();
  public readonly tableLabel = input.required<string>();
  public readonly tableHeaderTemplate = input<TemplateRef<unknown>>();
  public readonly tableCellTemplate = input<TemplateRef<unknown>>();
  public readonly resizeStart = output();
  public readonly resizeEnd = output();
}

describe('StatisticsItemComponent', () => {
  let fixture: ComponentFixture<StatisticsItemComponent>;
  let store: MockStore;
  const mapService = {zoomToExtent: vi.fn()};
  const markingResult: StatisticsResult = {
    topic: 'topic',
    title: 'Statistics',
    layers: [
      {
        layer: 'layer',
        title: 'Layer',
        columns: ['Summe'],
        status: 'ok',
        featureGeometry: {type: 'Point', coordinates: [2680000, 1254000], srs: 2056},
        rows: [{label: 'Total', values: [{value: 10, unit: null}], isGroupHeader: false}],
      },
    ],
  };
  const identifier = {topic: 'topic', layer: 'layer'};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsItemComponent],
      providers: [provideMockStore(), {provide: MAP_SERVICE, useValue: mapService}],
    })
      .overrideComponent(StatisticsItemComponent, {
        remove: {imports: [MapOverlayListItemComponent, ResizableInfoTableComponent]},
        add: {imports: [MapOverlayListItemStubComponent, ResizableInfoTableStubComponent]},
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectHighlightedLayer, undefined);
    store.overrideSelector(selectPinnedLayer, undefined);
    fixture = TestBed.createComponent(StatisticsItemComponent);
    fixture.componentRef.setInput('result', markingResult);
  });

  afterEach(() => store.resetSelectors());

  it('renders named groups as nested list items and an ungrouped section directly in the layer', () => {
    const result: StatisticsResult = {
      topic: 'topic',
      title: 'Statistics',
      layers: [
        {
          layer: 'layer',
          title: 'Layer',
          columns: ['Total'],
          status: 'ok',
          featureGeometry: {type: 'Point', coordinates: [2680000, 1254000], srs: 2056},
          rows: [
            {label: 'Ungrouped', values: [{value: 1, unit: null}], isGroupHeader: false},
            {label: 'Named group', values: [], isGroupHeader: true},
            {label: 'Grouped', values: [{value: 2, unit: null}], isGroupHeader: false},
          ],
        },
      ],
    };
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();

    const layer = fixture.nativeElement.querySelector('map-overlay-list-item[data-overlay-title="Layer"]');
    const namedGroup = layer.querySelector(':scope > map-overlay-list-item[data-overlay-title="Named group"]');
    const directTable = layer.querySelector(':scope > resizable-info-table');

    expect(directTable?.getAttribute('data-table-label')).toBe('Statistik zu Layer');
    expect(namedGroup).not.toBeNull();
    expect(namedGroup.querySelector(':scope > resizable-info-table')?.getAttribute('data-table-label')).toBe(
      'Statistik zu Layer: Named group',
    );
    expect(layer.querySelectorAll('resizable-info-table')).toHaveLength(2);
    expect(layer.querySelectorAll('mat-radio-button')).toHaveLength(1);
  });

  it('shows map and dataset metadata links only when interactive elements are enabled', () => {
    fixture.componentRef.setInput('result', {
      topic: 'topic',
      title: 'Statistics',
      metaDataLink: '/data/maps/map-uuid',
      layers: [
        {
          layer: 'layer',
          title: 'Layer',
          metaDataLink: '/data/datasets/dataset-uuid',
          columns: ['Summe'],
          rows: [],
          status: 'noData',
        },
      ],
    } satisfies StatisticsResult);
    fixture.detectChanges();

    const items = fixture.debugElement
      .queryAll(By.directive(MapOverlayListItemStubComponent))
      .map((item) => item.componentInstance as MapOverlayListItemStubComponent);
    expect(items.map((item) => item.metaDataLink())).toEqual(['/data/maps/map-uuid', '/data/datasets/dataset-uuid']);

    fixture.componentRef.setInput('showInteractiveElements', false);
    fixture.detectChanges();
    expect(items.map((item) => item.metaDataLink())).toEqual([undefined, undefined]);
  });

  it('zooms once when pinning from the header and unpins on repeated clicks without zooming', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(dispatch).not.toHaveBeenCalled();
    const header: HTMLElement = fixture.nativeElement.querySelector('th');
    header.click();
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsActions.highlightLayer({topic: 'topic', layer: 'layer'}));
    expect(mapService.zoomToExtent).toHaveBeenCalledExactlyOnceWith(markingResult.layers[0].featureGeometry);
    store.overrideSelector(selectHighlightedLayer, {topic: 'topic', layer: 'layer'});
    store.overrideSelector(selectPinnedLayer, {topic: 'topic', layer: 'layer'});
    store.refreshState();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="radio"]').checked).toBe(true);
    header.click();
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.clearHighlight());
    expect(mapService.zoomToExtent).toHaveBeenCalledOnce();

    fixture.componentRef.setInput('showInteractiveElements', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-radio-button')).toBeNull();
    dispatch.mockClear();
    mapService.zoomToExtent.mockClear();
    header.click();
    header.dispatchEvent(new MouseEvent('mouseenter'));
    header.dispatchEvent(new MouseEvent('mouseleave'));
    expect(dispatch).not.toHaveBeenCalled();
    expect(mapService.zoomToExtent).not.toHaveBeenCalled();
  });

  it.each([false, true])('zooms once from the radio and unpins without zoom when previously hovered is %s', (hovered) => {
    if (hovered) {
      store.overrideSelector(selectHighlightedLayer, identifier);
      store.refreshState();
    }
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    const radio: HTMLInputElement = fixture.nativeElement.querySelector('input[type="radio"]');
    radio.click();
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsActions.highlightLayer(identifier));
    expect(mapService.zoomToExtent).toHaveBeenCalledExactlyOnceWith(markingResult.layers[0].featureGeometry);
    store.overrideSelector(selectHighlightedLayer, identifier);
    store.overrideSelector(selectPinnedLayer, identifier);
    store.refreshState();
    fixture.detectChanges();
    dispatch.mockClear();
    radio.click();
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsActions.clearHighlight());
    expect(mapService.zoomToExtent).toHaveBeenCalledOnce();
    store.overrideSelector(selectHighlightedLayer, undefined);
    store.overrideSelector(selectPinnedLayer, undefined);
    store.refreshState();
    fixture.detectChanges();
    expect(radio.checked).toBe(false);
  });

  it('zooms to the newly pinned layer when another layer was already pinned', () => {
    const otherLayer = {
      ...markingResult.layers[0],
      layer: 'other-layer',
      featureGeometry: {
        type: 'MultiPoint' as const,
        coordinates: [
          [2681000, 1255000],
          [2682000, 1256000],
        ],
        srs: 2056 as const,
      },
    };
    fixture.componentRef.setInput('result', {...markingResult, layers: [...markingResult.layers, otherLayer]});
    store.overrideSelector(selectPinnedLayer, identifier);
    store.refreshState();
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    headers[1].click();
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsActions.highlightLayer({topic: 'topic', layer: 'other-layer'}));
    expect(mapService.zoomToExtent).toHaveBeenCalledExactlyOnceWith(otherLayer.featureGeometry);
  });

  it.each(['th', 'td'])('previews geometry while hovering a %s and clears it on mouse leave', (selector) => {
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    const cell: HTMLElement = fixture.nativeElement.querySelector(selector);
    cell.dispatchEvent(new MouseEvent('mouseenter'));
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.hoverLayer(identifier));
    store.overrideSelector(selectHighlightedLayer, identifier);
    store.refreshState();
    fixture.detectChanges();
    expect(cell.classList.contains('statistics-item__cell--highlighted')).toBe(true);
    expect(fixture.nativeElement.querySelector('input[type="radio"]').checked).toBe(true);
    cell.dispatchEvent(new MouseEvent('mouseleave'));
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.clearHover());
    store.overrideSelector(selectHighlightedLayer, undefined);
    store.refreshState();
    fixture.detectChanges();
    expect(cell.classList.contains('statistics-item__cell--highlighted')).toBe(false);
    expect(fixture.nativeElement.querySelector('input[type="radio"]').checked).toBe(false);
    expect(mapService.zoomToExtent).not.toHaveBeenCalled();
  });

  it('pins an already hovered layer on click instead of clearing its preview', () => {
    store.overrideSelector(selectHighlightedLayer, identifier);
    store.refreshState();
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    const header: HTMLElement = fixture.nativeElement.querySelector('th');
    header.click();
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.highlightLayer(identifier));
    store.overrideSelector(selectPinnedLayer, identifier);
    store.refreshState();
    fixture.detectChanges();
    dispatch.mockClear();
    header.dispatchEvent(new MouseEvent('mouseleave'));
    expect(dispatch).not.toHaveBeenCalled();
    header.click();
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.clearHighlight());
    expect(mapService.zoomToExtent).toHaveBeenCalledExactlyOnceWith(markingResult.layers[0].featureGeometry);
  });

  it.each([identifier, {topic: 'other-topic', layer: 'other-layer'}])(
    'does not replace or clear a pinned marking from $topic on hover',
    (pinned) => {
      store.overrideSelector(selectHighlightedLayer, pinned);
      store.overrideSelector(selectPinnedLayer, pinned);
      store.refreshState();
      fixture.detectChanges();
      const dispatch = vi.spyOn(store, 'dispatch');
      const header: HTMLElement = fixture.nativeElement.querySelector('th');
      header.dispatchEvent(new MouseEvent('mouseenter'));
      header.dispatchEvent(new MouseEvent('mouseleave'));
      expect(dispatch).not.toHaveBeenCalled();
      expect(mapService.zoomToExtent).not.toHaveBeenCalled();
    },
  );

  it('allows Space to pin and unpin a hovered layer even though its radio is already checked', () => {
    store.overrideSelector(selectHighlightedLayer, identifier);
    store.refreshState();
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    const radio: HTMLInputElement = fixture.nativeElement.querySelector('input[type="radio"]');
    const keydown = new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true});
    radio.dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBe(true);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsActions.highlightLayer(identifier));
    expect(mapService.zoomToExtent).toHaveBeenCalledExactlyOnceWith(markingResult.layers[0].featureGeometry);
    store.overrideSelector(selectPinnedLayer, identifier);
    store.refreshState();
    fixture.detectChanges();
    dispatch.mockClear();
    radio.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true}));
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsActions.clearHighlight());
    expect(mapService.zoomToExtent).toHaveBeenCalledOnce();
  });

  it('suppresses hover previews while resizing a table', () => {
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    const table = fixture.debugElement.query(By.directive(ResizableInfoTableStubComponent))
      .componentInstance as ResizableInfoTableStubComponent;
    const header: HTMLElement = fixture.nativeElement.querySelector('th');
    table.resizeStart.emit();
    header.dispatchEvent(new MouseEvent('mouseenter'));
    expect(dispatch).not.toHaveBeenCalled();
    table.resizeEnd.emit();
    header.dispatchEvent(new MouseEvent('mouseenter'));
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.hoverLayer(identifier));
    expect(mapService.zoomToExtent).not.toHaveBeenCalled();
  });

  it('clears its temporary preview when the result component is destroyed', () => {
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.nativeElement.querySelector('th').dispatchEvent(new MouseEvent('mouseenter'));
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.hoverLayer(identifier));
    fixture.destroy();
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.clearHover());
    expect(mapService.zoomToExtent).not.toHaveBeenCalled();
  });

  it('disables marking when the result has no feature geometry', () => {
    fixture.componentRef.setInput('result', {
      topic: 'topic',
      title: 'Statistics',
      layers: [
        {
          layer: 'layer',
          title: 'Layer',
          columns: ['Summe'],
          rows: [{label: 'Total', values: [{value: 10, unit: null}], isGroupHeader: false}],
          status: 'ok',
        },
      ],
    } satisfies StatisticsResult);
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    expect(fixture.nativeElement.querySelector('input[type="radio"]').disabled).toBe(true);
    fixture.nativeElement.querySelector('th').click();
    fixture.nativeElement.querySelector('th').dispatchEvent(new MouseEvent('mouseenter'));
    expect(dispatch).not.toHaveBeenCalled();
    expect(mapService.zoomToExtent).not.toHaveBeenCalled();
  });
});
