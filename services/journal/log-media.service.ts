import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import api from '../core/api';
import { base64ToBytes, bytesToBase64, encryptBytes, encryptMediaBlob } from './media-crypto.service';

const ENCRYPTED_UPLOAD_DIR = `${FileSystem.cacheDirectory ?? ''}encrypted_uploads/`;

export type LogMediaType = 'photo' | 'audio';

export interface LogMediaUploadInput {
  uri: string;
  file?: File;
  fileName?: string | null;
  mimeType?: string | null;
}

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  m4a: 'audio/m4a',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  caf: 'audio/x-caf',
  webm: 'audio/webm',
  ogg: 'audio/ogg',
};

interface UploadedMedia {
  id: string;
  url: string;
  label?: string;
  encrypted?: boolean;
  iv?: string | null;
  mimeType?: string | null;
}

function extFromMime(mime: string, type: LogMediaType): string {
  const m = mime.toLowerCase();
  if (type === 'photo') {
    if (m.includes('jpeg')) return 'jpg';
    if (m.includes('png')) return 'png';
    if (m.includes('webp')) return 'webp';
    if (m.includes('heic') || m.includes('heif')) return 'heic';
    return 'jpg';
  }
  if (m.includes('webm')) return 'webm';
  if (m.includes('mp4') || m.includes('m4a') || m.includes('aac')) return 'm4a';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('wav')) return 'wav';
  if (m.includes('ogg')) return 'ogg';
  if (m.includes('caf')) return 'caf';
  return 'm4a';
}

function getUri(input: string | LogMediaUploadInput): string {
  return typeof input === 'string' ? input : input.uri;
}

function extFromName(name: string | null | undefined): string | null {
  if (!name || !name.includes('.')) return null;
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ext in MIME_TYPES ? ext : null;
}

function extFromUri(uri: string): string | null {
  const last = uri.split('?')[0].split('/').pop() ?? '';
  return extFromName(last);
}

function appendEncryptedFile(form: FormData, encrypted: Awaited<ReturnType<typeof encryptMediaBlob>>, type: LogMediaType) {
  const filename = `${type}-${Date.now()}.enc.txt`;
  const uploadFile =
    typeof File !== 'undefined'
      ? new File([encrypted.blob], filename, { type: 'application/octet-stream' })
      : encrypted.blob;

  form.append('encrypted', 'true');
  form.append('iv', encrypted.iv);
  form.append('mimeType', encrypted.mimeType);
  form.append(type, uploadFile as any, filename);
}

async function ensureEncryptedUploadDir() {
  const info = await FileSystem.getInfoAsync(ENCRYPTED_UPLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ENCRYPTED_UPLOAD_DIR, { intermediates: true });
  }
}

function resolveNativeMime(input: string | LogMediaUploadInput, type: LogMediaType): string {
  const mediaInput = typeof input === 'string' ? null : input;
  if (mediaInput?.mimeType) return mediaInput.mimeType;
  const fromName = mediaInput?.fileName ? extFromName(mediaInput.fileName) : null;
  const fromUri = extFromUri(getUri(input));
  const ext = fromName ?? fromUri;
  if (ext && MIME_TYPES[ext]) return MIME_TYPES[ext];
  return type === 'photo' ? 'image/jpeg' : 'audio/m4a';
}

async function buildNativeFormData(input: string | LogMediaUploadInput, type: LogMediaType): Promise<FormData> {
  const uri = getUri(input);
  const plaintextBase64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const plaintext = base64ToBytes(plaintextBase64);
  const { bytes: ciphertext, iv } = await encryptBytes(plaintext);
  const ciphertextBase64 = bytesToBase64(ciphertext);

  await ensureEncryptedUploadDir();
  const filename = `${type}-${Date.now()}.enc`;
  const encUri = `${ENCRYPTED_UPLOAD_DIR}${filename}`;
  await FileSystem.writeAsStringAsync(encUri, ciphertextBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const mimeType = resolveNativeMime(input, type);
  const form = new FormData();
  form.append('encrypted', 'true');
  form.append('iv', iv);
  form.append('mimeType', mimeType);
  form.append(type, {
    uri: encUri,
    name: filename,
    type: 'application/octet-stream',
  } as any);
  return form;
}

async function buildEncryptedWebFormData(blob: Blob, mime: string, type: LogMediaType) {
  const encrypted = await encryptMediaBlob(blob, mime);
  const form = new FormData();
  appendEncryptedFile(form, encrypted, type);
  return form;
}

async function buildWebFormData(input: string | LogMediaUploadInput, type: LogMediaType): Promise<FormData> {
  const uri = getUri(input);
  const mediaInput = typeof input === 'string' ? null : input;
  const directFile = mediaInput?.file;
  if (directFile && mediaInput) {
    const ext =
      extFromName(mediaInput.fileName) ??
      extFromName(directFile.name) ??
      extFromMime(mediaInput.mimeType || directFile.type || '', type);
    const mime = mediaInput.mimeType || directFile.type || MIME_TYPES[ext] || (type === 'photo' ? 'image/jpeg' : 'audio/webm');
    const filename = mediaInput.fileName || directFile.name || `${type}-${Date.now()}.${ext}`;
    const safeFilename = filename.includes('.') ? filename : `${filename}.${ext}`;
    const uploadFile =
      directFile.type === mime && directFile.name === safeFilename
        ? directFile
        : new File([directFile], safeFilename, { type: mime });
    return buildEncryptedWebFormData(uploadFile, mime, type);
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Cannot read media URI (${response.status})`);
  }
  const blob = await response.blob();
  const fromUri = extFromUri(uri);
  const ext = fromUri ?? extFromMime(blob.type || '', type);
  const mime = blob.type || MIME_TYPES[ext] || (type === 'photo' ? 'image/jpeg' : 'audio/webm');
  const filename = `${type}-${Date.now()}.${ext}`;
  const namedFile =
    typeof File !== 'undefined'
      ? new File([blob], filename, { type: mime })
      : blob;
  return buildEncryptedWebFormData(namedFile, mime, type);
}

export async function uploadLogMedia(
  logId: string,
  media: string | LogMediaUploadInput,
  type: LogMediaType
): Promise<UploadedMedia | null> {
  try {
    const form =
      Platform.OS === 'web'
        ? await buildWebFormData(media, type)
        : await buildNativeFormData(media, type);
    const res = await api.post(`/logs/${logId}/${type}`, form, {
      headers:
        Platform.OS === 'web'
          ? undefined
          : { 'Content-Type': 'multipart/form-data' },
    });

    if (Platform.OS !== 'web') {
      const fd = form as any;
      const part = fd?._parts?.find?.(([name]: [string, any]) => name === type);
      const partUri = part?.[1]?.uri as string | undefined;
      if (partUri?.startsWith(ENCRYPTED_UPLOAD_DIR)) {
        FileSystem.deleteAsync(partUri, { idempotent: true }).catch(() => {});
      }
    }

    return res.data;
  } catch (e: any) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    const detail = data?.error ?? data?.code ?? e?.message ?? 'unknown';
    console.warn(
      `uploadLogMedia ${type} failed (${status ?? 'no-status'}):`,
      detail,
      data ?? ''
    );
    return null;
  }
}
