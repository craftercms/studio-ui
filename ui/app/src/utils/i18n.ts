export function getTranslation(key: string, table: any) {
  return table[key] || { id: 'translationNotAvailable', defaultMessage: key };
}
