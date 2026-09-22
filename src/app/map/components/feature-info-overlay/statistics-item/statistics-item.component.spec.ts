import {Component, input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {StatisticsResult} from 'src/app/shared/interfaces/statistics.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {TableData} from '../info-table/info-table.types';
import {ResizableInfoTableComponent} from '../info-table/resizable-info-table.component';
import {StatisticsItemComponent} from './statistics-item.component';

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
  template: '',
  host: {'[attr.data-table-label]': 'tableLabel()'},
})
class ResizableInfoTableStubComponent {
  public readonly tableData = input.required<TableData>();
  public readonly tableLabel = input.required<string>();
}

describe('StatisticsItemComponent', () => {
  let fixture: ComponentFixture<StatisticsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [StatisticsItemComponent]})
      .overrideComponent(StatisticsItemComponent, {
        remove: {imports: [MapOverlayListItemComponent, ResizableInfoTableComponent]},
        add: {imports: [MapOverlayListItemStubComponent, ResizableInfoTableStubComponent]},
      })
      .compileComponents();

    fixture = TestBed.createComponent(StatisticsItemComponent);
  });

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
  });
});
