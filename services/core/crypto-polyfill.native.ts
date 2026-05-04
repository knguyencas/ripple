import { install } from 'react-native-quick-crypto';

let installed = false;

export function setupCrypto() {
  if (installed) return;
  install();
  installed = true;
}
