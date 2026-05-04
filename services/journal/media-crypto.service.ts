import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';

export interface MediaKeyEnvelope {
  mediaKeySalt?: string | null;
  encryptedMediaKey?: string | null;
  mediaKeyIv?: string | null;
  mediaKeyVersion?: number | null;
}

export interface PreparedMediaKeyEnvelope {
  mediaKeySalt: string;
  encryptedMediaKey: string;
  mediaKeyIv: string;
  mediaKeyVersion: number;
}

export interface EncryptedMediaBlob {
  blob: Blob;
  iv: string;
  mimeType: string;
}

export interface EncryptedBytes {
  bytes: Uint8Array;
  iv: string;
}

const DECRYPTED_MEDIA_DIR = `${FileSystem.cacheDirectory ?? ''}decrypted_media/`;

const STORAGE_KEY = 'ripple.mediaKey.v1';
const KEY_VERSION = 1;
const MEDIA_KEY_BYTES = 32;
const AES_IV_BYTES = 12;
const PBKDF2_SALT_BYTES = 16;
const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_HASH = 'SHA-256';

let mediaKeyBytes: Uint8Array | null = null;
let mediaCryptoKey: CryptoKey | null = null;

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async delete(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

function getSubtle() {
  const cryptoImpl = (globalThis as any).crypto as Crypto | undefined;
  if (!cryptoImpl?.subtle || !cryptoImpl.getRandomValues) {
    throw new Error('Media encryption is not available on this platform');
  }
  return cryptoImpl;
}

export function isMediaCryptoAvailable() {
  const cryptoImpl = (globalThis as any).crypto as Crypto | undefined;
  return Boolean(
    cryptoImpl?.subtle &&
    typeof cryptoImpl.getRandomValues === 'function' &&
    typeof btoa === 'function' &&
    typeof atob === 'function'
  );
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  getSubtle().getRandomValues(bytes);
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return bytesToBase64(new Uint8Array(buffer));
}

function exactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function importAesKey(rawKey: Uint8Array, usages: KeyUsage[]) {
  return getSubtle().subtle.importKey('raw', exactArrayBuffer(rawKey), { name: 'AES-GCM' }, false, usages);
}

async function derivePasswordKey(password: string, salt: Uint8Array) {
  const encodedPassword = new TextEncoder().encode(password);
  const baseKey = await getSubtle().subtle.importKey(
    'raw',
    exactArrayBuffer(encodedPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return getSubtle().subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: exactArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function setMediaKey(rawKey: Uint8Array, persist = true) {
  mediaKeyBytes = rawKey;
  mediaCryptoKey = await importAesKey(rawKey, ['encrypt', 'decrypt']);
  if (persist) {
    await storage.set(STORAGE_KEY, bytesToBase64(rawKey));
  }
}

export async function hydrateMediaKeyFromStorage() {
  const stored = await storage.get(STORAGE_KEY);
  if (!stored) return false;
  await setMediaKey(base64ToBytes(stored), false);
  return true;
}

export async function clearStoredMediaKey() {
  mediaKeyBytes = null;
  mediaCryptoKey = null;
  await storage.delete(STORAGE_KEY);
}

export function isMediaKeyUnlocked() {
  return Boolean(mediaKeyBytes && mediaCryptoKey);
}

export function hasCompleteMediaKeyEnvelope(user?: MediaKeyEnvelope | null) {
  return Boolean(user?.mediaKeySalt && user.encryptedMediaKey && user.mediaKeyIv);
}

export async function createMediaKeyEnvelope(password: string): Promise<PreparedMediaKeyEnvelope> {
  const mediaKey = randomBytes(MEDIA_KEY_BYTES);
  const salt = randomBytes(PBKDF2_SALT_BYTES);
  const iv = randomBytes(AES_IV_BYTES);
  const passwordKey = await derivePasswordKey(password, salt);
  const encrypted = await getSubtle().subtle.encrypt(
    { name: 'AES-GCM', iv: exactArrayBuffer(iv) },
    passwordKey,
    exactArrayBuffer(mediaKey)
  );

  await setMediaKey(mediaKey);

  return {
    mediaKeySalt: bytesToBase64(salt),
    encryptedMediaKey: arrayBufferToBase64(encrypted),
    mediaKeyIv: bytesToBase64(iv),
    mediaKeyVersion: KEY_VERSION,
  };
}

export async function rewrapMediaKey(newPassword: string): Promise<PreparedMediaKeyEnvelope> {
  if (!mediaKeyBytes) {
    throw new Error('Media key chưa được mở khoá. Vui lòng đăng nhập lại trước khi đổi mật khẩu.');
  }
  const salt = randomBytes(PBKDF2_SALT_BYTES);
  const iv = randomBytes(AES_IV_BYTES);
  const passwordKey = await derivePasswordKey(newPassword, salt);
  const encrypted = await getSubtle().subtle.encrypt(
    { name: 'AES-GCM', iv: exactArrayBuffer(iv) },
    passwordKey,
    exactArrayBuffer(mediaKeyBytes)
  );
  return {
    mediaKeySalt: bytesToBase64(salt),
    encryptedMediaKey: arrayBufferToBase64(encrypted),
    mediaKeyIv: bytesToBase64(iv),
    mediaKeyVersion: KEY_VERSION,
  };
}

export async function unlockMediaKeyFromPassword(password: string, envelope: MediaKeyEnvelope) {
  if (!hasCompleteMediaKeyEnvelope(envelope)) return false;

  const salt = base64ToBytes(envelope.mediaKeySalt!);
  const iv = base64ToBytes(envelope.mediaKeyIv!);
  const encryptedMediaKey = base64ToBytes(envelope.encryptedMediaKey!);
  const passwordKey = await derivePasswordKey(password, salt);
  const decrypted = await getSubtle().subtle.decrypt(
    { name: 'AES-GCM', iv: exactArrayBuffer(iv) },
    passwordKey,
    exactArrayBuffer(encryptedMediaKey)
  );
  const rawKey = new Uint8Array(decrypted);

  if (rawKey.length !== MEDIA_KEY_BYTES) {
    throw new Error('Invalid media key length');
  }

  await setMediaKey(rawKey);
  return true;
}

async function getMediaCryptoKey() {
  if (!mediaCryptoKey) {
    await hydrateMediaKeyFromStorage();
  }
  if (!mediaCryptoKey) {
    throw new Error('Media key is locked. Please sign in again.');
  }
  return mediaCryptoKey;
}

export async function encryptBytes(plaintext: Uint8Array): Promise<EncryptedBytes> {
  const key = await getMediaCryptoKey();
  const iv = randomBytes(AES_IV_BYTES);
  const encrypted = await getSubtle().subtle.encrypt(
    { name: 'AES-GCM', iv: exactArrayBuffer(iv) },
    key,
    exactArrayBuffer(plaintext)
  );
  return {
    bytes: new Uint8Array(encrypted),
    iv: bytesToBase64(iv),
  };
}

export async function decryptBytes(ciphertext: Uint8Array, ivBase64: string): Promise<Uint8Array> {
  const key = await getMediaCryptoKey();
  const iv = base64ToBytes(ivBase64);
  const decrypted = await getSubtle().subtle.decrypt(
    { name: 'AES-GCM', iv: exactArrayBuffer(iv) },
    key,
    exactArrayBuffer(ciphertext)
  );
  return new Uint8Array(decrypted);
}

export async function encryptMediaBlob(blob: Blob, mimeType: string): Promise<EncryptedMediaBlob> {
  const plaintext = new Uint8Array(await blob.arrayBuffer());
  const { bytes, iv } = await encryptBytes(plaintext);
  return {
    blob: new Blob([exactArrayBuffer(bytes)], { type: 'application/octet-stream' }),
    iv,
    mimeType: mimeType || blob.type || 'application/octet-stream',
  };
}

export async function decryptMediaBlob(blob: Blob, ivBase64: string, mimeType?: string | null) {
  const ciphertext = new Uint8Array(await blob.arrayBuffer());
  const plaintext = await decryptBytes(ciphertext, ivBase64);
  return new Blob([exactArrayBuffer(plaintext)], { type: mimeType || 'application/octet-stream' });
}

function extFromMimeForCache(mime?: string | null): string {
  if (!mime) return 'bin';
  const m = mime.toLowerCase();
  if (m.includes('jpeg')) return 'jpg';
  if (m.includes('png')) return 'png';
  if (m.includes('webp')) return 'webp';
  if (m.includes('heic') || m.includes('heif')) return 'heic';
  if (m.includes('m4a') || m.includes('mp4') || m.includes('aac')) return 'm4a';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('wav')) return 'wav';
  if (m.includes('ogg')) return 'ogg';
  if (m.includes('webm')) return 'webm';
  if (m.includes('caf')) return 'caf';
  return 'bin';
}

async function ensureDecryptedDir() {
  const info = await FileSystem.getInfoAsync(DECRYPTED_MEDIA_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DECRYPTED_MEDIA_DIR, { intermediates: true });
  }
}

async function decryptRemoteMediaWeb(url: string, iv: string, mimeType?: string | null) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cannot download encrypted media (${response.status})`);
  }
  const encrypted = await response.blob();
  const decrypted = await decryptMediaBlob(encrypted, iv, mimeType);
  if (typeof URL === 'undefined' || !URL.createObjectURL) {
    throw new Error('Object URLs are not available on this platform');
  }
  return URL.createObjectURL(decrypted);
}

async function decryptRemoteMediaNative(url: string, iv: string, mimeType?: string | null) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cannot download encrypted media (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const plaintext = await decryptBytes(new Uint8Array(arrayBuffer), iv);
  await ensureDecryptedDir();
  const ext = extFromMimeForCache(mimeType);
  const fileUri = `${DECRYPTED_MEDIA_DIR}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await FileSystem.writeAsStringAsync(fileUri, bytesToBase64(plaintext), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

export async function decryptRemoteMedia(url: string, iv: string, mimeType?: string | null) {
  if (Platform.OS === 'web') {
    return decryptRemoteMediaWeb(url, iv, mimeType);
  }
  return decryptRemoteMediaNative(url, iv, mimeType);
}

export function revokeDecryptedMediaUri(uri?: string | null) {
  if (!uri) return;
  if (uri.startsWith('blob:')) {
    if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(uri);
    }
    return;
  }
  if (uri.startsWith(DECRYPTED_MEDIA_DIR) || uri.startsWith(`file://${DECRYPTED_MEDIA_DIR}`)) {
    FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
  }
}
