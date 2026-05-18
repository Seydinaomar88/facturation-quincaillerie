// src/components/invoices/InvoiceEditForm.tsx
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '../../hooks/useToast';
import { updateInvoice, fetchInvoiceById } from '../../api/invoices';
import { fetchClients } from '../../api/clients';

interface InvoiceEditFormProps {
  invoiceId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Schéma de validation
const invoiceFormSchema = z.object({
  client_id: z.number().min(1, "Le client est obligatoire"),
  montant_paye: z.number().min(0, "Le montant payé doit être positif"),
  statut_livraison: z.enum(['LIVRE', 'NON_LIVRE']).optional(),
  produits: z.array(z.object({
    nom_produit: z.string().min(1, "Le nom du produit est obligatoire"),
    quantite: z.number().min(1, "La quantité doit être supérieure à 0"),
    prix_unitaire: z.number().min(1, "Le prix unitaire doit être supérieur à 0"),
  })).min(1, "Ajoutez au moins un produit"),
});

type InvoiceFormInputs = z.infer<typeof invoiceFormSchema>;

export default function InvoiceEditForm({ invoiceId, onSuccess, onCancel }: InvoiceEditFormProps) {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  // Récupérer les clients
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { register, control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<InvoiceFormInputs>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      produits: [{ nom_produit: '', quantite: 1, prix_unitaire: 0 }],
      montant_paye: 0,
      statut_livraison: 'NON_LIVRE',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "produits",
  });

  // Charger les données de la facture
  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        console.log('Chargement de la facture ID:', invoiceId);
        const facture = await fetchInvoiceById(invoiceId);
        
        console.log('Facture chargée:', facture);
        
        // Réinitialiser le formulaire avec les données
        const formData = {
          client_id: facture.client_id,
          montant_paye: facture.montant_paye,
          statut_livraison: facture.statut_livraison || 'NON_LIVRE',
          produits: facture.details && facture.details.length > 0 
            ? facture.details.map((detail: any) => ({
                nom_produit: detail.nom_produit,
                quantite: detail.quantite,
                prix_unitaire: detail.prix_unitaire
              }))
            : [{ nom_produit: '', quantite: 1, prix_unitaire: 0 }]
        };
        
        reset(formData);
        setInitialized(true);
        setLoading(false);
        
      } catch (error) {
        console.error('Erreur chargement:', error);
        showErrorToast('Erreur lors du chargement de la facture');
        setLoading(false);
        onCancel();
      }
    };
    
    loadInvoice();
  }, [invoiceId, reset, showErrorToast, onCancel]);

  // Calculer le total
  const produits = watch("produits");
  
  useEffect(() => {
    if (produits && produits.length > 0) {
      const newTotal = produits.reduce((sum, produit) => {
        const qte = produit?.quantite || 0;
        const prix = produit?.prix_unitaire || 0;
        return sum + (qte * prix);
      }, 0);
      setTotal(newTotal);
    }
  }, [produits]);

  // Vérifier si le montant payé ne dépasse pas le total
  const montantPaye = watch("montant_paye");
  const montantPayeError = montantPaye > total ? "Le montant payé ne peut pas dépasser le total" : null;

  const updateMutation = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      showSuccessToast('Facture modifiée avec succès !');
      onSuccess();
    },
    onError: (err: any) => {
      console.error('Erreur mutation:', err);
      showErrorToast(err.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const onSubmit = (data: InvoiceFormInputs) => {
    if (data.montant_paye > total) {
      showErrorToast('Le montant payé ne peut pas dépasser le total de la facture');
      return;
    }
    updateMutation.mutate({ id: invoiceId, ...data });
  };

  if (loading || !initialized) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
          <p>Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Modifier la facture #{invoiceId}</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Sélection client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
          <select
            {...register("client_id", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Sélectionner un client</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nom} - {client.telephone}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="text-red-500 text-xs mt-1">{errors.client_id.message}</p>
          )}
        </div>

        {/* Produits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Produits</label>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="border p-3 rounded-lg">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <input
                      {...register(`produits.${index}.nom_produit`)}
                      placeholder="Nom du produit"
                      className="w-full border rounded p-1 text-sm"
                    />
                    {errors.produits?.[index]?.nom_produit && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.produits[index]?.nom_produit?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      {...register(`produits.${index}.quantite`, { valueAsNumber: true })}
                      placeholder="Qté"
                      className="w-full border rounded p-1 text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      {...register(`produits.${index}.prix_unitaire`, { valueAsNumber: true })}
                      placeholder="Prix unit."
                      className="w-full border rounded p-1 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 text-sm w-full hover:text-red-700"
                      disabled={fields.length === 1}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append({ nom_produit: '', quantite: 1, prix_unitaire: 0 })}
            className="mt-2 text-indigo-600 text-sm hover:text-indigo-800"
          >
            + Ajouter un produit
          </button>
        </div>

        {/* Total */}
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium">
            Total: <span className="text-lg font-bold">{total.toLocaleString()} FCFA</span>
          </p>
        </div>

        {/* Montant payé */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Montant payé (FCFA)</label>
          <input
            type="number"
            {...register("montant_paye", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {(errors.montant_paye || montantPayeError) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.montant_paye?.message || montantPayeError}
            </p>
          )}
        </div>

        {/* Statut livraison */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Statut livraison</label>
          <select
            {...register("statut_livraison")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="NON_LIVRE">Non livré</option>
            <option value="LIVRE">Livré</option>
          </select>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending || !!montantPayeError}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Modification...' : 'Modifier la facture'}
          </button>
        </div>
      </form>
    </div>
  );
}