import {Component, ElementRef, ViewEncapsulation, computed, inject, input, signal, viewChild} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {FeatureInfoResultFeatureField, FeatureInfoResultLayer} from '../../../../shared/interfaces/feature-info.interface';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {selectPinnedFeatureId} from '../../../../state/map/reducers/feature-info.reducer';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {TableColumnIdentifierDirective} from './table-column-identifier.directive';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';
import {MapService} from '../../../interfaces/map.service';
import {MAP_SERVICE} from '../../../../app.tokens';
import {ResizableInfoTableComponent, TableHeader, TableRows} from './resizable-info-table.component';
import {Store} from '@ngrx/store';
import {TableCell} from './info-table-cell.component';

/**
 * Default value to be displayed when a field has no value (i.e. undefined)
 */
const DEFAULT_CELL_VALUE = '-';

/**
 * Prefix that is added in front of the result stats (e.g. 1/3, 3/7) in the table header.
 */
const DEFAULT_TABLE_HEADER_PREFIX = 'Resultat';

/**
 * Important to know: All tables are isolated from each other, yet the pinned state is shared among all of them. As such, the pinnedFeature
 * is added to the global state and handled accordingly in this component here.
 */
@Component({
  selector: 'feature-info-content',
  templateUrl: './feature-info-content.component.html',
  imports: [TableColumnIdentifierDirective, MatRadioButton, MatRadioGroup, ResizableInfoTableComponent],
  encapsulation: ViewEncapsulation.None,
})
export class FeatureInfoContentComponent {
  private readonly configService = inject(ConfigService);
  private readonly store = inject(Store);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  public readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  public readonly layer = input.required<FeatureInfoResultLayer>();
  public readonly topicId = input.required<string>();
  public readonly staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;

  public readonly pinnedFeatureUniqueIdentifier = this.store.selectSignal(selectPinnedFeatureId);
  public readonly pinnedFeatureId = computed(() => {
    // The actual feature ID that's coming from `fid`.
    // We need to:
    //  1.) Check that there actually is a pinned feature overall one
    //  2.) Check if the pinned feature belongs to this topic and layer
    //  3.) Return the number of the pinned feature, so it's in the same format as `fid` again
    const pinnedFeatureUniqueIdentifier = this.pinnedFeatureUniqueIdentifier();
    if (pinnedFeatureUniqueIdentifier === undefined) {
      return undefined;
    }

    const pinnedFeatureIdCandidate = Number(pinnedFeatureUniqueIdentifier.split('_').at(-1));
    const anticipatedUniqueIdentifier = TableColumnIdentifierDirective.createUniqueColumnIdentifier(
      this.topicId(),
      this.layer().layer,
      pinnedFeatureIdCandidate,
    );

    if (anticipatedUniqueIdentifier !== pinnedFeatureUniqueIdentifier) {
      return undefined;
    }

    return pinnedFeatureIdCandidate;
  });

  public readonly highlightedFeatureId = computed(() => {
    return this.pinnedFeatureId() ?? this.hoveredFeatureId();
  });

  public readonly hoveredFeatureId = signal<number | null>(null);
  public readonly hoverEnabled = signal(true);

  public readonly tableData = computed(() => {
    const tableHeaders: TableHeader[] = [];
    const tableRows: TableRows = new Map<string, TableCell[]>();

    this.layer().features.forEach(({fid, geometry, fields}, featureIdx, features) => {
      const tableHeader = this.createTableHeaderForFeature(fid, featureIdx, features.length, !!geometry);
      tableHeaders.push(tableHeader);

      fields.forEach((feature) => {
        const tableCell = this.createTableCellForFeatureAndField(fid, feature);

        if (tableRows.has(feature.label)) {
          // see: https://stackoverflow.com/questions/70723319/object-is-possibly-undefined-using-es6-map-get-right-after-map-set
          // -> it should never happen, but IF it were to happen, we are not doing anything.
          tableRows.get(feature.label)?.push(tableCell);
        } else {
          tableRows.set(feature.label, [tableCell]);
        }
      });
    });

    return {tableHeaders, tableRows};
  });

  public readonly featureGeometries = computed(() => {
    const featureGeometries: Map<number, GeometryWithSrs | undefined> = new Map();

    this.layer().features.forEach(({fid, geometry}) => {
      featureGeometries.set(fid, geometry);
    });

    return featureGeometries;
  });

  public toggleHighlightForFeature(fid: number, hasGeometry: boolean) {
    if (!hasGeometry) {
      return;
    }

    this.hoveredFeatureId.set(fid);

    if (this.pinnedFeatureId() === fid) {
      this.store.dispatch(FeatureInfoActions.clearHighlight());
    } else {
      this.highlightFeatureOnMapIfExists(fid, true, true);
    }
  }

  public onFeatureHoverStart(fid: number) {
    if (this.hoverEnabled()) {
      this.hoveredFeatureId.set(fid);
      // Would otherwise reset the pinned feature on hover, which we don't want.
      if (this.pinnedFeatureUniqueIdentifier() === undefined) {
        this.highlightFeatureOnMapIfExists(fid);
      }
    }
  }

  public onFeatureHoverEnd() {
    this.hoveredFeatureId.set(null);

    if (this.pinnedFeatureUniqueIdentifier() === undefined) {
      // Would otherwise reset the pinned feature on hover, which we don't want.
      this.store.dispatch(FeatureInfoActions.clearHighlight());
    }
  }

  private createUniqueColumnIdentifierForFid(fid: number): string {
    return TableColumnIdentifierDirective.createUniqueColumnIdentifier(this.topicId(), this.layer().layer, fid);
  }

  private highlightFeatureOnMapIfExists(fid: number, isPinned: boolean = false, zoomToFeature: boolean = false) {
    const feature = this.featureGeometries().get(fid);
    if (!feature) {
      return;
    }

    const pinnedFeatureId = isPinned ? this.createUniqueColumnIdentifierForFid(fid) : undefined;
    this.store.dispatch(FeatureInfoActions.highlightFeature({feature, pinnedFeatureId}));

    if (zoomToFeature) {
      this.mapService.zoomToExtent(feature);
    }
  }

  private createTableHeaderForFeature(fid: number, featureIndex: number, totalFeatures: number, hasGeometry: boolean): TableHeader {
    const displayValue = `${DEFAULT_TABLE_HEADER_PREFIX} ${featureIndex + 1}/${totalFeatures}`;
    return {displayValue, fid, hasGeometry};
  }

  private createTableCellForFeatureAndField(fid: number, feature: FeatureInfoResultFeatureField): TableCell {
    if (feature.value === null) {
      return {cellType: 'text', fid, displayValue: DEFAULT_CELL_VALUE};
    }

    switch (feature.type) {
      case 'text':
        return {cellType: 'text', fid, displayValue: feature.value};
      case 'image':
        return {
          cellType: 'image',
          fid,
          displayValue: feature.value.src.title ?? feature.value.src.href,
          url: feature.value.url.href,
          src: feature.value.src.href,
          alt: feature.value.alt,
        };
      case 'link':
        return {
          cellType: 'url',
          fid,
          displayValue: feature.value.title ?? feature.value.href,
          url: feature.value.href,
        };
    }
  }

  public onResizeHandlerResizeEnd() {
    this.hoverEnabled.set(true);
  }

  public onResizeHandlerResizeStart() {
    this.hoverEnabled.set(false);
  }
}
