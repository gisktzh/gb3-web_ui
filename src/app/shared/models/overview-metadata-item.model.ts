import {DataCataloguePage} from '../enums/data-catalogue-page.enum';
import {MainPage} from '../enums/main-page.enum';
import {DataCatalogueSearchResultDisplayItem} from '../interfaces/data-catalogue-search-resuilt-display.interface';

type OverviewMetadataItemModel = 'Geodatensatz' | 'Karte' | 'Geoservice' | 'Produkt';
export enum OGDAvailability {
  OGD = 'Frei (OGD)',
  NOGD = 'Eingeschränkt (NOGD)',
}

export abstract class OverviewMetadataItem {
  public readonly relativeUrl: string;

  protected constructor(
    public readonly uuid: string,
    public readonly name: string,
    private readonly description: string,
    public readonly type: OverviewMetadataItemModel,
    public readonly responsibleDepartment: string,
  ) {
    switch (this.type) {
      case 'Geodatensatz':
        this.relativeUrl = this.createUrl(DataCataloguePage.Datasets);
        break;
      case 'Karte':
        this.relativeUrl = this.createUrl(DataCataloguePage.Maps);
        break;
      case 'Geoservice':
        this.relativeUrl = this.createUrl(DataCataloguePage.Services);
        break;
      case 'Produkt':
        this.relativeUrl = this.createUrl(DataCataloguePage.Products);
        break;
    }
  }

  /**
   * Returns the DataCatalogueSearchResultDisplayItem representation of the given OverviewMetadataItem used for displaying in content lists.
   * Subclasses should override this method to add more properties as per their requirement.
   */
  public getDisplayRepresentationForList(): DataCatalogueSearchResultDisplayItem {
    return {
      title: this.name,
      uuid: this.uuid,
      relativeUrl: this.relativeUrl,
      fields: [
        {title: 'Typ', content: this.type},
        {title: 'Beschreibung', content: this.description, truncatable: true},
      ],
    };
  }

  private createUrl(dataTypeUrlPath: DataCataloguePage): string {
    return `/${MainPage.Data}/${dataTypeUrlPath}/${this.uuid}`;
  }
}

export class ServiceOverviewMetadataItem extends OverviewMetadataItem {
  constructor(uuid: string, name: string, description: string, responsibleDepartment: string) {
    super(uuid, name, description, 'Geoservice', responsibleDepartment);
  }
}

export class DatasetOverviewMetadataItem extends OverviewMetadataItem {
  public readonly outputFormat: string[];
  private readonly ogd: OGDAvailability;

  constructor(uuid: string, name: string, description: string, responsibleDepartment: string, outputFormat: string[], ogd: boolean) {
    super(uuid, name, description, 'Geodatensatz', responsibleDepartment);
    this.outputFormat = outputFormat;
    this.ogd = ogd ? OGDAvailability.OGD : OGDAvailability.NOGD;
  }

  public override getDisplayRepresentationForList(): DataCatalogueSearchResultDisplayItem {
    const {fields, ...rest} = super.getDisplayRepresentationForList();
    fields.splice(1, 0, {content: this.ogd, title: 'Verfügbarkeit'});

    return {
      ...rest,
      fields,
    };
  }
}

export class ProductOverviewMetadataItem extends OverviewMetadataItem {
  constructor(uuid: string, name: string, description: string, responsibleDepartment: string) {
    super(uuid, name, description, 'Produkt', responsibleDepartment);
  }
}

export class MapOverviewMetadataItem extends OverviewMetadataItem {
  constructor(uuid: string, name: string, description: string, responsibleDepartment: string) {
    super(uuid, name, description, 'Karte', responsibleDepartment);
  }
}
