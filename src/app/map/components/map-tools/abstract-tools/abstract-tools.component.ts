import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {Subscription, tap} from 'rxjs';
import {ToolType} from '../../../../shared/types/tool.type';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';

@Component({
  template: '',
})
export class AbstractToolsComponent implements OnInit, OnDestroy {
  public activeTool: ToolType | undefined = undefined;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeTool$ = this.store.select(selectActiveTool);

  constructor(
    private readonly store: Store,
    protected readonly dialogService: MatDialog,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected toggleTool(tool: ToolType) {
    if (this.activeTool === tool) {
      this.store.dispatch(ToolActions.deactivateTool());
    } else {
      this.store.dispatch(ToolActions.activateTool({tool}));
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.activeTool$.pipe(tap((activeTool) => (this.activeTool = activeTool))).subscribe());
  }
}
