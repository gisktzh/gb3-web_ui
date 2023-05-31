import {AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {FeatureInfoResultLayer} from '../../../../shared/interfaces/feature-info.interface';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {Store} from '@ngrx/store';
import {selectPinnedFeatureId} from '../../../../state/map/reducers/feature-info.reducer';
import {Subscription, tap} from 'rxjs';
import {MatRadioButton} from '@angular/material/radio';
import {TableColumnIdentifierDirective} from './table-column-identifier.directive';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';

/**
 * A TableCell represents a single value which is tied to a given feature via its fid.
 */
interface TableCell {
  displayValue: string;
  fid: number;
}

/**
 * A row consists of a key which represents the attribute value ("header" in the transposed table) and a set of TableCell objects.
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

/**
 * Important to know: All tables are isolated from each other, yet the pinned state is shared among all of them. As such, the pinnedFeature
 * is added to the global state and handled accordingly in this component here.
 */
@Component({
  selector: 'feature-info-content',
  templateUrl: './feature-info-content.component.html',
  styleUrls: ['./feature-info-content.component.scss']
})
export class FeatureInfoContentComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public layer!: FeatureInfoResultLayer;
  @Input() public topicId!: string;
  public readonly staticFilesBaseUrl: string;

  /**
   * The order of the TableCell elements reflects the order of the tableHeaders elements.
   */
  public readonly tableRows: TableRows = new Map<string, TableCell[]>();
  public readonly tableHeaders: TableCell[] = [];

  private readonly featureGeometries: Map<number, GeometryWithSrs | null> = new Map();
  private readonly pinnedFeatureId$ = this.store.select(selectPinnedFeatureId);
  private readonly subscriptions: Subscription = new Subscription();
  private pinnedFeatureId: number | undefined;
  @ViewChildren(TableColumnIdentifierDirective) private readonly tableColumns!: QueryList<TableColumnIdentifierDirective>;

  constructor(private readonly store: Store, private readonly configService: ConfigService, private readonly renderer: Renderer2) {
    this.staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public ngOnInit() {
    this.initTableData();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.initPinnedFeatureIdHandler();
  }

  public toggleHighlightForFeature(fid: number, highlightButton: MatRadioButton) {
    if (highlightButton.checked) {
      this.store.dispatch(FeatureInfoActions.clearHighlight());
      // Programmaticaly dispatch the hover effect which is not triggered anymore because the button is inside the hover area
      this.onFeatureHoverStart(fid);
      // Also uncheck the radio button status, because radio buttons cannot be deactivated by default
      highlightButton.checked = false;
    } else {
      this.highlightFeatureOnMapIfExists(fid, true);
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
   * Adds the highlight class to all cells for a given feature to find all corresponding cells, mimicking a column
   * selection.
   * @param fid
   */
  private addHighlightClassToCellsForFid(fid: number) {
    const tableColumnIdentifier = TableColumnIdentifierDirective.createUniqueColumnIdentifier(this.topicId, this.layer.layer, fid);
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
    const tableColumnIdentifier = TableColumnIdentifierDirective.createUniqueColumnIdentifier(this.topicId, this.layer.layer, fid);
    this.tableColumns
      .filter((tableColumn) => tableColumn.uniqueIdentifier === tableColumnIdentifier)
      .forEach((tableColumn) => {
        this.renderer.removeClass(tableColumn.host.nativeElement, HIGHLIGHTED_CELL_CLASS);
      });
  }

  /**
   * Removes the highligh class from all cells that currently have it.
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
              this.addHighlightClassToCellsForFid(pinnedFeatureId);
            }
          })
        )
        .subscribe()
    );
  }

  private highlightFeatureOnMapIfExists(fid: number, isPinned: boolean = false) {
    const feature = this.featureGeometries.get(fid);
    if (!feature) {
      return;
    }

    const pinnedFeatureId = isPinned ? fid : undefined;
    this.store.dispatch(FeatureInfoActions.highlightFeature({feature, pinnedFeatureId}));
  }

  private createTableHeaderForFeature(fid: number, featureIndex: number, totalFeatures: number): TableCell {
    const displayValue = `${DEFAULT_TABLE_HEADER_PREFIX} ${featureIndex + 1}/${totalFeatures}`;
    return {displayValue, fid};
  }

  private createTableCellForFeatureAndField(fid: number, value: string | number | null): TableCell {
    const displayValue = value?.toString() ?? DEFAULT_CELL_VALUE;
    return {fid, displayValue};
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
      const tableHeader = this.createTableHeaderForFeature(fid, featureIdx, features.length);
      this.tableHeaders.push(tableHeader);

      fields.forEach(({label, value}) => {
        const tableCell = this.createTableCellForFeatureAndField(fid, value);

        if (this.tableRows.has(label)) {
          // see: https://stackoverflow.com/questions/70723319/object-is-possibly-undefined-using-es6-map-get-right-after-map-set
          // -> it should never happen, but IF it were to happen, we are not doing anything.
          this.tableRows.get(label)?.push(tableCell);
        } else {
          this.tableRows.set(label, [tableCell]);
        }
      });
    });
  }
}
