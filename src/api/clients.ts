import axios from 'axios';
import type { Client } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://facturation-617f.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Récupérer tous les clients
export const fetchClients = async (): Promise<Client[]> => {
  const response = await api.get('/clients');
  return response.data;
};

// Créer un client
export const createClient = async (clientData: { nom: string; telephone: string }): Promise<Client> => {
  const response = await api.post('/clients', clientData);
  return response.data.client;
};