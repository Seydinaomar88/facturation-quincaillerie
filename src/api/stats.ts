import axios from 'axios';
import type { Facture } from '../types';

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

export interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paidCount: number;
  partiallyPaidCount: number;
  pendingCount: number;
  deliveredCount: number;
  notDeliveredCount: number;
  recentInvoices: Facture[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/factures');
    const invoices: Facture[] = response.data.data || [];
    
    const stats = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      paidAmount: invoices.reduce((sum, inv) => sum + (inv.montant_paye || 0), 0),
      pendingAmount: invoices.reduce((sum, inv) => sum + (inv.reste_a_payer || 0), 0),
      paidCount: invoices.filter(inv => inv.statut_paiement === 'PAYE').length,
      partiallyPaidCount: invoices.filter(inv => inv.statut_paiement === 'PARTIEL').length,
      pendingCount: invoices.filter(inv => inv.statut_paiement === 'NON_PAYE').length,
      deliveredCount: invoices.filter(inv => inv.statut_livraison === 'LIVRE').length,
      notDeliveredCount: invoices.filter(inv => inv.statut_livraison === 'NON_LIVRE').length,
      recentInvoices: invoices.slice(0, 5),
    };
    
    return stats;
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    return {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      paidCount: 0,
      partiallyPaidCount: 0,
      pendingCount: 0,
      deliveredCount: 0,
      notDeliveredCount: 0,
      recentInvoices: [],
    };
  }
};