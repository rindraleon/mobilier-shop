import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsApi, type PaymentQuery } from "../lib/api/payments.api";
import { queryKeys } from "../lib/query/keys";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";
import type { SubmitPaymentInput } from "../types/api";

export function usePaymentProviders(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.providers,
    queryFn: () => paymentsApi.providers(),
    enabled,
    staleTime: 10 * 60_000,
  });
}

export function useOrderPayment(orderId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.forOrder(orderId ?? ""),
    queryFn: () => paymentsApi.forOrder(orderId as string),
    enabled: Boolean(orderId) && enabled,
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: SubmitPaymentInput;
    }) => paymentsApi.submitForOrder(orderId, input, crypto.randomUUID()),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.forOrder(payment.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(payment.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast("Référence envoyée. Un administrateur vérifie votre paiement.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/* ------------------------------- Admin ------------------------------- */

export function useAdminPayments(query: PaymentQuery = {}) {
  return useQuery({
    queryKey: queryKeys.payments.admin(query),
    queryFn: () => paymentsApi.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => paymentsApi.verify(id),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(payment.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard("30d") });
      toast("Paiement vérifié. La commande est passée au statut « Payée ».");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      paymentsApi.reject(id, reason),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(payment.orderId) });
      toast("Paiement rejeté.", "warning");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}
