// Types pour correspondre au backend Laravel
export interface Client {
  id: number;
  nom: string;
  telephone: string;
  created_at?: string;
  updated_at?: string;
}

export interface DetailFacture {
  id: number;
  facture_id: number;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

export interface Facture {
  id: number;
  client_id: number;
  quincaillerie_id: number;
  total: number;
  montant_paye: number;
  reste_a_payer: number;
  statut: 'DETTE' | 'SOLDE';
  statut_paiement: 'NON_PAYE' | 'PARTIEL' | 'PAYE';
  statut_livraison: 'LIVRE' | 'NON_LIVRE';
  created_at: string;
  updated_at: string;
  client?: Client;
  details?: DetailFacture[];
}

export interface CreateFacturePayload {
  client_id: number;
  montant_paye: number;
  statut_livraison?: 'LIVRE' | 'NON_LIVRE';
  produits: {
    nom_produit: string;
    quantite: number;
    prix_unitaire: number;
  }[];
}

export interface UpdateFacturePayload extends Partial<CreateFacturePayload> {}

export interface Quincaillerie {
  id: number;
  nom: string;
  adresse: string | null;
  telephone: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  quincaillerie_id: number;
  quincaillerie?: Quincaillerie;
}

// Pour la compatibilité avec l'ancien code
export type Invoice = Facture;
export type CreateInvoicePayload = CreateFacturePayload;
export type UpdateInvoicePayload = UpdateFacturePayload;