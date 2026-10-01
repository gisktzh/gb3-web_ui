import {Component, input, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {StatisticsResult} from 'src/app/shared/interfaces/statistics.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {TableData} from '../info-table/info-table.types';
import {ResizableInfoTableComponent} from '../info-table/resizable-info-table.component';
import {StatisticsItemComponent} from './statistics-item.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectHighlightedLayer} from '../../../../state/map/reducers/statistics.reducer';
import {StatisticsActions} from '../../../../state/map/actions/statistics.actions';

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
  template:
    '<table><thead><tr><ng-container [ngTemplateOutlet]="tableHeaderTemplate() ?? null" [ngTemplateOutletContext]="{$implicit: tableData().headers[0]}" /></tr></thead></table>',
  imports: [NgTemplateOutlet],
  host: {'[attr.data-table-label]': 'tableLabel()'},
})
class ResizableInfoTableStubComponent {
  public readonly tableData = input.required<TableData>();
  public readonly tableLabel = input.required<string>();
  public readonly tableHeaderTemplate = input<TemplateRef<unknown>>();
}

describe('StatisticsItemComponent', () => {
  let fixture: ComponentFixture<StatisticsItemComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [StatisticsItemComponent], providers: [provideMockStore()]})
      .overrideComponent(StatisticsItemComponent, {
        remove: {imports: [MapOverlayListItemComponent, ResizableInfoTableComponent]},
        add: {imports: [MapOverlayListItemStubComponent, ResizableInfoTableStubComponent]},
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectHighlightedLayer, undefined);
    fixture = TestBed.createComponent(StatisticsItemComponent);
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

  it('ties marking to the table header control, reflects checked state, and toggles it off on repeated clicks', () => {
    const result: StatisticsResult = {
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
    fixture.componentRef.setInput('result', result);
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(dispatch).not.toHaveBeenCalled();
    const header: HTMLElement = fixture.nativeElement.querySelector('th');
    header.click();
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.highlightLayer({topic: 'topic', layer: 'layer'}));
    store.overrideSelector(selectHighlightedLayer, {topic: 'topic', layer: 'layer'});
    store.refreshState();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="radio"]').checked).toBe(true);
    header.click();
    expect(dispatch).toHaveBeenLastCalledWith(StatisticsActions.clearHighlight());

    fixture.componentRef.setInput('showInteractiveElements', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-radio-button')).toBeNull();
    dispatch.mockClear();
    header.click();
    expect(dispatch).not.toHaveBeenCalled();
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
    expect(dispatch).not.toHaveBeenCalled();
  });
});
