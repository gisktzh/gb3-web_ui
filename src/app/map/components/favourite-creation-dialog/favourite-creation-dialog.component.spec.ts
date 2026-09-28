import {Component, input, output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {of, Subject, throwError} from 'rxjs';
import {SharedFavorite} from '../../../shared/models/gb3-api-generated.interfaces';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {FavouritesService} from '../../services/favourites.service';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {FavouriteCreationDialogComponent} from './favourite-creation-dialog.component';

@Component({
  selector: 'api-dialog-wrapper',
  template: '<ng-content select="[content]" /><ng-content select="[actions]" />',
})
class ApiDialogWrapperStubComponent {
  public readonly savingState = input<LoadingState>();
  public readonly title = input<string>();
  public readonly closeEvent = output<void>();
}

describe('FavouriteCreationDialogComponent', () => {
  let fixture: ComponentFixture<FavouriteCreationDialogComponent>;
  let component: FavouriteCreationDialogComponent;
  let compiled: HTMLElement;
  let store: MockStore;

  const dialogRef = {close: vi.fn()};
  const favouritesService = {createFavourite: vi.fn()};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouriteCreationDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: FavouritesService, useValue: favouritesService},
        provideMockStore(),
        provideNoopAnimations(),
      ],
    })
      .overrideComponent(FavouriteCreationDialogComponent, {
        remove: {imports: [ApiDialogWrapperComponent]},
        add: {imports: [ApiDialogWrapperStubComponent]},
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(FavouriteCreationDialogComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function enterName(value: string): void {
    const inputElement = compiled.querySelector<HTMLInputElement>('#name');

    expect(inputElement).not.toBeNull();
    inputElement!.value = value;
    inputElement!.dispatchEvent(new Event('input', {bubbles: true}));
    fixture.detectChanges();
  }

  function button(label: string): HTMLButtonElement {
    const result = [...compiled.querySelectorAll<HTMLButtonElement>('button')].find((candidate) => candidate.textContent?.trim() === label);

    expect(result).toBeDefined();
    return result!;
  }

  it('requires a non-blank name before save is available', () => {
    expect(button('Speichern').disabled).toBe(true);

    enterName('   ');
    component.nameForm().markAsTouched();
    fixture.detectChanges();

    expect(button('Speichern').disabled).toBe(true);
    expect(compiled.querySelector('mat-error')?.textContent).toContain('Geben Sie einen gültigen, nicht leeren Namen ein.');

    enterName('Mein Favorit');

    expect(button('Speichern').disabled).toBe(false);
    expect(compiled.querySelector('mat-error')).toBeNull();
  });

  it('closes as aborted from both cancel entry points', () => {
    button('Abbrechen').click();

    expect(dialogRef.close).toHaveBeenCalledWith(true);

    vi.clearAllMocks();
    const wrapper = fixture.debugElement.query((debugElement) => debugElement.componentInstance instanceof ApiDialogWrapperStubComponent);
    wrapper.componentInstance.closeEvent.emit();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not invoke collaborators for invalid input', async () => {
    await component.save();

    expect(favouritesService.createFavourite).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('shows progress, refreshes favourites, and closes after a successful save', async () => {
    const created = new Subject<SharedFavorite>();
    const dispatch = vi.spyOn(store, 'dispatch');
    favouritesService.createFavourite.mockReturnValue(created.asObservable());
    enterName('Mein Favorit');

    const save = component.save();
    fixture.detectChanges();

    expect(component.savingState()).toBe('loading');
    expect(button('Abbrechen').disabled).toBe(true);
    expect(button('Speichern').disabled).toBe(true);
    expect(favouritesService.createFavourite).toHaveBeenCalledWith('Mein Favorit');

    created.next({} as SharedFavorite);
    created.complete();
    await save;

    expect(dispatch).toHaveBeenCalledWith(FavouriteListActions.loadFavourites());
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('keeps the dialog open and exposes an error when creation fails', async () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    favouritesService.createFavourite.mockReturnValue(throwError(() => new Error('network error')));
    enterName('Mein Favorit');

    await expect(component.save()).rejects.toThrow('Der Favorit konnte nicht gespeichert werden.');

    expect(component.savingState()).toBe('error');
    expect(dispatch).not.toHaveBeenCalledWith(FavouriteListActions.loadFavourites());
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('submits through the save button', async () => {
    favouritesService.createFavourite.mockReturnValue(of({} as SharedFavorite));
    enterName('Mein Favorit');

    button('Speichern').click();
    await fixture.whenStable();

    expect(favouritesService.createFavourite).toHaveBeenCalledWith('Mein Favorit');
  });
});
