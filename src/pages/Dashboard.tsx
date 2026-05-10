import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, type DashboardStats } from '../api/stats';
import InvoicesPage from './Invoices';
import ClientsManager from '../components/clients/ClientsManager';
import PartialPaymentsPage from './PartialPayments';
import DebtsPage from './Debts';

function Dashboard() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'clients' | 'partials' | 'debts'>('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatFCFA = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'invoices',
      label: 'Factures',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'partials',
      label: 'Paiements partiels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'debts',
      label: 'Dettes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  // Version Mobile avec Bottom Navigation
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header Mobile */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {activeTab === 'dashboard' && 'Tableau de bord'}
                  {activeTab === 'invoices' && 'Factures'}
                  {activeTab === 'clients' && 'Clients'}
                  {activeTab === 'partials' && 'Paiements partiels'}
                  {activeTab === 'debts' && 'Dettes'}
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  Bienvenue, {user?.name?.split(' ')[0] || 'Utilisateur'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content Mobile */}
        <main className="p-4">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Cartes de statistiques */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-gray-500 text-xs">Total Factures</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statsLoading ? '...' : stats?.totalInvoices || 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-gray-500 text-xs">Montant Total</p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {statsLoading ? '...' : formatFCFA(stats?.totalAmount || 0)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-gray-500 text-xs">Montant Payé</p>
                  <p className="text-sm font-bold text-green-600 truncate">
                    {statsLoading ? '...' : formatFCFA(stats?.paidAmount || 0)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-gray-500 text-xs">Montant Restant</p>
                  <p className="text-sm font-bold text-red-600 truncate">
                    {statsLoading ? '...' : formatFCFA(stats?.pendingAmount || 0)}
                  </p>
                </div>
              </div>

              {/* Factures récentes simplifiées */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-800">📋 Factures récentes</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {statsLoading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Chargement...</div>
                  ) : stats && stats.recentInvoices && stats.recentInvoices.length > 0 ? (
                    stats.recentInvoices.slice(0, 5).map((invoice: any) => (
                      <div key={invoice.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{invoice.client?.nom}</p>
                            <p className="text-xs text-gray-500">{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-sm">{formatFCFA(invoice.total)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              invoice.statut_paiement === 'PAYE' ? 'bg-green-100 text-green-700' :
                              invoice.statut_paiement === 'PARTIEL' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {invoice.statut_paiement === 'PAYE' ? 'Payé' : invoice.statut_paiement === 'PARTIEL' ? 'Partiel' : 'Non payé'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">Aucune facture</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && <InvoicesPage />}
          {activeTab === 'clients' && <ClientsManager />}
          {activeTab === 'partials' && <PartialPaymentsPage />}
          {activeTab === 'debts' && <DebtsPage />}
        </main>

        {/* Bottom Navigation Bar - Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
          <div className="flex justify-around items-center py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className={`${activeTab === item.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <span className={`text-xs font-medium ${
                  activeTab === item.id ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // Version Desktop avec Sidebar
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar fixe - largeur 280px */}
      <aside className="w-72 bg-blue-600 shadow-xl flex flex-col fixed h-full">
        {/* Logo */}
        <div className="flex items-center justify-center p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-xl">Le Saloum</span>
              <p className="text-white/60 text-xs">Quincaillerie</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                activeTab === item.id
                  ? 'bg-white/20 text-white border-r-4 border-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Sidebar - Informations de contact */}
        <div className="p-4 border-t border-white/20">
          <div className="bg-white/10 rounded-xl p-4">
            {/* Profil utilisateur */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/20">
              <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-white/60 text-xs truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white"
                title="Déconnexion"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            
            {/* Informations de la quincaillerie */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">Sope Naby Cisse et Frere</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>77 894 07 77 / 77 643 58 15</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>lesaloum@quincaillerie.sn</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Desktop */}
      <div className="flex-1 ml-72">
        {/* Header Desktop */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeTab === 'dashboard' && 'Tableau de bord'}
                  {activeTab === 'invoices' && 'Factures'}
                  {activeTab === 'clients' && 'Clients'}
                  {activeTab === 'partials' && 'Paiements partiels'}
                  {activeTab === 'debts' && 'Dettes'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {activeTab === 'dashboard' && 'Vue d\'ensemble de votre activité'}
                  {activeTab === 'invoices' && 'Gérez toutes vos factures'}
                  {activeTab === 'clients' && 'Gérez votre carnet de clients'}
                  {activeTab === 'partials' && 'Suivez les paiements partiels'}
                  {activeTab === 'debts' && 'Gérez les dettes clients'}
                </p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Content Desktop */}
        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Cartes de statistiques Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Factures</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">
                        {statsLoading ? '...' : stats?.totalInvoices || 0}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Montant Total</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {statsLoading ? '...' : formatFCFA(stats?.totalAmount || 0)}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Montant Payé</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {statsLoading ? '...' : formatFCFA(stats?.paidAmount || 0)}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Montant Restant</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {statsLoading ? '...' : formatFCFA(stats?.pendingAmount || 0)}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Factures récentes Desktop */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800">📋 Factures récentes</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payé</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reste</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {statsLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chargement...</td>
                        </tr>
                      ) : stats && stats.recentInvoices && stats.recentInvoices.length > 0 ? (
                        stats.recentInvoices.map((invoice: any) => (
                          <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-sm text-gray-900">{invoice.client?.nom}</td>
                            <td className="px-6 py-3 text-sm text-gray-900 text-right">{formatFCFA(invoice.total)}</td>
                            <td className="px-6 py-3 text-sm text-green-600 text-right">{formatFCFA(invoice.montant_paye)}</td>
                            <td className="px-6 py-3 text-sm text-red-600 text-right">{formatFCFA(invoice.reste_a_payer)}</td>
                            <td className="px-6 py-3 text-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                invoice.statut_paiement === 'PAYE' ? 'bg-green-100 text-green-700' :
                                invoice.statut_paiement === 'PARTIEL' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {invoice.statut_paiement === 'PAYE' ? 'Payé' : invoice.statut_paiement === 'PARTIEL' ? 'Partiel' : 'Non payé'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500 text-center">
                              {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune facture trouvée</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && <InvoicesPage />}
          {activeTab === 'clients' && <ClientsManager />}
          {activeTab === 'partials' && <PartialPaymentsPage />}
          {activeTab === 'debts' && <DebtsPage />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;