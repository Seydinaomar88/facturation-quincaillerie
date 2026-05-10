// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { z } from 'zod';
// import { paymentSchema } from '../../schemas/invoiceSchema';
// import { payInvoice } from '../../api/invoices';
// import { useToast } from '../../hooks/useToast';

// interface PaymentFormProps {
//   invoiceId: string;
//   onSuccess?: () => void;
//   onCancel?: () => void;
// }

// type PaymentFormInputs = z.infer<typeof paymentSchema>;

// export default function PaymentForm({ invoiceId, onSuccess, onCancel }: PaymentFormProps) {
//   const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PaymentFormInputs>({
//     resolver: zodResolver(paymentSchema),
//   });

//   const queryClient = useQueryClient();
//   const { showSuccessToast, showErrorToast } = useToast();

//   const mutation = useMutation<any, Error, { id: string; amount: number }>({
//     mutationFn: payInvoice,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['invoices'] });
//       queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
//       onSuccess?.();
//       reset();
//       showSuccessToast('Paiement enregistré avec succès !');
//     },
//     onError: (err: Error) => {
//       showErrorToast(`Erreur lors de l'enregistrement du paiement : ${err.message}`);
//     },
//   });

//   const onSubmit = (data: PaymentFormInputs) => {
//     mutation.mutate({ id: invoiceId, amount: data.amount });
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div>
//           <label htmlFor="payment_amount" className="block text-sm font-medium text-gray-700">Montant du Paiement (€)</label>
//           <input
//             type="number"
//             id="payment_amount"
//             step="0.01"
//             {...register("amount", { valueAsNumber: true })}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
//           />
//           {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
//         </div>
//         <div className="flex justify-end space-x-2">
//           {onCancel && (
//             <button
//               type="button"
//               onClick={onCancel}
//               className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             >
//               Annuler
//             </button>
//           )}
//           <button
//             type="submit"
//             disabled={isSubmitting || mutation.isPending}
//             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isSubmitting || mutation.isPending ? 'Enregistrement...' : 'Enregistrer Paiement'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }