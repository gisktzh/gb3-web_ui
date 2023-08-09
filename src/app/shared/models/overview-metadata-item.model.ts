import {DataCataloguePage} from '../enums/data-catalogue-page.enum';
import {MainPage} from '../enums/main-page.enum';

type OverviewMetadataItemModel = 'Geodatensatz' | 'Karte' | 'Geoservice' | 'Produkt';

export abstract class OverviewMetadataItem {
  public readonly relativeUrl: string;

  protected constructor(
    public readonly guid: number,
    public readonly name: string,
    public readonly description: string,
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

  private createUrl(dataTypeUrlPath: DataCataloguePage): string {
    return `/${MainPage.Data}/${dataTypeUrlPath}/${this.guid}`;
  }
}

export class ServiceOverviewMetadataItem extends OverviewMetadataItem {
  constructor(guid: number, name: string, description: string, responsibleDepartment: string) {
    super(guid, name, description, 'Geoservice', responsibleDepartment);
  }
}

export class DatasetOverviewMetadataItem extends OverviewMetadataItem {
  public readonly outputFormat: string;

  constructor(guid: number, name: string, description: string, responsibleDepartment: string, outputFormat: string) {
    super(guid, name, description, 'Geodatensatz', responsibleDepartment);
    this.outputFormat = outputFormat;
  }
}

export class ProductOverviewMetadataItem extends OverviewMetadataItem {
  constructor(guid: number, name: string, description: string, responsibleDepartment: string) {
    super(guid, name, description, 'Produkt', responsibleDepartment);
  }
}

export class MapOverviewMetadataItem extends OverviewMetadataItem {
  constructor(guid: number, name: string, description: string, responsibleDepartment: string) {
    super(guid, name, description, 'Karte', responsibleDepartment);
  }
}
