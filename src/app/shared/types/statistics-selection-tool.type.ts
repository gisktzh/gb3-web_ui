import {StatisticsMode} from './statistics-mode.type';
import {ToolType} from './tool.type';

/**
 * Tools used to define the area a statistics query is run against. They mirror the data download selection tools, but draw onto the
 * statistics layer and feed the statistics state instead of an order.
 *
 * The list is the single source of truth so that the tools can also be recognised at runtime, e.g. to tell whether the currently
 * active tool belongs to the statistics mode.
 */
export const statisticsSelectionTools = ['select-statistics-circle', 'select-statistics-polygon'] as const;

export type StatisticsSelectionTool = (typeof statisticsSelectionTools)[number];

/** The tool that draws the area for a given mode. Both directions are needed, as either side can be the one the user changes. */
export const statisticsSelectionToolByMode: Record<StatisticsMode, StatisticsSelectionTool> = {
  umkreis: 'select-statistics-circle',
  polygon: 'select-statistics-polygon',
};

/** The mode a tool belongs to, or undefined for the tools that have nothing to do with statistics. */
export function findStatisticsModeForTool(tool: ToolType | undefined): StatisticsMode | undefined {
  return (Object.keys(statisticsSelectionToolByMode) as StatisticsMode[]).find((mode) => statisticsSelectionToolByMode[mode] === tool);
}
