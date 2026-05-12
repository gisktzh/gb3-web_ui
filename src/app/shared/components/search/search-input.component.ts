import {Component, effect, ElementRef, inject, input, output, signal, untracked, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {SearchMode} from '../../types/search-mode.type';

import {MatIcon} from '@angular/material/icon';
import {SharedModule} from '../../shared.module';

const SEARCH_TERM_INPUT_DEBOUNCE_IN_MS = 300;

@Component({
  selector: 'search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  imports: [MatIcon, SharedModule],
})
export class SearchInputComponent {
  private readonly store = inject(Store);

  public placeholderText = input.required<string>();
  public showFilterButton = input(true);
  public alwaysEnableClearButton = input(false);
  public clearButtonLabel = input<string>();
  public mode = input<SearchMode>('normal');
  public focusOnInit = input(false);
  public disabled = input(false);
  public isAnyFilterActive = input(false);

  public readonly focusEvent = output();
  public readonly changeSearchTermEvent = output<string>();
  public readonly clearSearchTermEvent = output();
  public readonly openFilterEvent = output();

  public inputRef = viewChild.required<ElementRef>('searchInput');

  public screenMode = this.store.selectSignal(selectScreenMode);

  private lastEmittedTerm = signal('');
  private shouldEmitNext = signal(true);
  public searchTerm = signal('');

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

  public onInput(term: string) {
    this.searchTerm.set(term);
  }

  public setTerm(term: string, shouldEmit: boolean) {
    this.shouldEmitNext.set(shouldEmit);
    this.searchTerm.set(term);
  }

  public focus() {
    this.inputRef().nativeElement.focus();
  }
}
