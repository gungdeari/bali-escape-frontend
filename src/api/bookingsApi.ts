import API from "./axios";

export type BookingUser = {
  id: number;
  name: string;
  email: string;
};

export type BookingPayment = {
  id: number;
  payment_method: "bank_transfer" | "ewallet";
  amount: string;
  status: "pending" | "waiting_confirmation" | "paid" | "failed" | "refunded";
  proof_of_payment: string | null;
  paid_at: string | null;
  created_at: string;
};

export type BookingPackage = {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: string;
  duration_days: number;
  max_people: number | null;
  difficulty_level: string | null;
};

export type BookingItem = {
  travel_package: BookingPackage;
  quantity: number;
  price: string;
  subtotal: string;
};

export type Booking = {
  id: number;
  booking_code: string;
  total_price: string;
  status: "pending" | "confirmed" | "cancelled";
  expired_at: string;
  items: BookingItem[];
  user?: BookingUser;
  payment?: BookingPayment;
  created_at: string;
};

type BookingsPaginatedResponse = {
  success: boolean;
  message: string;
  data: Booking[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

type BookingResponse = {
  success: boolean;
  message: string;
  data: Booking;
};

export type CreateBookingPayload = {
  items: {
    travel_package_id: number;
    quantity: number;
  }[];
};

export const bookingsApi = {
  getAll: () => API.get<BookingsPaginatedResponse>("/user/bookings"),
  getOne: (id: number) => API.get<BookingResponse>(`/user/bookings/${id}`),
  create: (payload: CreateBookingPayload) =>
    API.post<BookingResponse>("/user/bookings", payload),
};