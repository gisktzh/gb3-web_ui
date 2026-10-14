import {QueryResultStatus} from '../types/query-result-status.type';

export interface QueryResultStatusText {
  text: string;
  /**
   * An optional call to action rendered below the text. Currently unset for all statuses; the mockup foresees a "Verfügbare Layer
   * anzeigen" link for 'notSupported', but the target URL does not exist yet.
   */
  link?: {label: string; url: string};
}

/**
 * Explanatory texts shown instead of a layer's data. Shared by the feature and the statistics tab, so the wording stays consistent.
 */
export const queryResultStatusTexts: Record<Exclude<QueryResultStatus, 'ok'>, QueryResultStatusText> = {
  notSupported: {
    text: 'Dieser Layer bietet keine Statistik-Info an.',
  },
  noData: {
    text: 'Keine Daten an dieser Stelle.',
  },
  areaTooSmall: {
    text: 'Zu kleines Gebiet ausgewählt. Für gewisse Layer darf keine Information angezeigt werden. Vergrössern Sie das gewählte Gebiet.',
  },
};
