import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {FeatureInfoResultFeatureField, FeatureInfoResultLayer} from '../../../../shared/interfaces/feature-info.interface';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {Store} from '@ngrx/store';
import {selectPinnedFeatureId} from '../../../../state/map/reducers/feature-info.reducer';
import {Subscription, tap} from 'rxjs';
import {MatRadioButton} from '@angular/material/radio';
import {TableColumnIdentifierDirective} from './table-column-identifier.directive';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';
import {MAP_SERVICE} from '../../../../app.module';
import {MapService} from '../../../interfaces/map.service';
import {StyleExpression} from '../../../../shared/types/style-expression.type';

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
 * Name of the css class which is used to designate a highlighted cell.
 */
const HIGHLIGHTED_CELL_CLASS = 'feature-info-content__table__row__column--highlighted';

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

/**
 * Important to know: All tables are isolated from each other, yet the pinned state is shared among all of them. As such, the pinnedFeature
 * is added to the global state and handled accordingly in this component here.
 */
@Component({
  selector: 'feature-info-content',
  templateUrl: './feature-info-content.component.html',
  styleUrls: ['./feature-info-content.component.scss'],
  standalone: false,
})
export class FeatureInfoContentComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public layer!: FeatureInfoResultLayer;
  @Input() public topicId!: string;
  public readonly staticFilesBaseUrl: string;

  /**
   * The order of the TableCell elements reflects the order of the TableHeader elements.
   */
  public readonly tableRows: TableRows = new Map<string, TableCell[]>();
  public readonly tableHeaders: TableHeader[] = [];
  public readonly minTableHeaderWidth: number = MIN_TABLE_HEADER_WIDTH;
  public maxTableHeaderWidth: number = DEFAULT_TABLE_HEADER_WIDTH;
  public tableHeaderWidth: string = `${DEFAULT_TABLE_HEADER_WIDTH}px`;

  private resizeObserver!: ResizeObserver;
  private readonly featureGeometries: Map<number, GeometryWithSrs | undefined> = new Map();
  private readonly pinnedFeatureId$ = this.store.select(selectPinnedFeatureId);
  private readonly subscriptions: Subscription = new Subscription();
  private pinnedFeatureId: string | undefined;
  @ViewChildren(TableColumnIdentifierDirective) private readonly tableColumns!: QueryList<TableColumnIdentifierDirective>;
  @ViewChild('container') private readonly container!: ElementRef;

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly renderer: Renderer2,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {
    this.staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public resize(style: StyleExpression) {
    this.tableHeaderWidth = style['width'] ?? `${DEFAULT_TABLE_HEADER_WIDTH}px`;
  }

  public ngOnInit() {
    this.initTableData();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  public ngAfterViewInit() {
    this.initPinnedFeatureIdHandler();
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.maxTableHeaderWidth = entry.contentRect.width * 0.8;
        this.resize({width: `${DEFAULT_TABLE_HEADER_WIDTH}px`});
      }
    });

    this.resizeObserver.observe(this.container.nativeElement);
  }

  public toggleHighlightForFeature(fid: number, highlightButton: MatRadioButton, hasGeometry: boolean) {
    if (!hasGeometry) {
      return;
    }

    if (highlightButton.checked) {
      this.store.dispatch(FeatureInfoActions.clearHighlight());
      // Programmaticaly dispatch the hover effect which is not triggered anymore because the button is inside the hover area
      this.onFeatureHoverStart(fid);
      // Also uncheck the radio button status, because radio buttons cannot be deactivated by default
      highlightButton.checked = false;
    } else {
      this.highlightFeatureOnMapIfExists(fid, true, true);
      highlightButton.checked = true;
    }
  }

  public onFeatureHoverStart(fid: number) {
    if (!this.pinnedFeatureId) {
      this.addHighlightClassToCellsForFid(fid);
      this.highlightFeatureOnMapIfExists(fid);
    }
  }

  public onFeatureHoverEnd(fid: number) {
    if (!this.pinnedFeatureId) {
      this.removeHighlightClassFromCellsForFid(fid);
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
   * Adds the highlight class to all cells for a given feature to find all corresponding cells, mimicking a column
   * selection.
   * @param fid
   */
  private addHighlightClassToCellsForFid(fid: number) {
    const tableColumnIdentifier = this.createUniqueColumnIdentifierForFid(fid);
    this.tableColumns
      .filter((tableColumn) => tableColumn.uniqueIdentifier === tableColumnIdentifier)
      .forEach((tableColumn) => this.renderer.addClass(tableColumn.host.nativeElement, HIGHLIGHTED_CELL_CLASS));
  }

  /**
   * Removes the highlight class to all cells for a given feature to find all corresponding cells, mimicking a column
   * selection.
   * @param fid
   */
  private removeHighlightClassFromCellsForFid(fid: number) {
    const tableColumnIdentifier = this.createUniqueColumnIdentifierForFid(fid);
    this.tableColumns
      .filter((tableColumn) => tableColumn.uniqueIdentifier === tableColumnIdentifier)
      .forEach((tableColumn) => {
        this.renderer.removeClass(tableColumn.host.nativeElement, HIGHLIGHTED_CELL_CLASS);
      });
  }

  private createUniqueColumnIdentifierForFid(fid: number): string {
    return TableColumnIdentifierDirective.createUniqueColumnIdentifier(this.topicId, this.layer.layer, fid);
  }

  /**
   * Removes the highlight class from all cells that currently have it.
   * @private
   */
  private removeHighlightClassFromAllCells() {
    this.tableColumns
      .filter((tableColumn) => tableColumn.host.nativeElement.classList.contains(HIGHLIGHTED_CELL_CLASS))
      .forEach((tableColumn) => {
        this.renderer.removeClass(tableColumn.host.nativeElement, HIGHLIGHTED_CELL_CLASS);
      });
  }

  /**
   * Whenever the global state changes (indicating a pinned feature), we need to remove the highlight class from all cells - the reason is
   * that we cannot remove it from the specific FID because it might be in another table, so the FIDs won't match. If a feature is pinned,
   * we also add it (if it exists).
   * @private
   */
  private initPinnedFeatureIdHandler() {
    this.subscriptions.add(
      this.pinnedFeatureId$
        .pipe(
          tap((pinnedFeatureId) => {
            this.pinnedFeatureId = pinnedFeatureId;
            this.removeHighlightClassFromAllCells();
            if (pinnedFeatureId) {
              const feature = this.tableColumns.find((tableColumn) => tableColumn.uniqueIdentifier === pinnedFeatureId);

              if (feature) {
                this.addHighlightClassToCellsForFid(feature.featureId);
              }
            }
          }),
        )
        .subscribe(),
    );
  }

  private highlightFeatureOnMapIfExists(fid: number, isPinned: boolean = false, zoomToFeature: boolean = false) {
    const feature = this.featureGeometries.get(fid);
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

  /**
   * Because the data from the API comes in a very special format, and because we're using transposed tables to display our results, we
   * have to initialize the table data in such a way that we can build our table correctly. Because we have both left-side headers (the
   * actual attributes) and top headers (the result number), we fill two seperate attributes in the same order so we can "fake" a
   * column oriented setup.
   *
   * In effect, both this.tableHeaders and this.tableRows (or, rather its values) are ordered in the same way, so the cells get rendered
   * in the correct column, even though they run in seperate loops.
   * @private
   */
  private initTableData() {
    this.layer.features.forEach(({fid, geometry, fields}, featureIdx, features) => {
      this.featureGeometries.set(fid, geometry);
      const tableHeader = this.createTableHeaderForFeature(fid, featureIdx, features.length, !!geometry);
      this.tableHeaders.push(tableHeader);

      fields.forEach((feature) => {
        const tableCell = this.createTableCellForFeatureAndField(fid, feature);

        if (this.tableRows.has(feature.label)) {
          // see: https://stackoverflow.com/questions/70723319/object-is-possibly-undefined-using-es6-map-get-right-after-map-set
          // -> it should never happen, but IF it were to happen, we are not doing anything.
          this.tableRows.get(feature.label)?.push(tableCell);
        } else {
          this.tableRows.set(feature.label, [tableCell]);
        }
      });
    });
  }
}
