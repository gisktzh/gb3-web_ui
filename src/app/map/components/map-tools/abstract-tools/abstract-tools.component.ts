import {Component, inject} from '@angular/core';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {ToolType} from '../../../../shared/types/tool.type';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';

@Component({template: ''})
export class AbstractToolsComponent {
  private readonly store = inject(Store);
  protected readonly dialogService = inject(MatDialog);

  public readonly activeTool = this.store.selectSignal(selectActiveTool);

  protected toggleTool(tool: ToolType) {
    if (this.activeTool() === tool) {
      this.store.dispatch(ToolActions.deactivateTool());
    } else {
      this.store.dispatch(ToolActions.activateTool({tool}));
    }
  }
}
