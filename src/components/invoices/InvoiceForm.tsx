import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '../../hooks/useToast';
import { createInvoice } from '../../api/invoices';  // Supprimé fetchInvoiceById et updateInvoice
import { fetchClients } from '../../api/clients';
// Supprimé l'import de Facture car non utilisé

interface InvoiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Schéma de validation adapté au backend
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

export default function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [total, setTotal] = useState(0);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  // Récupérer les clients
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<InvoiceFormInputs>({
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

  // Calculer le total
  const produits = watch("produits");
  
  useEffect(() => {
    const newTotal = produits.reduce((sum, produit) => {
      return sum + (produit.quantite || 0) * (produit.prix_unitaire || 0);
    }, 0);
    setTotal(newTotal);
  }, [produits]);

  // Vérifier si le montant payé ne dépasse pas le total
  const montantPaye = watch("montant_paye");
  const montantPayeError = montantPaye > total ? "Le montant payé ne peut pas dépasser le total" : null;

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      onSuccess?.();
      showSuccessToast('Facture créée avec succès !');
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const onSubmit = (data: InvoiceFormInputs) => {
    // Vérifier que le montant payé ne dépasse pas le total
    if (data.montant_paye > total) {
      showErrorToast('Le montant payé ne peut pas dépasser le total de la facture');
      return;
    }
    createMutation.mutate(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Sélection client */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select
            {...register("client_id", { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Sélectionner un client</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>{client.nom} - {client.telephone}</option>
            ))}
          </select>
          {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id.message}</p>}
        </div>

        {/* Produits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Produits</label>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="border p-3 rounded-lg space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <input
                      {...register(`produits.${index}.nom_produit`)}
                      placeholder="Nom du produit"
                      className="w-full border rounded p-1 text-sm"
                    />
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
                      className="text-red-500 text-sm w-full"
                    >
                      Suppr
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append({ nom_produit: '', quantite: 1, prix_unitaire: 0 })}
            className="mt-2 text-indigo-600 text-sm"
          >
            + Ajouter un produit
          </button>
        </div>

        {/* Total */}
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium">Total: <span className="text-lg font-bold">{total.toLocaleString()} FCFA</span></p>
        </div>

        {/* Montant payé */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Montant payé (FCFA)</label>
          <input
            type="number"
            {...register("montant_paye", { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {(errors.montant_paye || montantPayeError) && (
            <p className="text-red-500 text-xs mt-1">{errors.montant_paye?.message || montantPayeError}</p>
          )}
        </div>

        {/* Statut livraison */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Statut livraison</label>
          <select {...register("statut_livraison")} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="NON_LIVRE">Non livré</option>
            <option value="LIVRE">Livré</option>
          </select>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending || !!montantPayeError}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Création...' : 'Créer la facture'}
          </button>
        </div>
      </form>
    </div>
  );
}