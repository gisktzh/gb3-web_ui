import {Component, effect, ElementRef, inject, input, output, signal, untracked, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {SearchMode} from '../../types/search-mode.type';
import {MatIcon} from '@angular/material/icon';
import {SharedModule} from '../../shared.module';
import {FormsModule} from '@angular/forms';

const SEARCH_TERM_INPUT_DEBOUNCE_IN_MS = 300;

@Component({
  selector: 'search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  imports: [MatIcon, SharedModule, FormsModule],
})
export class SearchInputComponent {
  private readonly store = inject(Store);

  public readonly placeholderText = input.required<string>();
  public readonly showFilterButton = input(true);
  public readonly alwaysEnableClearButton = input(false);
  public readonly clearButtonLabel = input<string>();
  public readonly mode = input<SearchMode>('normal');
  public readonly focusOnInit = input(false);
  public readonly disabled = input(false);
  public readonly isAnyFilterActive = input(false);
  public readonly searchTerm = signal('');
  private readonly lastEmittedTerm = signal('');
  private readonly shouldEmitNext = signal(true);

  public readonly focusEvent = output();
  public readonly changeSearchTermEvent = output<string>();
  public readonly clearSearchTermEvent = output();
  public readonly openFilterEvent = output();

  public readonly inputRef = viewChild.required<ElementRef>('searchInput');

  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  constructor() {
    effect((onCleanup) => {
      const term = this.searchTerm();

      const timer = setTimeout(() => {
        if (term !== untracked(() => this.lastEmittedTerm()) && untracked(() => this.shouldEmitNext())) {
          this.lastEmittedTerm.set(term);
          this.changeSearchTermEvent.emit(term);
        }
        this.shouldEmitNext.set(true);
      }, SEARCH_TERM_INPUT_DEBOUNCE_IN_MS);

      onCleanup(() => clearTimeout(timer));
    });
  }

  public clearInput() {
    this.setTerm('', false);
    this.clearSearchTermEvent.emit();
  }

  public openFilter() {
    this.openFilterEvent.emit();
  }

  public setTerm(term: string, shouldEmit: boolean) {
    this.shouldEmitNext.set(shouldEmit);
    this.searchTerm.set(term);
  }

  public focus() {
    this.inputRef().nativeElement.focus();
  }
}
