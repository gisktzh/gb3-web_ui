import {DataCataloguePage} from '../enums/data-catalogue-page.enum';
import {MainPage} from '../enums/main-page.enum';

type OverviewMetadataItemModel = 'Geodatensatz' | 'Karte' | 'Geoservice' | 'Produkt';

export abstract class OverviewMetadataItem {
  public readonly relativeUrl: string;

  protected constructor(
    public readonly uuid: string,
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
    return `/${MainPage.Data}/${dataTypeUrlPath}/${this.uuid}`;
  }
}

export class ServiceOverviewMetadataItem extends OverviewMetadataItem {
  constructor(uuid: string, name: string, description: string, responsibleDepartment: string) {
    super(uuid, name, description, 'Geoservice', responsibleDepartment);
  }
}

export class DatasetOverviewMetadataItem extends OverviewMetadataItem {
  public readonly outputFormat: string;

  constructor(uuid: string, name: string, description: string, responsibleDepartment: string, outputFormat: string) {
    super(uuid, name, description, 'Geodatensatz', responsibleDepartment);
    this.outputFormat = outputFormat;
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
