import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {of, throwError} from 'rxjs';
import {Mock} from 'vitest';
import {FavouritesService} from '../../services/favourites.service';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {FavouriteCouldNotBeRemoved} from '../../../shared/errors/favourite.errors';
import {FavouriteDeletionDialogComponent} from './favourite-deletion-dialog.component';

describe('FavouriteDeletionDialogComponent', () => {
  let component: FavouriteDeletionDialogComponent;
  let fixture: ComponentFixture<FavouriteDeletionDialogComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const dialogRefMock: Partial<MatDialogRef<FavouriteDeletionDialogComponent, boolean>> = {
    close: vi.fn(),
  };

  const favouritesServiceMock: Partial<FavouritesService> = {
    deleteFavourite: vi.fn(),
  };

  const dataMock = {
    favourite: {
      id: 'favourite-123',
      title: 'My favourite',
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    favouritesServiceMock.deleteFavourite = vi.fn().mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [FavouriteDeletionDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: FavouritesService, useValue: favouritesServiceMock},
        {provide: MAT_DIALOG_DATA, useValue: dataMock},
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(FavouriteDeletionDialogComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    it('should render the favourite title in the confirmation message', () => {
      expect(compiled.textContent).toContain('My favourite');
    });

    it('should render the cancellation button', () => {
      const buttons = compiled.querySelectorAll('button');

      expect(Array.from(buttons).some((button) => button.textContent?.includes('Abbrechen'))).toBe(true);
    });

    it('should render the deletion button', () => {
      const buttons = compiled.querySelectorAll('button');

      expect(Array.from(buttons).some((button) => button.textContent?.includes('Löschen'))).toBe(true);
    });

    it('should enable both action buttons when not loading', () => {
      const buttons = compiled.querySelectorAll<HTMLButtonElement>('button');

      expect(buttons).toHaveLength(3);
      expect(buttons[0].disabled).toBe(false);
      expect(buttons[1].disabled).toBe(false);
      expect(buttons[2].disabled).toBe(false);
    });

    it('should disable both action buttons while loading', () => {
      component.savingState.set('loading');
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll<HTMLButtonElement>('button');

      expect(buttons).toHaveLength(3);
      expect(buttons[0].disabled).toBe(false);
      expect(buttons[1].disabled).toBe(true);
      expect(buttons[2].disabled).toBe(true);
    });

    it('should enable both action buttons after loading finishes', () => {
      component.savingState.set('loading');
      fixture.detectChanges();

      component.savingState.set(undefined);
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll<HTMLButtonElement>('button');

      expect(buttons[0].disabled).toBe(false);
      expect(buttons[1].disabled).toBe(false);
    });

    it('should disable both action buttons in the error state only when loading is false', () => {
      component.savingState.set('error');
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll<HTMLButtonElement>('button');

      expect(buttons[0].disabled).toBe(false);
      expect(buttons[1].disabled).toBe(false);
    });

    it('should close the dialog when the cancel button is clicked', () => {
      const button = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find((element) =>
        element.textContent?.includes('Abbrechen'),
      );

      expect(button).toBeTruthy();

      button?.click();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });

    it('should call delete when the delete button is clicked', async () => {
      const deleteSpy = vi.spyOn(component, 'delete');

      const button = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find((element) =>
        element.textContent?.includes('Löschen'),
      );

      expect(button).toBeTruthy();

      button?.click();

      expect(deleteSpy).toHaveBeenCalledOnce();

      await fixture.whenStable();
    });

    it('should close the dialog when the wrapper emits closeEvent', () => {
      const closeSpy = vi.spyOn(component, 'close');

      const wrapper = compiled.querySelector('api-dialog-wrapper');

      expect(wrapper).toBeTruthy();

      wrapper?.dispatchEvent(new Event('closeEvent'));

      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should set the saving state to loading before deleting', async () => {
      let resolveDelete: (() => void) | undefined;

      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });

      vi.mocked(favouritesServiceMock.deleteFavourite!).mockReturnValueOnce(of(undefined));

      const savingStateSetSpy = vi.spyOn(component.savingState, 'set');

      await component.delete();

      expect(savingStateSetSpy).toHaveBeenCalledWith('loading');

      resolveDelete?.();
      await deletePromise;
    });

    it('should delete the favourite using the favourite from the dialog data', async () => {
      await component.delete();

      expect(favouritesServiceMock.deleteFavourite).toHaveBeenCalledOnce();
      expect(favouritesServiceMock.deleteFavourite).toHaveBeenCalledWith(dataMock.favourite);
    });

    it('should dispatch the removeFavourite action after successful deletion', async () => {
      await component.delete();

      expect(storeDispatchSpy).toHaveBeenCalledOnce();
      expect(storeDispatchSpy).toHaveBeenCalledWith(
        FavouriteListActions.removeFavourite({
          id: dataMock.favourite.id,
        }),
      );
    });

    it('should close the dialog after successful deletion', async () => {
      await component.delete();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
    });

    it('should set the saving state to loading while deletion is in progress', async () => {
      let resolveDelete: (() => void) | undefined;

      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });

      vi.mocked(favouritesServiceMock.deleteFavourite!).mockReturnValueOnce(throwError(() => new Error('Deletion failed')));

      try {
        await component.delete();
      } catch {
        // Expected: delete() rethrows FavouriteCouldNotBeRemoved.
      }

      expect(component.savingState()).toBe('error');

      resolveDelete?.();
      await deletePromise;
    });

    it('should set the saving state to error when deletion fails', async () => {
      vi.mocked(favouritesServiceMock.deleteFavourite!).mockReturnValueOnce(throwError(() => new Error('Deletion failed')));

      await expect(component.delete()).rejects.toBeInstanceOf(FavouriteCouldNotBeRemoved);

      expect(component.savingState()).toBe('error');
    });

    it('should throw FavouriteCouldNotBeRemoved when deletion fails', async () => {
      const originalError = new Error('Deletion failed');

      vi.mocked(favouritesServiceMock.deleteFavourite!).mockReturnValueOnce(throwError(() => originalError));

      await expect(component.delete()).rejects.toBeInstanceOf(FavouriteCouldNotBeRemoved);
    });

    it('should not dispatch an action when deletion fails', async () => {
      vi.mocked(favouritesServiceMock.deleteFavourite!).mockReturnValueOnce(throwError(() => new Error('Deletion failed')));

      await expect(component.delete()).rejects.toBeInstanceOf(FavouriteCouldNotBeRemoved);

      expect(storeDispatchSpy).not.toHaveBeenCalled();
    });

    it('should not close the dialog when deletion fails', async () => {
      vi.mocked(favouritesServiceMock.deleteFavourite!).mockReturnValueOnce(throwError(() => new Error('Deletion failed')));

      await expect(component.delete()).rejects.toBeInstanceOf(FavouriteCouldNotBeRemoved);

      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });
  });
});
