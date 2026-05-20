import axios from 'axios';
import { Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import {
  API_BASE_URL,
  createApiUnavailableError,
  isApiConnectivityError,
  isApiMarkedUnavailable,
  markApiBackendUnavailable,
} from './api-connectivity';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (isApiMarkedUnavailable()) {
    throw createApiUnavailableError();
  }

  let token = useAuthStore.getState().token;

  if (!token && Platform.OS === 'web') {
    token = localStorage.getItem('token');
    if (token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        useAuthStore.setState({
          token,
          user: JSON.parse(userStr),
        });
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let handling401 = false;

const goToLogin = async () => {
  const state = useAuthStore.getState();
  if (state.token) await state.logout();
  router.replace('/auth/login');
};

const promptReLogin = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    goToLogin();
    return;
  }
  Alert.alert(
    'Phiên đăng nhập hết hạn',
    'Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.',
    [{ text: 'Đăng nhập lại', onPress: goToLogin }],
    { cancelable: false }
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isApiConnectivityError(error)) {
      markApiBackendUnavailable();
    }

    const status = error?.response?.status;
    if (status === 401 && !handling401) {
      handling401 = true;
      try {
        promptReLogin();
      } finally {
        setTimeout(() => { handling401 = false; }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
