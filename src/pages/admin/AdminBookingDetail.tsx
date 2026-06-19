// src/pages/admin/AdminBookingDetail.tsx
//
// Admin view of one booking.
// Key feature: shows the payment proof image and confirm/cancel buttons.
// Admin clicks "Confirm payment" → PATCH /admin/bookings/:id/status
// → booking becomes "confirmed", payment becomes "paid"

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  User,
  CreditCard,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { adminApi } from "../../api/adminApi";
import { Booking } from "../../api/bookingsApi";

// ── InfoRow ───────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ── AdminBookingDetail ────────────────────────────────────────
export default function AdminBookingDetail() {
  const { id } = useParams();

  const [booking, setBooking]     = useState<Booking | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await adminApi.getBooking(Number(id));
        setBooking(res.data.data);
      } catch (err: any) {
        setError("Booking not found.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadBooking();
  }, [id]);

  // confirm payment — sets booking to confirmed, payment to paid
  async function handleConfirm() {
    if (!booking) return;
    setConfirming(true);
    try {
      await adminApi.updateBookingStatus(booking.id, "confirmed");
  
      // reload the full booking instead of using the patch response
      // because the patch response doesn't include all relationships
      const res = await adminApi.getBooking(booking.id);
      setBooking(res.data.data);
  
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to confirm.");
    } finally {
      setConfirming(false);
    }
  }

  // cancel booking
  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    try {
      await adminApi.updateBookingStatus(booking.id, "cancelled");
  
      // same — reload full booking
      const res = await adminApi.getBooking(booking.id);
      setBooking(res.data.data);
  
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to cancel.");
    } finally {
      setCancelling(false);
    }
  }

  // ── loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#17A2B8] animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Link to="/admin" className="text-sm text-[#17A2B8] hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const firstItem     = booking.items[0];
  const needsAction   = booking.payment?.status === "waiting_confirmation" && booking.status === "pending";
  const isConfirmed   = booking.status === "confirmed";
  const isCancelled   = booking.status === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* simple admin header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#17A2B8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-medium">
            {booking.booking_code}
          </span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── ACTION BANNER ─────────────────────────────────────
            Only shows when payment needs confirmation.
            Most prominent element on the page — admin can't miss it.
        ────────────────────────────────────────────────────── */}
        {needsAction && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold text-purple-900 mb-1">
              Payment proof uploaded — action required
            </p>
            <p className="text-xs text-purple-600 mb-4">
              Review the transfer proof below, then confirm or cancel this booking.
            </p>

            {error && (
              <p className="text-red-500 text-xs mb-3 bg-red-50 p-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              {/* confirm button */}
              <Button
                onClick={handleConfirm}
                disabled={confirming || cancelling}
                className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium"
              >
                {confirming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Confirm payment
                  </span>
                )}
              </Button>

              {/* cancel button */}
              <Button
                onClick={handleCancel}
                disabled={confirming || cancelling}
                variant="outline"
                className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium"
              >
                {cancelling ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancelling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Cancel booking
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* confirmed success banner */}
        {isConfirmed && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              Booking confirmed — payment verified
            </p>
          </div>
        )}

        {/* cancelled banner */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">
              Booking cancelled
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              This booking has been cancelled. No further action required.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── LEFT COLUMN ───────────────────────────────── */}
          <div className="space-y-4">

            {/* customer info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#17A2B8]/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#17A2B8]" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Customer</p>
              </div>
              <InfoRow label="Name"  value={booking.user?.name} />
              <InfoRow label="Email" value={booking.user?.email} />
            </div>

            {/* package info */}
            {firstItem && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#17A2B8]/10 flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-[#17A2B8]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Package</p>
                </div>
                <InfoRow
                  label="Title"
                  value={firstItem.travel_package.title}
                />
                <InfoRow
                  label="Quantity"
                  value={`${firstItem.quantity} person`}
                />
                <InfoRow
                  label="Subtotal"
                  value={`Rp ${Number(firstItem.subtotal).toLocaleString("id-ID")}`}
                />
                <InfoRow
                  label="Total"
                  value={
                    <span className="font-bold text-[#17A2B8]">
                      Rp {Number(booking.total_price).toLocaleString("id-ID")}
                    </span>
                  }
                />
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────── */}
          <div className="space-y-4">

            {/* payment info */}
            {booking.payment && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#17A2B8]/10 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-[#17A2B8]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Payment</p>
                </div>
                <InfoRow
                  label="Method"
                  value={booking.payment.payment_method
                    .split("_")
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                />
                <InfoRow
                  label="Amount"
                  value={`Rp ${Number(booking.payment.amount).toLocaleString("id-ID")}`}
                />
                <InfoRow
                  label="Status"
                  value={
                    <span className={`font-medium capitalize ${
                      booking.payment.status === "paid"
                        ? "text-green-600"
                        : "text-purple-600"
                    }`}>
                      {booking.payment.status.split("_").join(" ")}
                    </span>
                  }
                />

                {/* proof of payment image
                    this is the main thing admin needs to see
                    click image to open full size in new tab */}
                {booking.payment.proof_of_payment && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">
                      Transfer proof
                    </p>
                    <a
                      href={booking.payment.proof_of_payment}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={booking.payment.proof_of_payment}
                        alt="Transfer proof"
                        className="w-full rounded-xl border border-gray-100 object-contain max-h-64 hover:opacity-90 transition-opacity cursor-zoom-in"
                      />
                      <p className="text-xs text-center text-gray-400 mt-1">
                        Click to open full size
                      </p>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* booking meta */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">
                Booking info
              </p>
              <InfoRow label="Code"    value={booking.booking_code} />
              <InfoRow label="Status"  value={booking.status} />
              <InfoRow
                label="Created"
                value={new Date(booking.created_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              />
              <InfoRow
                label="Expires"
                value={new Date(booking.expired_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}