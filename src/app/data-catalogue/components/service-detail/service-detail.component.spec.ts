import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {DepartmentalContact, ServiceMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {ServiceDetailComponent} from './service-detail.component';

describe('ServiceDetailComponent', () => {
  const contact: DepartmentalContact = {
    department: 'Office',
    division: null,
    section: null,
    firstName: 'Katherine',
    lastName: 'Johnson',
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
  const metadata: ServiceMetadata = {
    uuid: 'service-1',
    gisZHNr: 81,
    name: 'WMS service',
    description: 'A map service',
    imageUrl: null,
    serviceType: 'WMS',
    url: 'https://example.com/wms?lang=de',
    version: '1.3.0',
    access: 'public',
    contact: {metadata: contact},
    datasets: [{uuid: 'dataset-1', name: 'Terrain', shortDescription: 'Terrain data', gisZHNr: 4}],
  };
  const loadServiceDetail = vi.fn().mockReturnValue(of(metadata));

  beforeEach(async () => {
    loadServiceDetail.mockReturnValue(of(metadata));
    const paramMap = convertToParamMap({id: 'service-1'});
    await TestBed.configureTestingModule({
      imports: [ServiceDetailComponent],
      providers: [
        provideRouter([]),
        provideMockStore({selectors: [{selector: selectScreenMode, value: 'regular'}]}),
        {provide: ActivatedRoute, useValue: {paramMap: of(paramMap), snapshot: {paramMap}}},
        {provide: ConfigService, useValue: {apiConfig: {gb2StaticFiles: {baseUrl: 'https://static.example.com'}}}},
        {provide: Gb3MetadataService, useValue: {loadServiceDetail}},
      ],
    })
      .overrideComponent(ServiceDetailComponent, {set: {template: ''}})
      .compileComponents();
  });

  it('loads the route resource and builds the GetCapabilities display link', async () => {
    const fixture = TestBed.createComponent(ServiceDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(loadServiceDetail).toHaveBeenCalledWith('service-1');
    expect(component.loadingState()).toBe('loaded');
    expect(component.baseMetadataInformation()).toEqual({
      itemTitle: 'WMS service',
      category: 'Geodienst',
      shortDescription: 'A map service',
      imageUrl: null,
    });
    expect(component.serviceUrlForCopy()).toBe(metadata.url);
    expect(component.linkedDatasets()).toEqual(metadata.datasets);
    expect(component.informationElements()).toEqual([
      {title: 'GIS-ZH Nr.', value: '81', type: 'text'},
      {title: 'Geodienst', value: 'WMS', type: 'text'},
      {
        title: 'GetCapabilities',
        value: {href: 'https://example.com/wms?lang=de&service=WMS&request=GetCapabilities'},
        type: 'url',
      },
      {title: 'Version', value: '1.3.0', type: 'text'},
      {title: 'Zugang', value: 'public', type: 'text'},
    ]);
    expect(component.metadataContactElements()).toContainEqual({title: 'Kontaktperson', value: 'Katherine Johnson', type: 'text'});
  });
});
