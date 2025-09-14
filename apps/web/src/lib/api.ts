import axios from 'axios';
import { cache } from 'react';
import { QueryClient } from '@tanstack/react-query';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
});

export const getQueryClient = cache(() => new QueryClient())
