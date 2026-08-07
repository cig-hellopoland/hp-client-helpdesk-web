import axios from 'axios';
import config from 'config';

const httpClient = axios.create(config.public.axios);

export const requestPasswordReset = email => httpClient.post('/password-reset', { email });

export const confirmPasswordReset = (token, newPassword) => (
  httpClient.post('/password-reset/confirm', { token, newPassword })
);
