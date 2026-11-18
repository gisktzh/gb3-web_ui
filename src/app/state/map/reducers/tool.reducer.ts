import {MapConfigActions} from '../actions/map-config.actions';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {createFeature, createReducer, createSelector, on} from '@ngrx/store';
import {ToolState} from '../states/tool.state';
import {ToolActions} from '../actions/tool.actions';
import {isDataDownloadSelectionTool} from '../../../shared/types/data-download-selection-tool.type';

export const toolFeatureKey = 'tool';
export const initialState: ToolState = {interaction: {kind: 'idle'}, sequence: 0};

export const toolFeature = createFeature({
  name: toolFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadOrderActions.setSelection, (state): ToolState => {
      const interaction = state.interaction;
      return interaction.kind !== 'idle' && interaction.kind !== 'edit' && isDataDownloadSelectionTool(interaction.tool)
        ? {...state, interaction: {...interaction, kind: 'selected', tool: interaction.tool}}
        : state;
    }),
    on(ToolActions.startCreation, (state, {tool}): ToolState => ({
      sequence: state.sequence + 1,
      interaction: {kind: 'create', id: state.sequence + 1, tool},
    })),
    on(ToolActions.startEditing, (state, {tool, target}): ToolState => ({
      sequence: state.sequence + 1,
      interaction: {kind: 'edit', id: state.sequence + 1, tool, target},
    })),
    on(ToolActions.cancelInteraction, MapConfigActions.markMapServiceAsDeinitialized, (state): ToolState => ({
      ...state,
      interaction: {kind: 'idle'},
    })),
    on(ToolActions.interactionFailed, (state, {interactionId}): ToolState =>
      state.interaction.kind !== 'idle' && state.interaction.id === interactionId ? {...state, interaction: {kind: 'idle'}} : state,
    ),
    on(ToolActions.completeInteraction, (state, {interactionId}): ToolState => {
      const interaction = state.interaction;
      if (interaction.kind === 'idle' || interaction.id !== interactionId) return state;
      return {
        ...state,
        interaction:
          interaction.kind !== 'edit' && isDataDownloadSelectionTool(interaction.tool)
            ? {...interaction, kind: 'selected', tool: interaction.tool}
            : {kind: 'idle'},
      };
    }),
  ),
});

export const {name, reducer, selectToolState, selectInteraction, selectSequence} = toolFeature;
export const selectActiveTool = createSelector(selectInteraction, (interaction) =>
  interaction?.kind === 'idle' ? undefined : interaction?.tool,
);
export const selectIsEditing = createSelector(selectInteraction, (interaction) => interaction?.kind === 'edit');
