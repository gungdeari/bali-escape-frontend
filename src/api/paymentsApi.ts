import API from "./axios";

export type Payment = {
  id: number;
  booking_id: number;
  payment_method: "bank_transfer" | "ewallet";
  amount: string;
  status: "pending" | "waiting_confirmation" | "paid" | "failed" | "refunded";
  proof_of_payment: string | null; 
  paid_at: string | null;
  created_at: string;
};

type PaymentResponse = {
  success: boolean;
  message: string;
  data: Payment;
};

export const paymentsApi = {
  create: (formData: FormData) =>
    API.post<PaymentResponse>("/user/payments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getAll: () => API.get("/user/payments"),
};