/**
 * The status a queried layer reports back. Only 'ok' means data was actually delivered; the other values explain why a layer has no
 * result and are rendered as text in place of the missing data. It applies to both the feature and the statistics tab.
 */
export type QueryResultStatus = 'ok' | 'notSupported' | 'noData' | 'areaTooSmall';
