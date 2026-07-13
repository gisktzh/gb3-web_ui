export function formatFeatureInfoFieldValue(value: string | number | Date | null, type: 'text' | 'date'): string | null {
  if (value == null) {
    return null;
  }

  switch (type) {
    case 'text':
      return String(value);

    case 'date':
      return formatDateValue(value);
  }
}

function formatDateValue(value: string | number | Date): string | null {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : null;
  }

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  if (typeof value !== 'string' || /[T ]\d{2}:\d{2}/.test(value)) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;

    if (typeof value !== 'string' || /[T ]\d{2}:\d{2}:\d{2}/.test(value)) {
      options.second = '2-digit';
    }
  }

  return new Intl.DateTimeFormat('de-CH', options).format(date);
}
