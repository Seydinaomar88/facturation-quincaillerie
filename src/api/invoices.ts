import axios from 'axios';
import type { Facture, CreateFacturePayload, UpdateFacturePayload } from '../types';

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

// Récupérer toutes les factures (avec pagination)
export const fetchInvoices = async (params?: any): Promise<{ data: Facture[]; current_page: number; total: number }> => {
  const response = await api.get('/factures', { params });
  return response.data;
};

// Récupérer une facture par ID
export const fetchInvoiceById = async (id: number): Promise<Facture> => {
  const response = await api.get(`/factures/${id}`);
  return response.data;
};

// Créer une facture
export const createInvoice = async (invoiceData: CreateFacturePayload): Promise<Facture> => {
  const response = await api.post('/factures', invoiceData);
  return response.data.facture;
};

// Mettre à jour une facture (si votre backend le permet)
export const updateInvoice = async ({ id, ...invoiceData }: { id: number } & UpdateFacturePayload): Promise<Facture> => {
  const response = await api.put(`/factures/${id}`, invoiceData);
  return response.data;
};

// Supprimer une facture
export const deleteInvoice = async (id: number): Promise<void> => {
  await api.delete(`/factures/${id}`);
};

// Générer PDF
export const generateInvoicePdf = async (id: number): Promise<Blob> => {
  const response = await api.get(`/factures/${id}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

// Obtenir lien WhatsApp
export const getWhatsAppLink = async (id: number): Promise<{ whatsapp_url: string }> => {
  const response = await api.get(`/factures/${id}/whatsapp`);
  return response.data;
};

export default api;