import {DataCataloguePage} from '../enums/data-catalogue-page.enum';
import {MainPage} from '../enums/main-page.enum';
import {OverviewSearchResultDisplayItem} from '../interfaces/overview-search-resuilt-display.interface';
import {SupportPage} from '../enums/support-page.enum';
import {OGDAvailability} from '../enums/ogd-availability.enum';

type OverviewSearchResultModel = 'Geodatensatz' | 'Karte' | 'Geoservice' | 'Produkt';

interface HasRelativeUrl {
  relativeUrl: string;
}

abstract class OverviewSearchResult {
  protected constructor(
    public readonly uuid: string,
    public readonly name: string,
    public readonly description: string,
  ) {}

  /**
   * Returns the DataCatalogueSearchResultDisplayItem representation of the given OverviewSearchResult used for displaying in content lists.
   * Subclasses should override this method to add more properties as per their requirement.
   */
  public abstract createDisplayRepresentationForList(): OverviewSearchResultDisplayItem;
}

export class OverviewFaqItem extends OverviewSearchResult implements HasRelativeUrl {
  public readonly relativeUrl: string;

  constructor(uuid: string, question: string, answer: string) {
    super(uuid, question, answer);
    this.relativeUrl = `${MainPage.Support}/${SupportPage.Faq}`;
  }

  public override createDisplayRepresentationForList(): OverviewSearchResultDisplayItem {
    return {
      title: this.name,
      uuid: this.uuid,
      relativeUrl: this.relativeUrl,
      fields: [
        {title: 'Typ', content: 'Frage'},
        {title: 'Beschreibung', content: this.description, truncatable: true},
      ],
    };
  }
}

export abstract class OverviewMetadataItem extends OverviewSearchResult implements HasRelativeUrl {
  public readonly relativeUrl: string;

  protected constructor(
    uuid: string,
    name: string,
    description: string,
    public readonly type: OverviewSearchResultModel,
    public readonly responsibleDepartment: string,
  ) {
    super(uuid, name, description);
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
  public readonly ogd: OGDAvailability;

  constructor(uuid: string, name: string, description: string, responsibleDepartment: string, outputFormat: string[], ogd: boolean) {
    super(uuid, name, description, 'Geodatensatz', responsibleDepartment);
    this.outputFormat = outputFormat;
    this.ogd = ogd ? OGDAvailability.OGD : OGDAvailability.NOGD;
  }

  public override createDisplayRepresentationForList(): OverviewSearchResultDisplayItem {
    const {fields, ...rest} = super.createDisplayRepresentationForList();
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
