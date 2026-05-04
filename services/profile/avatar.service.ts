import { Platform } from 'react-native';
import api from '../core/api';

export interface AvatarUploadInput {
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
  heif: 'image/heif',
};

function extFromName(name?: string | null) {
  if (!name || !name.includes('.')) return null;
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ext in MIME_TYPES ? ext : null;
}

function extFromMime(mime?: string | null) {
  const value = (mime ?? '').toLowerCase();
  if (value.includes('png')) return 'png';
  if (value.includes('webp')) return 'webp';
  if (value.includes('heic')) return 'heic';
  if (value.includes('heif')) return 'heif';
  return 'jpg';
}

function extFromUri(uri: string) {
  return extFromName(uri.split('?')[0].split('/').pop());
}

function buildNativeFormData(input: AvatarUploadInput) {
  const ext = extFromName(input.fileName) ?? extFromUri(input.uri) ?? extFromMime(input.mimeType);
  const mime = input.mimeType || MIME_TYPES[ext] || 'image/jpeg';
  const form = new FormData();
  form.append('avatar', {
    uri: input.uri,
    name: `avatar-${Date.now()}.${ext}`,
    type: mime,
  } as any);
  return form;
}

async function buildWebFormData(input: AvatarUploadInput) {
  const directFile = input.file;
  if (directFile) {
    const ext = extFromName(input.fileName) ?? extFromName(directFile.name) ?? extFromMime(input.mimeType || directFile.type);
    const mime = input.mimeType || directFile.type || MIME_TYPES[ext] || 'image/jpeg';
    const filename = input.fileName || directFile.name || `avatar-${Date.now()}.${ext}`;
    const safeFilename = filename.includes('.') ? filename : `${filename}.${ext}`;
    const uploadFile =
      directFile.type === mime && directFile.name === safeFilename
        ? directFile
        : new File([directFile], safeFilename, { type: mime });
    const form = new FormData();
    form.append('avatar', uploadFile, safeFilename);
    return form;
  }

  const response = await fetch(input.uri);
  if (!response.ok) {
    throw new Error(`Cannot read avatar URI (${response.status})`);
  }
  const blob = await response.blob();
  const ext = extFromUri(input.uri) ?? extFromMime(blob.type);
  const mime = blob.type || MIME_TYPES[ext] || 'image/jpeg';
  const filename = `avatar-${Date.now()}.${ext}`;
  const form = new FormData();
  const uploadFile =
    typeof File !== 'undefined'
      ? new File([blob], filename, { type: mime })
      : blob;
  form.append('avatar', uploadFile as any, filename);
  return form;
}

export async function uploadUserAvatar(input: AvatarUploadInput) {
  const form =
    Platform.OS === 'web'
      ? await buildWebFormData(input)
      : buildNativeFormData(input);

  const res = await api.post('/users/avatar', form, {
    headers:
      Platform.OS === 'web'
        ? undefined
        : { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
