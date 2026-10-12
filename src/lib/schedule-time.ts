export function localDateTimeInZone(value: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(value);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

export function dateTimeInZoneToUtc(localDateTime: string, timeZone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localDateTime)) {
    throw new Error('Choose a valid delivery date and time.');
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
  } catch {
    throw new Error('Enter a valid time zone, such as America/New_York.');
  }

  const [datePart, timePart] = localDateTime.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  const dateCheck = new Date(target);
  if (
    dateCheck.getUTCFullYear() !== year ||
    dateCheck.getUTCMonth() !== month - 1 ||
    dateCheck.getUTCDate() !== day ||
    dateCheck.getUTCHours() !== hour ||
    dateCheck.getUTCMinutes() !== minute
  ) {
    throw new Error('Choose a valid delivery date and time.');
  }

  let candidate = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const zoned = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(candidate));
    const part = (type: string) => Number(zoned.find((entry) => entry.type === type)?.value);
    const observed = Date.UTC(
      part('year'),
      part('month') - 1,
      part('day'),
      part('hour'),
      part('minute'),
      part('second'),
    );
    const difference = target - observed;
    if (difference === 0) return new Date(candidate).toISOString();
    candidate += difference;
  }

  if (localDateTimeInZone(new Date(candidate), timeZone) !== localDateTime) {
    throw new Error('That local time does not exist because of a daylight-saving clock change. Choose another time.');
  }
  return new Date(candidate).toISOString();
}
