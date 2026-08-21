import {AfterViewInit, Component, ElementRef, OnDestroy, computed, inject, input, signal, viewChild} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {FeatureInfoResultFeatureField, FeatureInfoResultLayer} from '../../../../shared/interfaces/feature-info.interface';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {Store} from '@ngrx/store';
import {selectPinnedFeatureId} from '../../../../state/map/reducers/feature-info.reducer';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {TableColumnIdentifierDirective} from './table-column-identifier.directive';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';
import {MapService} from '../../../interfaces/map.service';
import {StyleExpression} from '../../../../shared/types/style-expression.type';
import {MAP_SERVICE} from '../../../../app.tokens';
import {KeyValuePipe} from '@angular/common';
import {ResizeHandlerComponent} from '../../../../shared/components/resize-handler/resize-handler.component';
import {HyphenatePipe} from '../../../pipes/hyphenate.pipe';
import {selectScrollbarWidth} from 'src/app/state/app/reducers/app-layout.reducer';
import {formatFeatureInfoFieldValue} from '../../../../shared/utils/feature-info-field.utils';

type CellType = 'text' | 'url' | 'image';

/**
 * Each TableCell has an fid (identifying the feature), a displayvalue and a type. These are then further narrowed down to handle string
 * and linkobject values.
 */
interface AbstractTableCell {
  fid: number;
  displayValue: string;
  cellType: CellType;
}

interface TextTableCell extends AbstractTableCell {
  cellType: 'text';
}

interface UrlTableCell extends AbstractTableCell {
  cellType: 'url';
  url: string;
}

interface ImageTableCell extends AbstractTableCell {
  cellType: 'image';
  url: string;
  src: string;
  alt: string;
}

type TableCell = TextTableCell | UrlTableCell | ImageTableCell;

/**
 * A TableHeader is a AbstractTableCell with a displayValue that is string only.
 */
interface TableHeader extends Omit<AbstractTableCell, 'cellType'> {
  displayValue: string;
  hasGeometry: boolean;
}

/**
 * A row consists of a key which represents the attribute value ("header" in the transposed table) and a set of AbstractTableCell
 * objects.
 */
type TableRows = Map<string, TableCell[]>;

/**
 * Default value to be displayed when a field has no value (i.e. undefined)
 */
const DEFAULT_CELL_VALUE = '-';

/**
 * Prefix that is added in front of the result stats (e.g. 1/3, 3/7) in the table header.
 */
const DEFAULT_TABLE_HEADER_PREFIX = 'Resultat';

const DEFAULT_TABLE_HEADER_WIDTH = 130;
const MIN_TABLE_HEADER_WIDTH = 80;
const TABLE_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO = 0.8;

/**
 * Important to know: All tables are isolated from each other, yet the pinned state is shared among all of them. As such, the pinnedFeature
 * is added to the global state and handled accordingly in this component here.
 */
@Component({
  selector: 'feature-info-content',
  templateUrl: './feature-info-content.component.html',
  styleUrls: ['./feature-info-content.component.scss'],
  imports: [TableColumnIdentifierDirective, MatRadioButton, ResizeHandlerComponent, KeyValuePipe, HyphenatePipe, MatRadioGroup],
})
export class FeatureInfoContentComponent implements OnDestroy, AfterViewInit {
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  public readonly layer = input.required<FeatureInfoResultLayer>();
  public readonly topicId = input.required<string>();
  public readonly staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;

  public readonly minTableHeaderWidth: number = MIN_TABLE_HEADER_WIDTH;
  public readonly tableHeaderWidth = signal(`${DEFAULT_TABLE_HEADER_WIDTH}px`);
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
  public readonly hoveredFeatureId = signal<number | null>(null);
  public readonly containerWidth = signal(0);
  public readonly containerScrollWidth = signal(0);
  public readonly maxTableHeaderWidth = computed(() => this.containerWidth() * TABLE_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO);
  public readonly scrollbarWidth = this.store.selectSignal(selectScrollbarWidth);
  public readonly hoverEnabled = signal(true);
  public readonly container = viewChild.required<ElementRef>('container');

  public readonly highlightedFeatureId = computed(() => {
    return this.pinnedFeatureId() ?? this.hoveredFeatureId();
  });

  public readonly calculatedScrollbarHeight = computed(() => {
    if (this.containerWidth() < this.containerScrollWidth()) {
      return this.scrollbarWidth();
    }

    return 0;
  });

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

  public readonly tableRows = computed(() => this.tableData().tableRows);
  public readonly tableHeaders = computed(() => this.tableData().tableHeaders);

  private resizeObserver!: ResizeObserver;

  public readonly featureGeometries = computed(() => {
    const featureGeometries: Map<number, GeometryWithSrs | undefined> = new Map();

    this.layer().features.forEach(({fid, geometry}) => {
      featureGeometries.set(fid, geometry);
    });

    return featureGeometries;
  });

  public resize(style: StyleExpression) {
    this.tableHeaderWidth.set(style['width'] ?? `${DEFAULT_TABLE_HEADER_WIDTH}px`);
  }

  public ngOnDestroy() {
    this.resizeObserver.disconnect();
  }

  public ngAfterViewInit() {
    this.initResizeObserver();
  }

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

  /**
   * Fixed compareFn for KeyValuePipe that always returns 0, essentially preserving the key order of the object. This
   * is necessary because the KeyValuePipe orders the keys ascending: https://angular.io/api/common/KeyValuePipe#description
   */
  public preserveKeyValueOrder(): number {
    return 0;
  }

  /**
   * Initializes the ResizeObserver to listen for any changes to the content elements. This will fire when the outer container (which is
   * resizable as well) is resized and we then need to calculate the new maximum width (since that is 80% of the full width). In cases where
   * the outer container is resized to a smaller size, we reset the current width to the default width to ensure the elements are always
   * visible and do not overflow (e.g. if you have a very large container and very broad table headers, resizing it to small will make the
   * table unusable since the drag hanler is out of reach).
   */
  private initResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container().nativeElement);
  }

  public onResize() {
    // Use a timeout here to let the browser recalculate thigs first.
    setTimeout(() => {
      const container = this.container().nativeElement;
      const effectiveWidth = container.clientWidth;
      let scrollWidth = container.scrollWidth;

      this.containerWidth.set(effectiveWidth);
      this.containerScrollWidth.set(scrollWidth);

      if (this.maxTableHeaderWidth() > effectiveWidth * TABLE_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO) {
        this.resize({width: `${DEFAULT_TABLE_HEADER_WIDTH}px`});

        // Resizing automatically means different scrollWidth, using a timeout here too to let the browser catch up.
        setTimeout(() => {
          scrollWidth = container.scrollWidth;
          this.containerScrollWidth.set(scrollWidth);
        });
      }
    });
  }

  public onResizeHandlerResizeEnd() {
    this.hoverEnabled.set(true);
    this.onResize();
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
      case 'date':
        return {
          cellType: 'text',
          fid,
          displayValue: formatFeatureInfoFieldValue(feature.value, feature.type) ?? DEFAULT_CELL_VALUE,
        };
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
}
