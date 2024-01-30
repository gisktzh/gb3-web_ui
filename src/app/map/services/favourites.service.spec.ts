import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {FavouritesService} from './favourites.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {selectActiveMapItemConfigurations} from '../../state/map/selectors/active-map-item-configuration.selector';
import {selectMaps} from '../../state/map/selectors/maps.selector';
import {selectFavouriteBaseConfig} from '../../state/map/selectors/favourite-base-config.selector';
import {selectUserDrawingsVectorLayers} from '../../state/map/selectors/user-drawings-vector-layers.selector';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {CreateFavourite, FavouritesResponse} from '../../shared/interfaces/favourite.interface';
import {of} from 'rxjs';
import {SharedFavorite} from '../../shared/models/gb3-api-generated.interfaces';

describe('FavouritesService', () => {
  let service: FavouritesService;
  let store: MockStore;
  let gb3FavouritesService: Gb3FavouritesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})],
    });
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveMapItemConfigurations, []);
    store.overrideSelector(selectMaps, []);
    store.overrideSelector(selectFavouriteBaseConfig, {center: {x: 0, y: 0}, scale: 0, basemap: ''});
    store.overrideSelector(selectUserDrawingsVectorLayers, {
      drawings: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
      measurements: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
    });
    service = TestBed.inject(FavouritesService);
    gb3FavouritesService = TestBed.inject(Gb3FavouritesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createFavourite', () => {
    it('calls the Gb3FavouritesService.createFavourite using the given title and returns the result', (done: DoneFn) => {
      const title = 'test title';
      const createFavouriteResult = {id: 'a'} as SharedFavorite;
      const gb3FavouritesServiceSpy = spyOn(gb3FavouritesService, 'createFavourite').and.returnValue(of(createFavouriteResult));

      const expectedServiceCallObject = jasmine.objectContaining<CreateFavourite>({title});

      service.createFavourite(title).subscribe((actual) => {
        expect(gb3FavouritesServiceSpy).toHaveBeenCalledOnceWith(expectedServiceCallObject);
        expect(actual).toEqual(createFavouriteResult);
        done();
      });
    });
  });

  describe('loadFavourites', () => {
    it('calls the Gb3FavouritesService.loadFavourites and returns the result', (done: DoneFn) => {
      const favouriteResponse = [] as FavouritesResponse;
      const gb3FavouritesServiceSpy = spyOn(gb3FavouritesService, 'loadFavourites').and.returnValue(of(favouriteResponse));

      service.loadFavourites().subscribe((actual) => {
        expect(gb3FavouritesServiceSpy).toHaveBeenCalledOnceWith();
        expect(actual).toEqual(favouriteResponse);
        done();
      });
    });
  });
});
