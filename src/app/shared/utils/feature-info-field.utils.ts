import dayjs from 'dayjs';

export function formatFeatureInfoFieldValue(value: string | number | null, type: 'text' | 'date'): string | null {
  if (value === null) {
    return null;
  }

  switch (type) {
    case 'text':
      return String(value);

    case 'date':
      return formatDateValue(value);
  }
}

function formatDateValue(value: string | number): string | null {
  const date = dayjs(value);
  if (!date.isValid()) {
    return typeof value === 'string' ? value : null;
  }

  const input = typeof value === 'string' ? value : '';

  if (/[T ]\d{2}:\d{2}:\d{2}/.test(input)) {
    return date.format('DD.MM.YYYY HH:mm:ss');
  }

  if (/[T ]\d{2}:\d{2}/.test(input)) {
    return date.format('DD.MM.YYYY HH:mm');
  }

  return date.format('DD.MM.YYYY');
}
