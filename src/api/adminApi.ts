import API from "./axios";
import { Booking } from "./bookingsApi";

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

export const adminApi = {
  getAllBookings: () =>
    API.get<BookingsPaginatedResponse>("/admin/bookings"),

  getBooking: (id: number) =>
    API.get<BookingResponse>(`/admin/bookings/${id}`),

  updateBookingStatus: (id: number, status: "confirmed" | "cancelled") =>
    API.patch<BookingResponse>(`/admin/bookings/${id}/status`, { status }),
};