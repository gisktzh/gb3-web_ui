import {DataCataloguePage} from '../enums/data-catalogue-page.enum';
import {MainPage} from '../enums/main-page.enum';
import {OverviewSearchResultDisplayItem} from '../interfaces/overview-search-resuilt-display.interface';
import {SupportPage} from '../enums/support-page.enum';
import {v4 as uuidv4} from 'uuid';
import {OverviewSearchResultDisplayItemFlag} from '../types/overview-search-result-flag.type';

type OverviewSearchResultModel = 'Geodatensatz' | 'Karte' | 'Geoservice' | 'Produkt';

interface HasRelativeUrl {
  relativeUrl: string;
}

abstract class OverviewSearchResult {
  public readonly uuid: string;
  public readonly name: string;
  public readonly description: string;
  public readonly flags: OverviewSearchResultDisplayItemFlag;

  protected constructor(name: string, uuid: string = uuidv4(), description: string = '', flags: OverviewSearchResultDisplayItemFlag = {}) {
    this.uuid = uuid;
    this.name = name;
    this.description = description;
    this.flags = flags;
  }

  /**
   * Returns the DataCatalogueSearchResultDisplayItem representation of the given OverviewSearchResult used for displaying in content lists.
   * Subclasses should override this method to add more properties as per their requirement.
   */
  public abstract createDisplayRepresentationForList(): OverviewSearchResultDisplayItem;
}

export class OverviewLinkItem extends OverviewSearchResult {
  private readonly url: string;

  constructor(title: string, url: string) {
    super(title);
    this.url = url;
  }

  public override createDisplayRepresentationForList(): OverviewSearchResultDisplayItem {
    return {
      title: this.name,
      uuid: this.uuid,
      flags: this.flags,
      url: {
        isInternal: false,
        path: this.url,
      },
      fields: [],
    };
  }
}

export class OverviewFaqItem extends OverviewSearchResult implements HasRelativeUrl {
  public readonly relativeUrl: string;

  constructor(uuid: string, question: string, answer: string) {
    super(question, uuid, answer);
    this.relativeUrl = `${MainPage.Support}/${SupportPage.Faq}`;
  }

  public override createDisplayRepresentationForList(): OverviewSearchResultDisplayItem {
    return {
      title: this.name,
      uuid: this.uuid,
      flags: this.flags,
      url: {
        isInternal: true,
        path: this.relativeUrl,
      },
      fields: [{title: 'Beschreibung', content: this.description, truncatable: true}],
    };
  }
}

export abstract class OverviewMetadataItem extends OverviewSearchResult implements HasRelativeUrl {
  public readonly relativeUrl: string;
  public readonly type: OverviewSearchResultModel;
  public readonly responsibleDepartment: string;

  protected constructor(
    uuid: string,
    name: string,
    description: string,
    type: OverviewSearchResultModel,
    responsibleDepartment: string,
    ogd?: boolean,
  ) {
    super(name, uuid, description, {ogd});

    this.type = type;
    this.responsibleDepartment = responsibleDepartment;

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

  public override createDisplayRepresentationForList(): OverviewSearchResultDisplayItem {
    return {
      title: this.name,
      uuid: this.uuid,
      flags: this.flags,
      url: {isInternal: true, path: this.relativeUrl},
      fields: [{title: 'Beschreibung', content: this.description, truncatable: true}],
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

  constructor(uuid: string, name: string, description: string, responsibleDepartment: string, outputFormat: string[], ogd: boolean) {
    super(uuid, name, description, 'Geodatensatz', responsibleDepartment, ogd);
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
