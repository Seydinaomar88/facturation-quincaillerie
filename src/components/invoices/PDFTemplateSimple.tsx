import type { Facture } from '../../types';

interface PDFTemplateProps {
  facture: Facture;
}

export default function PDFTemplate({ facture }: PDFTemplateProps) {
  const formatFCFA = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };

  // Vérifier les statuts
  const isDelivered = facture.statut_livraison === 'LIVRE';
  const isPaid = facture.statut_paiement === 'PAYE';
  const isPartiallyPaid = facture.statut_paiement === 'PARTIEL';

  return (
    <div id="pdf-content" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      background: 'white', 
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #e5e7eb',
      padding: '20px',
      position: 'relative'
    }}>
      
      {/* EN-TÊTE DE LA FACTURE - Exactement comme sur l'image */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        backgroundColor: '#1e3a5f',
        color: 'white',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
          QUINCAILLERIE LE SALOUM
        </h1>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          SOPE NABY - CISSE & FRERES
        </h2>
        <p style={{ fontSize: '13px', margin: '5px 0', opacity: 0.9 }}>
          En face Pont de l'Aéroport à 200m
        </p>
        <p style={{ fontSize: '13px', margin: '5px 0', opacity: 0.9 }}>
          Tél. : 77 643 58 15 / 77 894 07 77 / 76 343 19 33
        </p>
      </div>

      {/* CACHE PAIEMENT PARTIEL - Pour les factures partiellement payées */}
      {isPartiallyPaid && !isPaid && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#1e3a5f',
            color: '#ffffff',
            padding: '5px 25px',
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            border: '1px solid #1e3a5f',
            borderRadius: '3px',
            fontFamily: 'Arial, sans-serif'
          }}>
            PAIEMENT PARTIEL
          </div>
        </div>
      )}

      {/* CACHE LIVRÉ - UNIQUEMENT pour les factures livrées */}
      {isDelivered && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#77a9ec',
            padding: '8px 30px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '1px solid #77a9ec',
            borderRadius: '3px',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            QUINCAILLERIE LE SALOUM<br />
            SOPE NABY - CISSE & FRERES<br />
            En face Pont de l'Aéroport à 200m<br />
            Tél. : 77 643 58 15 / 77 894 07 77 / 76 343 19 33<br />
            PAYE LIVRÉ
          </div>
        </div>
      )}

      {/* LIGNE DATE ET FACTURE */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        padding: '10px 0',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Date : </span>
          <span>{new Date(facture.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>FACTURE N° : </span>
          <span>{String(facture.id).padStart(6, '0')}</span>
        </div>
      </div>

      {/* INFOS CLIENT */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px',
        background: '#f9fafb',
        borderRadius: '4px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>Client : </span>
            <span>{facture.client?.nom || 'N/A'}</span>
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Tel : </span>
            <span>{facture.client?.telephone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* TABLEAU DES PRODUITS */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        marginBottom: '20px',
        border: '1px solid #000'
      }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #000' }}>
            <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderRight: '1px solid #000', width: '15%' }}>Qté</th>
            <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderRight: '1px solid #000', width: '45%' }}>Désignation</th>
            <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderRight: '1px solid #000', width: '20%' }}>P. Unit.</th>
            <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>P. TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {facture.details && facture.details.length > 0 ? (
            facture.details.map((detail, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>{detail.quantite}</td>
                <td style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>{detail.nom_produit}</td>
                <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>{formatFCFA(detail.prix_unitaire)}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatFCFA(detail.quantite * detail.prix_unitaire)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>Aucun produit</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MONTANT TOTAL */}
      <div style={{ 
        textAlign: 'right', 
        marginTop: '10px',
        padding: '12px',
        background: '#f9fafb',
        borderRadius: '4px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          MONTANT TOTAL : {formatFCFA(facture.total)}
        </div>
        {facture.montant_paye > 0 && (
          <div style={{ fontSize: '13px', marginTop: '4px', color: '#16a34a' }}>
            Dont acompte : {formatFCFA(facture.montant_paye)}
          </div>
        )}
        {facture.reste_a_payer > 0 && (
          <div style={{ fontSize: '13px', marginTop: '4px', color: '#dc2626' }}>
            Reste à payer : {formatFCFA(facture.reste_a_payer)}
          </div>
        )}
      </div>

      {/* PIED DE PAGE */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        fontSize: '10px', 
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '10px'
      }}>
        <p style={{ margin: '0' }}>Merci de votre visite et à bientôt !</p>
        <p style={{ marginTop: '3px' }}>Quincaillerie Le Saloum - Sope Naby Cisse & Freres</p>
      </div>
    </div>
  );
}