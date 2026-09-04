import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {FavouritesService} from '../../services/favourites.service';
import {FavouriteCreationDialogComponent} from './favourite-creation-dialog.component';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {FavouriteCouldNotBeCreated} from '../../../shared/errors/favourite.errors';
import {from, of, throwError} from 'rxjs';
import {Component} from '@angular/core';
import {MatError, MatFormField} from '@angular/material/input';
import {SharedFavorite} from 'src/app/shared/models/gb3-api-generated.interfaces';

describe('FavouriteCreationDialogComponent', () => {
  let component: FavouriteCreationDialogComponent;
  let fixture: ComponentFixture<FavouriteCreationDialogComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const dialogRefMock: Partial<MatDialogRef<FavouriteCreationDialogComponent>> = {
    close: vi.fn(),
  };

  const favouritesServiceMock: Partial<FavouritesService> = {
    createFavourite: vi.fn(),
  };

  @Component({
    selector: 'mat-form-field',
    template: '<div data-testid="form-field"><ng-content /></div>',
  })
  class MockMatFormField {}

  @Component({
    selector: 'mat-error',
    template: '<div data-testid="error"><ng-content /></div>',
  })
  class MockMatError {}

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [FavouriteCreationDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: FavouritesService, useValue: favouritesServiceMock},
        provideMockStore(),
      ],
    })
      .overrideComponent(FavouriteCreationDialogComponent, {
        remove: {
          imports: [MatError, MatFormField],
        },
        add: {
          imports: [MockMatError, MockMatFormField],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(FavouriteCreationDialogComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should render the dialog title', () => {
      expect(compiled.textContent).toContain('Aktive Karten als Favorit speichern');
    });

    it('should render the name input', () => {
      const input = compiled.querySelector('#name');

      expect(input).not.toBeNull();
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('should render the cancel and save buttons', () => {
      const buttons = compiled.querySelectorAll('button');

      expect(buttons).toHaveLength(3);
      expect(buttons[0].textContent?.trim()).toBe('close');
      expect(buttons[1].textContent?.trim()).toBe('Abbrechen');
      expect(buttons[2].textContent?.trim()).toBe('Speichern');
    });

    it('should disable the save button while the name is invalid', () => {
      const saveButton = compiled.querySelectorAll('button')[2] as HTMLButtonElement;

      expect(saveButton.disabled).toBe(true);
    });

    it('should not initially show the validation error', () => {
      expect(compiled.querySelector('mat-error')).toBeNull();
    });
  });

  describe('name validation', () => {
    function enterName(value: string): void {
      const input = compiled.querySelector('#name') as HTMLInputElement;

      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      component.nameForm().markAsTouched();
      fixture.detectChanges();
    }

    it('should accept a non-empty name', () => {
      enterName('My favourite');

      expect(component.nameForm().valid()).toBe(true);

      const saveButton = compiled.querySelectorAll('button')[2] as HTMLButtonElement;

      expect(saveButton.disabled).toBe(false);
    });

    it('should reject an empty name', () => {
      enterName('');

      expect(component.nameForm().valid()).toBe(false);

      const saveButton = compiled.querySelectorAll('button')[2] as HTMLButtonElement;

      expect(saveButton.disabled).toBe(true);
    });

    it('should reject a whitespace-only name', () => {
      enterName('   ');

      expect(component.nameForm().valid()).toBe(false);

      const saveButton = compiled.querySelectorAll('button')[2] as HTMLButtonElement;

      expect(saveButton.disabled).toBe(true);
    });

    it('should show the validation error after entering an invalid name', async () => {
      vi.useFakeTimers();
      enterName('   ');

      await vi.runAllTimersAsync();

      expect(component.nameForm().touched()).toBe(true);
      expect(compiled.querySelector('mat-error')?.textContent).toContain('Geben Sie einen gültigen, nicht leeren Namen ein.');
    });

    it('should hide the validation error after entering a valid name', () => {
      enterName('   ');

      expect(compiled.querySelector('mat-error')).not.toBeNull();

      enterName('Favourite');

      expect(compiled.querySelector('mat-error')).toBeNull();
    });
  });

  describe('abort', () => {
    it('should close the dialog as aborted', () => {
      component.abort();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should close the dialog as aborted when the cancel button is clicked', () => {
      const cancelButton = compiled.querySelectorAll('button')[0] as HTMLButtonElement;

      cancelButton.click();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });
  });

  describe('save', () => {
    function enterName(value: string): void {
      const input = compiled.querySelector('#name') as HTMLInputElement;

      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    it('should not save when the name is invalid', async () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch').mockImplementation(vi.fn());

      await component.save();

      expect(favouritesServiceMock.createFavourite).not.toHaveBeenCalled();
      expect(storeDispatchSpy).not.toHaveBeenCalled();
      expect(dialogRefMock.close).not.toHaveBeenCalled();
      expect(component.savingState()).toBeUndefined();
    });

    it('should create the favourite with the entered name', async () => {
      vi.spyOn(store, 'dispatch').mockImplementation(vi.fn());
      vi.mocked(favouritesServiceMock.createFavourite!).mockReturnValue(of({} as SharedFavorite));

      enterName('My favourite');

      await component.save();

      expect(favouritesServiceMock.createFavourite).toHaveBeenCalledOnce();
      expect(favouritesServiceMock.createFavourite).toHaveBeenCalledWith('My favourite');
    });

    it('should set the saving state to loading while saving', async () => {
      vi.spyOn(store, 'dispatch').mockImplementation(vi.fn());
      let resolveCreateFavourite!: (s: SharedFavorite) => void;

      vi.mocked(favouritesServiceMock.createFavourite!).mockReturnValue(
        from(
          new Promise<SharedFavorite>((resolve) => {
            resolveCreateFavourite = resolve;
          }) as never,
        ),
      );

      enterName('My favourite');

      const savePromise = component.save();

      expect(component.savingState()).toBe('loading');

      resolveCreateFavourite({} as SharedFavorite);
      await savePromise;
    });

    it('should load favourites and close the dialog after a successful save', async () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch').mockImplementation(vi.fn());
      vi.mocked(favouritesServiceMock.createFavourite!).mockReturnValue(of({} as SharedFavorite));

      enterName('My favourite');

      await component.save();

      expect(storeDispatchSpy).toHaveBeenCalledWith(FavouriteListActions.loadFavourites());
      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should close the dialog through the save method', async () => {
      vi.spyOn(store, 'dispatch').mockImplementation(vi.fn());
      vi.mocked(favouritesServiceMock.createFavourite!).mockReturnValue(of({} as SharedFavorite));

      enterName('My favourite');

      const saveButton = compiled.querySelectorAll('button')[1] as HTMLButtonElement;

      expect(saveButton.disabled).toBe(false);

      await component.save();
      fixture.detectChanges();

      expect(favouritesServiceMock.createFavourite).toHaveBeenCalledWith('My favourite');
      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should set the saving state to error when creation fails', async () => {
      const error = new Error('Creation failed');

      const storeDispatchSpy = vi.spyOn(store, 'dispatch').mockImplementation(vi.fn());

      vi.mocked(favouritesServiceMock.createFavourite!).mockReturnValue(throwError(() => error));

      enterName('My favourite');

      await expect(() => component.save()).rejects.toThrow(FavouriteCouldNotBeCreated);

      fixture.detectChanges();

      expect(component.savingState()).toBe('error');
      expect(storeDispatchSpy).not.toHaveBeenCalledWith(FavouriteListActions.loadFavourites());
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });

    it('should not dispatch or close when the service fails', async () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');
      const error = new Error('Creation failed');

      vi.mocked(favouritesServiceMock.createFavourite!).mockReturnValue(throwError(() => error));

      enterName('My favourite');

      await expect(component.save()).rejects.toThrow(FavouriteCouldNotBeCreated);

      expect(storeDispatchSpy).not.toHaveBeenCalled();
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('dialog wrapper', () => {
    it('should abort when the wrapper emits closeEvent', () => {
      const wrapper = compiled.querySelector('api-dialog-wrapper');

      expect(wrapper).not.toBeNull();

      wrapper?.dispatchEvent(
        new CustomEvent('closeEvent', {
          bubbles: true,
        }),
      );

      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });
  });
});
