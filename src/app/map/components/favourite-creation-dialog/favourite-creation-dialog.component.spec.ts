import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {FavouritesService} from '../../services/favourites.service';
import {FavouriteCreationDialogComponent} from './favourite-creation-dialog.component';

describe('FavouriteCreationDialogComponent', () => {
  let component: FavouriteCreationDialogComponent;
  let fixture: ComponentFixture<FavouriteCreationDialogComponent>;
  let store: MockStore;

  const createFavouriteMock = vi.fn();
  const closeDialogMock = vi.fn();

  beforeEach(async () => {
    createFavouriteMock.mockReturnValue(of({id: 'favorite-id'}));

    await TestBed.configureTestingModule({
      imports: [FavouriteCreationDialogComponent],
      providers: [
        provideMockStore(),
        {provide: FavouritesService, useValue: {createFavourite: createFavouriteMock}},
        {provide: MatDialogRef, useValue: {close: closeDialogMock}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavouriteCreationDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('defaults both map extent options to checked', () => {
    const checkboxes = Array.from(fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>);

    expect(component.model()).toEqual({title: '', storeCenter: true, storeScale: true});
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes.every((checkbox) => checkbox.checked)).toBe(true);
  });

  it('passes the title and selected map extent options to the favourites service', async () => {
    const payload = {title: 'My favorite', storeCenter: true, storeScale: true};
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.model.set(payload);
    fixture.detectChanges();

    await component.save();

    expect(createFavouriteMock).toHaveBeenCalledTimes(1);
    expect(createFavouriteMock).toHaveBeenCalledWith(payload);
    expect(dispatchSpy).toHaveBeenCalledWith(FavouriteListActions.loadFavourites());
    expect(closeDialogMock).toHaveBeenCalledWith(false);
  });
});
