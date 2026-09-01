import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const DATE_TIME_WITH_SECONDS_PATTERN = /[T ]\d{2}:\d{2}:\d{2}/;
const DATE_TIME_WITH_MINUTES_PATTERN = /[T ]\d{2}:\d{2}/;
const EXPLICIT_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;

export function formatFeatureInfoFieldValue(value: string | number | null, type: 'text' | 'date'): string | null {
  if (value === null) {
    return null;
  }

  switch (type) {
    case 'text':
      return String(value);

    case 'date':
      return typeof value === 'string' ? formatDateValue(value) : null;
  }
}

function formatDateValue(value: string): string | null {
  const date = createDayjsObject(value);

  if (!date.isValid()) {
    return value;
  }

  if (DATE_TIME_WITH_SECONDS_PATTERN.test(value)) {
    return date.format('DD.MM.YYYY HH:mm:ss');
  }

  if (DATE_TIME_WITH_MINUTES_PATTERN.test(value)) {
    return date.format('DD.MM.YYYY HH:mm');
  }

  return date.format('DD.MM.YYYY');
}

function createDayjsObject(value: string): dayjs.Dayjs {
  // Offset/Z timestamps should be normalized to UTC to keep display deterministic across environments.
  return EXPLICIT_TIMEZONE_PATTERN.test(value) ? dayjs(value).utc() : dayjs(value);
}
