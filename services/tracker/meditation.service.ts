import api from '../core/api';
import {
  isApiBackendAvailable,
  isApiConnectivityError,
} from '../core/api-connectivity';

export interface MeditationSound {
  id: string;
  name: string;
  description: string;
  url: string;
  fileSizeMB: number;
  durationSec: number;
}

export interface MeditationSessionInput {
  soundId: string;
  targetMin: number;
  actualMin: number;
  startedAt: string; // ISO
  completedAt: string; // ISO
}

export interface MeditationSession {
  id: string;
  soundId: string;
  targetMin: number;
  actualMin: number;
  completed: boolean;
  startedAt: string;
  completedAt: string;
}

export interface MeditationToday {
  totalMinutes: number;
  goalMin: number;
  isFirstTime: boolean;
  sessions: MeditationSession[];
}

const FALLBACK_MEDITATION_SOUNDS: MeditationSound[] = [
  {
    id: 'rain',
    name: 'Mưa nhẹ',
    description: 'Tiếng mưa đều, phù hợp để thả lỏng và bắt đầu chậm lại.',
    url: 'https://res.cloudinary.com/dgdnlyfs2/video/upload/v1777266182/universfield-relaxing-rain-387677_lgvvht.mp3',
    fileSizeMB: 0,
    durationSec: 0,
  },
  {
    id: 'ocean',
    name: 'Sóng biển',
    description: 'Âm thanh đại dương dịu, giúp ổn định nhịp thở.',
    url: 'https://res.cloudinary.com/dgdnlyfs2/video/upload/v1777266184/natureseye-ocean-currents-meditation-161684_mgo0ic.mp3',
    fileSizeMB: 0,
    durationSec: 0,
  },
  {
    id: 'forest',
    name: 'Rừng yên',
    description: 'Tiếng chim và không gian rừng nhẹ cho phiên thiền ngắn.',
    url: 'https://res.cloudinary.com/dgdnlyfs2/video/upload/v1777266765/zehendrew-birds-chirping-calm-173695_utmrqw.mp3',
    fileSizeMB: 0,
    durationSec: 0,
  },
  {
    id: 'white_noise',
    name: 'Nhiễu trắng',
    description: 'Nền âm đều để giảm xao nhãng khi tập trung.',
    url: 'https://res.cloudinary.com/dgdnlyfs2/video/upload/v1777266607/purebinaural-purebinaural-40-hz-gamma-binaural-beats-with-white-noise-484861_osqkve.mp3',
    fileSizeMB: 0,
    durationSec: 0,
  },
  {
    id: 'ambient_pad',
    name: 'Ambient pad',
    description: 'Nền âm mềm, sáng và tối giản cho lúc thư giãn.',
    url: 'https://res.cloudinary.com/dgdnlyfs2/video/upload/v1777266667/freesound_community-angelic-pad-loopwav-14643_rgldjs.mp3',
    fileSizeMB: 0,
    durationSec: 0,
  },
  {
    id: 'bowl',
    name: 'Chuông thiền',
    description: 'Tiếng chuông ngân ngắn để mở đầu hoặc kết thúc phiên.',
    url: 'https://res.cloudinary.com/dgdnlyfs2/video/upload/v1777266843/freesound_community-singing-bell-hit-2-75258_ouvhby.mp3',
    fileSizeMB: 0,
    durationSec: 0,
  },
];

export async function fetchSounds(): Promise<MeditationSound[]> {
  try {
    if (!(await isApiBackendAvailable())) return FALLBACK_MEDITATION_SOUNDS;
    const res = await api.get('/meditation/sounds');
    const items = Array.isArray(res.data?.items) ? res.data.items : [];
    return items.length > 0 ? items : FALLBACK_MEDITATION_SOUNDS;
  } catch (e) {
    if (!isApiConnectivityError(e)) {
      console.warn('meditation.fetchSounds failed, using fallback catalog:', e);
    }
    return FALLBACK_MEDITATION_SOUNDS;
  }
}

export async function createSession(input: MeditationSessionInput): Promise<MeditationSession> {
  const res = await api.post('/meditation/sessions', input);
  return res.data;
}

export async function fetchToday(localDate: string): Promise<MeditationToday | null> {
  try {
    if (!(await isApiBackendAvailable())) return null;
    const res = await api.get('/meditation/today', { params: { localDate } });
    return res.data;
  } catch (e) {
    if (!isApiConnectivityError(e)) {
      console.warn('meditation.fetchToday failed:', e);
    }
    return null;
  }
}
