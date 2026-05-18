import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInvoices, deleteInvoice, getWhatsAppLink } from '../api/invoices';
import { useToast } from '../hooks/useToast';
import type { Facture } from '../types';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoiceEditForm from '../components/invoices/InvoiceEditForm'; // Ajouté
import CompanyHeader from '../components/common/CompanyHeader';
import PDFTemplate from '../components/invoices/PDFTemplateSimple';

function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // Ajouté
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null); // Ajouté
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  const { data: invoicesData, isLoading, isError, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => fetchInvoices(),
  });

  const invoices = invoicesData?.data || [];

  const filteredInvoices = invoices.filter((facture: Facture) => {
    const clientName = facture.client?.nom?.toLowerCase() || '';
    const invoiceId = `#${facture.id}`;
    const search = searchTerm.toLowerCase();
    return clientName.includes(search) || invoiceId.includes(search);
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      showSuccessToast('Facture supprimée avec succès !');
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  // Nouvelle fonction pour gérer la modification
  const handleEdit = (id: number) => {
    setSelectedInvoiceId(id);
    setShowEditForm(true);
    setShowForm(false); // Fermer le formulaire de création si ouvert
  };

  const handleWhatsApp = async (id: number) => {
    try {
      const { whatsapp_url } = await getWhatsAppLink(id);
      window.open(whatsapp_url, '_blank');
    } catch (err) {
      showErrorToast('Erreur lors de l\'envoi WhatsApp');
    }
  };

  const handlePdf = async (facture: Facture) => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.id = 'temp-pdf-container';
      document.body.appendChild(tempDiv);

      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempDiv);
      root.render(<PDFTemplate facture={facture} />);

      await new Promise(resolve => setTimeout(resolve, 500));

      const { generatePDF } = await import('../utils/generatePDF');
      await generatePDF('pdf-content', `facture_${facture.id}.pdf`);

      root.unmount();
      document.body.removeChild(tempDiv);
      
      showSuccessToast('PDF généré avec succès !');
    } catch (err) {
      console.error('Erreur PDF:', err);
      showErrorToast('Erreur lors de la génération du PDF');
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Chargement des factures...</div>;
  }

  if (isError) {
    return <div className="text-center p-4 text-red-500">Erreur: {(error as any)?.message}</div>;
  }

  const getStatusBadge = (facture: Facture) => {
    if (facture.statut_paiement === 'PAYE') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Payé</span>;
    }
    if (facture.statut_paiement === 'PARTIEL') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Partiel</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Non payé</span>;
  };

  const formatFCFA = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };

  return (
    <div className="container mx-auto p-6">
      <CompanyHeader title="GESTION DES FACTURES" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Liste des factures</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par client ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setShowEditForm(false); // Fermer l'édition si ouverte
              setSelectedInvoiceId(null);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Fermer' : 'Nouvelle facture'}
          </button>
        </div>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="mb-8">
          <CompanyHeader title="NOUVELLE FACTURE" />
          <InvoiceForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Formulaire de modification */}
      {showEditForm && selectedInvoiceId && (
        <div className="mb-8">
          <CompanyHeader title="MODIFIER LA FACTURE" />
          <InvoiceEditForm
            invoiceId={selectedInvoiceId}
            onSuccess={() => {
              setShowEditForm(false);
              setSelectedInvoiceId(null);
            }}
            onCancel={() => {
              setShowEditForm(false);
              setSelectedInvoiceId(null);
            }}
          />
        </div>
      )}

      {/* Tableau des factures */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Payé</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Reste</th>
                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison</th>
                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Aucune facture ne correspond à votre recherche' : 'Aucune facture trouvée'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((facture: Facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{facture.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {facture.client?.nom || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatFCFA(facture.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                      {formatFCFA(facture.montant_paye)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                      {formatFCFA(facture.reste_a_payer)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(facture)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${facture.statut_livraison === 'LIVRE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {facture.statut_livraison === 'LIVRE' ? 'Livré' : 'Non livré'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {facture.created_at ? new Date(facture.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        {/* Nouveau bouton Modifier */}
                        <button
                          onClick={() => handleEdit(facture.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Modifier"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handlePdf(facture)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Télécharger PDF"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleWhatsApp(facture.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Envoyer WhatsApp"
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
                              deleteMutation.mutate(facture.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          Suppr
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InvoicesPage;