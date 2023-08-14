import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from './overview-metadata-item.model';
import {DataCataloguePage} from '../enums/data-catalogue-page.enum';
import {MainPage} from '../enums/main-page.enum';

const TEST_GUID = 1337;

function expectUrlForType(dataCataloguePage: DataCataloguePage): string {
  return `/${MainPage.Data}/${dataCataloguePage}/${TEST_GUID}`;
}

describe('OverviewMetadataItemModel', () => {
  it('creates the correct URL for ServiceOverviewMetadataItem', () => {
    const testItem = new ServiceOverviewMetadataItem(TEST_GUID, '', '', '');
    expect(testItem.relativeUrl).toEqual(expectUrlForType(DataCataloguePage.Services));
  });
  it('creates the correct URL for MapOverviewMetadataItem', () => {
    const testItem = new MapOverviewMetadataItem(TEST_GUID, '', '', '');
    expect(testItem.relativeUrl).toEqual(expectUrlForType(DataCataloguePage.Maps));
  });
  it('creates the correct URL for ProductOverviewMetadataItem', () => {
    const testItem = new ProductOverviewMetadataItem(TEST_GUID, '', '', '');
    expect(testItem.relativeUrl).toEqual(expectUrlForType(DataCataloguePage.Products));
  });
  it('creates the correct URL for DatasetOverviewMetadataItem', () => {
    const testItem = new DatasetOverviewMetadataItem(TEST_GUID, '', '', '', '');
    expect(testItem.relativeUrl).toEqual(expectUrlForType(DataCataloguePage.Datasets));
  });
});
