import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {DatasetMetadata, DepartmentalContact} from '../../../shared/interfaces/gb3-metadata.interface';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {DatasetDetailComponent} from './dataset-detail.component';

describe('DatasetDetailComponent', () => {
  const contact: DepartmentalContact = {
    department: 'Office',
    division: 'Data',
    section: null,
    firstName: 'Dorothy',
    lastName: 'Vaughan',
    street: 'Main Street',
    houseNumber: 1,
    poBox: null,
    zipCode: 8000,
    village: 'Zurich',
    phone: '123',
    phoneDirect: '456',
    email: null,
    url: null,
  };
  const metadata: DatasetMetadata = {
    uuid: 'dataset-1',
    gisZHNr: 10,
    name: 'Terrain',
    description: 'Terrain dataset',
    shortDescription: 'Terrain',
    imageUrl: null,
    topics: ['Elevation'],
    keywords: ['terrain'],
    dataBasis: 'Survey',
    dataCapture: 'Lidar',
    remarks: 'Updated',
    outputFormat: ['GeoTIFF'],
    scale: 5000,
    resolution: 2,
    positionAccuracy: 0.5,
    scope: 'Canton Zurich',
    dataStatus: '2026',
    updateType: 'yearly',
    editingStatus: 'complete',
    ogd: true,
    statuteClass: 'A',
    geoBaseData: {href: 'https://example.com/law'},
    geocat: {href: 'https://example.com/geocat'},
    opendataSwiss: {href: 'https://example.com/opendata'},
    mxd: {href: 'https://example.com/map.mxd'},
    lyr: [{href: 'https://example.com/map.lyr'}],
    pdf: {href: 'https://example.com/doc.pdf'},
    contact: {geodata: contact, metadata: contact},
    maps: [{uuid: 'map-1', topic: 'terrain', name: 'Terrain map'}],
    services: [{uuid: 'service-1', serviceType: 'WMS', name: 'Terrain WMS'}],
    products: [{uuid: 'product-1', name: 'Terrain package'}],
    layers: [
      {
        id: 'layer-1',
        name: 'Height',
        description: 'Height layer',
        dataProcurementType: 'download',
        path: 'height.tif',
        geometryType: 'raster',
        attributes: [],
        metadataVisibility: 'public',
      },
    ],
  };
  const loadDatasetDetail = vi.fn().mockReturnValue(of(metadata));

  beforeEach(async () => {
    loadDatasetDetail.mockReturnValue(of(metadata));
    const paramMap = convertToParamMap({id: 'dataset-1'});
    await TestBed.configureTestingModule({
      imports: [DatasetDetailComponent],
      providers: [
        provideRouter([]),
        provideMockStore({selectors: [{selector: selectScreenMode, value: 'regular'}]}),
        {provide: ActivatedRoute, useValue: {paramMap: of(paramMap), snapshot: {paramMap}}},
        {provide: ConfigService, useValue: {apiConfig: {gb2StaticFiles: {baseUrl: 'https://static.example.com'}}}},
        {provide: Gb3MetadataService, useValue: {loadDatasetDetail}},
      ],
    })
      .overrideComponent(DatasetDetailComponent, {set: {template: ''}})
      .compileComponents();
  });

  it('loads the route resource and exposes each catalogue section', async () => {
    const fixture = TestBed.createComponent(DatasetDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(loadDatasetDetail).toHaveBeenCalledWith('dataset-1');
    expect(component.loadingState()).toBe('loaded');
    expect(component.baseMetadataInformation()).toEqual({
      itemTitle: 'Terrain',
      shortDescription: 'Terrain dataset',
      category: 'Geodatensatz',
      imageUrl: null,
    });
    expect(component.informationElements()).toEqual([
      {title: 'GIS-ZH Nr.', value: '10', type: 'text'},
      {title: 'eCH Geokategorien / Themen', value: ['Elevation'], type: 'textList'},
      {title: 'Schlüsselwörter', value: ['terrain'], type: 'textList'},
    ]);
    expect(component.geoSpatialElements()).toContainEqual({title: 'Erfassungsmassstab', value: '1:5000', type: 'text'});
    expect(component.geoSpatialElements()).toContainEqual({title: 'Lagegenauigkeit', value: '0.5 [m]', type: 'text'});
    expect(component.updateElements()).toContainEqual({title: 'Nachführungstyp ', value: 'yearly', type: 'text'});
    expect(component.legislationElements()).toContainEqual({title: 'Geobasisdaten ID', value: metadata.geoBaseData, type: 'url'});
    expect(component.externalLinksElements()).toContainEqual({title: 'Geocat', value: metadata.geocat, type: 'url'});
    expect(component.arcGISElements()).toContainEqual({title: 'ArcMap .lyr', value: metadata.lyr, type: 'urlList'});
    expect(component.dataBasisElements()).toContainEqual({title: 'Dokumentation (PDF)', value: metadata.pdf, type: 'url'});
    expect(component.dataProcurement()).toContainEqual({title: 'Bezugsart', value: 'OGD-Daten (kostenlos)', type: 'text'});
    expect(component.datasetLayers()).toEqual(metadata.layers);
    expect(component.linkedData()).toEqual({maps: metadata.maps, services: metadata.services, products: metadata.products});
    expect(component.geodataContactElements()).toContainEqual({title: 'Kontaktperson', value: 'Dorothy Vaughan', type: 'text'});
  });
});
