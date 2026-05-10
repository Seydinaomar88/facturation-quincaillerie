import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInvoices } from '../api/invoices';
import type { Facture } from '../types';
import CompanyHeader from '../components/common/CompanyHeader';

function DebtsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: invoicesData, isLoading, isError, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => fetchInvoices(),
  });

  const allInvoices = invoicesData?.data || [];

  // Filtrer les factures avec dette (reste à payer > 0)
  const debtInvoices = allInvoices.filter(
    (invoice: Facture) => invoice.reste_a_payer > 0
  );

  // Trier par montant restant (du plus grand au plus petit)
  const sortedDebts = [...debtInvoices].sort((a, b) => b.reste_a_payer - a.reste_a_payer);

  // Filtrer par recherche
  const filteredInvoices = sortedDebts.filter((invoice: Facture) =>
    invoice.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toString().includes(searchTerm)
  );

  const formatFCFA = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };

  const getDebtStatusBadge = (statutPaiement: string) => {
    if (statutPaiement === 'PARTIEL') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Paiement partiel</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Dette totale</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Erreur: {(error as any)?.message}
      </div>
    );
  }

  // Calcul des totaux
  const totalMontantTotal = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalMontantPaye = filteredInvoices.reduce((sum, inv) => sum + inv.montant_paye, 0);
  const totalDette = filteredInvoices.reduce((sum, inv) => sum + inv.reste_a_payer, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <CompanyHeader title="GESTION DES DETTES" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cartes récapitulatives */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Nombre de débiteurs</p>
            <p className="text-2xl font-bold text-gray-800">{filteredInvoices.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Montant total des factures</p>
            <p className="text-2xl font-bold text-gray-800">{formatFCFA(totalMontantTotal)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Déjà payé</p>
            <p className="text-2xl font-bold text-purple-600">{formatFCFA(totalMontantPaye)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Dette totale</p>
            <p className="text-2xl font-bold text-red-600">{formatFCFA(totalDette)}</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par client ou numéro de facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tableau des dettes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payé</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dette restante</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type dette</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Aucune dette trouvée
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice: Facture) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">#{invoice.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {invoice.client?.nom || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {invoice.client?.telephone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {formatFCFA(invoice.total)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 text-right">
                        {formatFCFA(invoice.montant_paye)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right font-bold">
                        {formatFCFA(invoice.reste_a_payer)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getDebtStatusBadge(invoice.statut_paiement)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé des dettes */}
        {filteredInvoices.length > 0 && (
          <div className="mt-4 bg-red-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Montant total des dettes :</span>
              <span className="text-xl font-bold text-red-600">{formatFCFA(totalDette)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-red-200">
              <span className="text-sm font-medium text-gray-700">Nombre de clients débiteurs :</span>
              <span className="text-lg font-bold text-gray-800">{filteredInvoices.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebtsPage;