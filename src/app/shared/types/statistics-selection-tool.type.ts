/**
 * Tools used to define the area a statistics query is run against. They mirror the data download selection tools, but draw onto the
 * statistics layer and feed the statistics state instead of an order.
 *
 * The list is the single source of truth so that the tools can also be recognised at runtime, e.g. to tell whether the currently
 * active tool belongs to the statistics mode.
 */
export const statisticsSelectionTools = ['select-statistics-circle', 'select-statistics-polygon'] as const;

export type StatisticsSelectionTool = (typeof statisticsSelectionTools)[number];
