import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {DepartmentalContact, MapMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {MapDetailComponent} from './map-detail.component';

describe('MapDetailComponent', () => {
  const contact: DepartmentalContact = {
    department: 'Office',
    division: 'GIS',
    section: null,
    firstName: 'Ada',
    lastName: 'Lovelace',
    street: 'Main Street',
    houseNumber: 1,
    poBox: null,
    zipCode: 8000,
    village: 'Zurich',
    phone: '123',
    phoneDirect: '456',
    email: {href: 'mailto:ada@example.com'},
    url: {href: 'https://example.com'},
  };
  const metadata: MapMetadata = {
    uuid: 'map-1',
    gisZHNr: 42,
    name: 'Planning map',
    description: 'Current planning data',
    imageUrl: null,
    topic: 'planning',
    contact: {geodata: contact},
    datasets: [{uuid: 'dataset-1', name: 'Zones', shortDescription: 'Zone data', gisZHNr: 7}],
    externalLinks: [{href: 'https://example.com/info', title: 'Info'}],
    gb2Url: {href: 'https://maps.example.com/legacy'},
    intranetUrl: null,
    internetUrl: {href: 'https://maps.example.com'},
  };
  const loadMapDetail = vi.fn().mockReturnValue(of(metadata));

  beforeEach(async () => {
    loadMapDetail.mockReturnValue(of(metadata));
    const paramMap = convertToParamMap({id: 'map-1'});
    await TestBed.configureTestingModule({
      imports: [MapDetailComponent],
      providers: [
        provideRouter([]),
        provideMockStore({selectors: [{selector: selectScreenMode, value: 'regular'}]}),
        {provide: ActivatedRoute, useValue: {paramMap: of(paramMap), snapshot: {paramMap}}},
        {provide: ConfigService, useValue: {apiConfig: {gb2StaticFiles: {baseUrl: 'https://static.example.com'}}}},
        {provide: Gb3MetadataService, useValue: {loadMapDetail}},
      ],
    })
      .overrideComponent(MapDetailComponent, {set: {template: ''}})
      .compileComponents();
  });

  it('loads the route resource and exposes map-specific display data', async () => {
    const fixture = TestBed.createComponent(MapDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(loadMapDetail).toHaveBeenCalledWith('map-1');
    expect(component.loadingState()).toBe('loaded');
    expect(component.baseMetadataInformation()).toEqual({
      itemTitle: 'Planning map',
      topic: 'planning',
      category: 'GIS-Browser Karte',
      imageUrl: null,
      shortDescription: 'Current planning data',
    });
    expect(component.gB2Url()).toBe('https://maps.example.com/legacy');
    expect(component.linkedDatasets()).toEqual(metadata.datasets);
    expect(component.informationElements()).toEqual([
      {title: 'Nr.', value: '42', type: 'text'},
      {title: 'Kartentyp', value: 'GB2', type: 'text'},
      {title: 'Internet URL', value: metadata.internetUrl, type: 'url'},
      {title: 'Intranet URL', value: null, type: 'url'},
      {title: 'Weiterführende Verweise', value: metadata.externalLinks, type: 'urlList'},
    ]);
    expect(component.geodataContactElements()).toContainEqual({title: 'Kontaktperson', value: 'Ada Lovelace', type: 'text'});
  });
});
