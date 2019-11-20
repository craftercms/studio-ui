export function getTranslation(key: string, table: any, formatMessage = (descriptor) => descriptor) {
  return formatMessage(table[key] || { id: 'translationNotAvailable', defaultMessage: key });
}
