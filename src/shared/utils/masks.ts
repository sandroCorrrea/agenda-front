export function cpfMask(value: string): string {
  if (!value) return '';

  value = value.replace(/\D/g, '');
  value = value.slice(0, 11);

  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  return value;
}

export function cnpjMask(value: string): string {
  if (!value) return '';

  value = value.replace(/\D/g, '');
  value = value.slice(0, 14);

  value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');

  return value;
}

export function phoneMask(value: string): string {
  if (!value) return '';

  value = value.replace(/\D/g, '');
  value = value.slice(0, 11);

  if (value.length <= 10) {
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
  }

  return value;
}

export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

/** CEP: 00000-000 */
export function cepMask(value: string): string {
  const n = value.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 5) return n;
  return `${n.slice(0, 5)}-${n.slice(5)}`;
}