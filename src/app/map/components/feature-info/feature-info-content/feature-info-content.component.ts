import {Component, Input, OnInit} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {
  FeatureInfoResultFeature,
  FeatureInfoResultFeatureField,
  FeatureInfoResultLayer
} from '../../../../shared/interfaces/feature-info.interface';
import {Geometry} from 'geojson';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {Store} from '@ngrx/store';

/**
 * A TableCell represents a single value which is tied to a given feature via its fid.
 */
interface TableCell {
  displayValue: string;
  fid: number;
}

/**
 * A TableHeader is a special case of a TableCell in that it also contains a feature's geometry.
 */
interface TableHeader extends TableCell {
  fid: number;
  geometry: Geometry;
}

/**
 * A row consists of a key which represents the attribute value ("header" in the transposed table) and a set of TableCell objects.
 */
type TableRows = Map<string, TableCell[]>;

@Component({
  selector: 'feature-info-content',
  templateUrl: './feature-info-content.component.html',
  styleUrls: ['./feature-info-content.component.scss']
})
export class FeatureInfoContentComponent implements OnInit {
  @Input() public layer!: FeatureInfoResultLayer;
  public readonly staticFilesBaseUrl: string;

  /**
   * The order of the TableCell elements reflects the order of the tableHeaders elements.
   */
  public readonly tableRows: TableRows = new Map<string, TableCell[]>();
  public readonly tableHeaders: TableHeader[] = [];

  constructor(private readonly store: Store, private readonly configService: ConfigService) {
    this.staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public ngOnInit() {
    this.initTableData();
  }

  public highlightFeature(feature: Geometry | null, fid: number): void {
    document.querySelectorAll(`[data-featureid="${fid}"]`).forEach((e) => {
      e.classList.add('feature-info-content__table__row__column--highlighted');
    });
    if (feature === null) {
      const featureWithGeometry = this.tableHeaders.find((f) => f.fid === fid);
      if (!featureWithGeometry) {
        return;
      }
      feature = featureWithGeometry.geometry;
    }

    this.store.dispatch(FeatureInfoActions.highlightFeature({feature}));
  }

  public removeHighlight(fid: number) {
    document.querySelectorAll(`[data-featureid="${fid}"]`).forEach((e) => {
      e.classList.remove('feature-info-content__table__row__column--highlighted');
    });
    this.store.dispatch(FeatureInfoActions.clearHighlight());
  }

  private getTableHeaderForFeature(feature: FeatureInfoResultFeature, featureIndex: number, totalFeatures: number): TableHeader {
    const header = `Resultat ${featureIndex + 1}/${totalFeatures}`;
    return {displayValue: header, fid: feature.fid, geometry: feature.geometry};
  }

  private getTableCellForFeatureAndField(feature: FeatureInfoResultFeature, field: FeatureInfoResultFeatureField): TableCell {
    const parseValue = field.value?.toString() ?? '-';
    return {fid: feature.fid, displayValue: parseValue};
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
    this.layer.features.forEach((feature, featureIdx, features) => {
      const tableHeader = this.getTableHeaderForFeature(feature, featureIdx, features.length);
      this.tableHeaders.push(tableHeader);

      feature.fields.forEach((field) => {
        const tableCell = this.getTableCellForFeatureAndField(feature, field);

        if (this.tableRows.has(field.label)) {
          // see: https://stackoverflow.com/questions/70723319/object-is-possibly-undefined-using-es6-map-get-right-after-map-set
          this.tableRows.get(field.label)?.push(tableCell);
        } else {
          this.tableRows.set(field.label, [tableCell]);
        }
      });
    });
  }
}
