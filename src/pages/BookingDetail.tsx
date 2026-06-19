import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  BarChart3,
  Package,
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { bookingsApi, Booking } from "../api/bookingsApi";
import API from "../api/axios";


function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// BookingDetail
export default function BookingDetail() {

  const { id }   = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await bookingsApi.getOne(Number(id));
        setBooking(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Booking not found.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#17A2B8] animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-red-500 text-sm mb-4">
            {error ?? "Booking not found."}
          </p>
          <Link to="/bookings" className="text-sm text-[#17A2B8] hover:underline">
            Back to my bookings
          </Link>
        </div>
      </div>
    );
  }

  const firstItem = booking.items[0];

  const hasPaymentProof = 
    booking.status === "pending" &&
    booking.payment?.status === "waiting_confirmation";

  const isConfirmed = booking.status === "confirmed";

  const isCancelled = booking.status === "cancelled";

  const isPendingNoProof = 
    booking.status === "pending" && 
    !booking.payment;

  const displayStatus = (() => {
    if (isConfirmed) return {
      label: "Confirmed",
      style: "bg-green-100 text-green-700",
      icon:  <CheckCircle className="w-3 h-3" />,
    };
    if (isCancelled) return {
      label: "Cancelled",
      style: "bg-red-100 text-red-600",
      icon:  <XCircle className="w-3 h-3" />,
    };
    if (hasPaymentProof) return {
      label: "Waiting confirmation",
      style: "bg-purple-100 text-purple-700",
      icon:  <Clock className="w-3 h-3" />,
    };
    return {
      label: "Pending payment",
      style: "bg-amber-100 text-amber-700",
      icon:  <Clock className="w-3 h-3" />,
    };
  })();

  const bookedDate = new Date(booking.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const expiryDate = new Date(booking.expired_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  function formatPaymentMethod(method: string) {
    return method
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  async function handleInvoiceDownload() {
    if (!booking?.payment?.id) return;
    setDownloadingInvoice(true);

    try {
      const response = await API.get(
        `/user/payments/${booking.payment.id}/invoice`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url  = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    } catch (err) {
      console.error("Failed to download invoice:", err);
    } finally {
      setDownloadingInvoice(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#17A2B8] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
            Back to my bookings
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 mb-1">Booking code</p>
              <p className="text-xl font-bold text-gray-900 tracking-wide">
                {booking.booking_code}
              </p>
            </div>

            <span className={`
              inline-flex items-center gap-1.5 text-xs font-medium
              px-3 py-1.5 rounded-full flex-shrink-0
              ${displayStatus.style}
            `}>
              {displayStatus.icon}
              {displayStatus.label}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-3">Booked on {bookedDate}</p>

          <div className="space-y-3">
            {/* Pending */}
            {isPendingNoProof && firstItem && (
              <div className="p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-700">
                  Complete payment before {expiryDate}
                </p>
              </div>
            )}

            {/* Waiting */}
            {hasPaymentProof &&(
              <div className="p-3 bg-purple-50 rounded-xl my-2">
                <p className="text-xs text-purple-700">
                  Transfer proof submitted — we'll confirm within 1×24 hours
                </p>
              </div>
            )}

            {/* Cancelled */}
            {isCancelled && (
              <div className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-center">
                <p className="text-sm text-red-600 font-medium">
                  Booking cancelled
                </p>
                <p className="text-xs text-red-400 mt-1">
                  This booking was cancelled.
                  {firstItem && (
                    <> You can <Link
                      to={`/packages/${firstItem.travel_package.id}`}
                      className="underline hover:text-red-600"
                    > book again</Link> if you wish.</>
                  )}
                </p>
              </div>
            )}

            {/* Confirmed */}
            {isConfirmed && booking.payment?.id && (
              <button
                onClick={handleInvoiceDownload}
                disabled={downloadingInvoice}
                className="w-full h-11 rounded-xl border border-[#17A2B8] text-[#17A2B8] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#17A2B8]/5 transition-colors disabled:opacity-50"
              >
                {downloadingInvoice
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FileText className="w-4 h-4" />
                }
                {downloadingInvoice ? "Preparing invoice..." : "Download invoice"}
              </button>
            )}

            {isConfirmed && (
              <Link to="/packages">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl text-sm border-gray-200 text-gray-600 hover:border-[#17A2B8] hover:text-[#17A2B8] my-1"
                >
                  Browse more packages
                </Button>
              </Link>
            )}
          </div>
        </div>

        {firstItem && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#17A2B8]/10 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-[#17A2B8]" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Package details
              </p>
            </div>

            <h2 className="font-bold text-gray-900 text-lg mb-2 leading-snug">
              {firstItem.travel_package.title}
            </h2>

            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {firstItem.travel_package.description}
            </p>

        
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                {firstItem.travel_package.duration_days} days
              </span>
              {firstItem.travel_package.max_people && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  Max {firstItem.travel_package.max_people} people
                </span>
              )}
              {firstItem.travel_package.difficulty_level && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full capitalize">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {firstItem.travel_package.difficulty_level}
                </span>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <InfoRow
                label="Price per person"
                value={`Rp ${Number(firstItem.price).toLocaleString("id-ID")}`}
              />
              <InfoRow
                label="People"
                value={`× ${firstItem.quantity}`}
              />
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-[#17A2B8]">
                  Rp {Number(booking.total_price).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        )}

        {booking.payment && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#17A2B8]/10 flex items-center justify-center">
                {booking.payment.payment_method === "bank_transfer"
                  ? <CreditCard className="w-3.5 h-3.5 text-[#17A2B8]" />
                  : <Smartphone className="w-3.5 h-3.5 text-[#17A2B8]" />
                }
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Payment details
              </p>
            </div>

            <InfoRow
              label="Payment method"
              value={formatPaymentMethod(booking.payment.payment_method)}
            />
            <InfoRow
              label="Payment status"
              value={(() => {
                if (booking.status === "cancelled") {
                  return (
                    <span className="font-medium text-red-500">
                      Payment rejected
                    </span>
                  );
                }

                const statusStyles: Record<string, string> = {
                  paid:                 "text-green-600",
                  waiting_confirmation: "text-purple-600",
                  pending:              "text-amber-600",
                  failed:               "text-red-500",
                  refunded:             "text-gray-500",
                };

                const statusLabels: Record<string, string> = {
                  paid:                 "Payment verified",
                  waiting_confirmation: "Waiting confirmation",
                  pending:              "Pending",
                  failed:               "Payment failed",
                  refunded:             "Refunded",
                };

                const style = statusStyles[booking.payment.status] ?? "text-gray-600";
                const label = statusLabels[booking.payment.status]
                  ?? booking.payment.status.split("_").map(
                      (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
                    ).join(" ");

                return (
                  <span className={`font-medium ${style}`}>
                    {label}
                  </span>
                );
              })()}
            />

            {booking.payment.paid_at && (
              <InfoRow
                label="Confirmed on"
                value={new Date(booking.payment.paid_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              />
            )}

            {booking.payment.proof_of_payment && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Your transfer proof</p>
                <img
                  src={booking.payment.proof_of_payment}
                  alt="Transfer proof"
                  className="w-full max-h-48 object-contain rounded-xl border border-gray-100"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">

          {isPendingNoProof && firstItem && (
            <Button
              onClick={() => navigate(
                `/bookings/new?packageId=${firstItem.travel_package.id}`
              )}
              className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium"
            >
              Complete payment
            </Button>
          )}

          {hasPaymentProof && (
            <div className="w-full h-11 rounded-xl border border-purple-200 bg-purple-50 flex items-center justify-center my-2">
              <p className="text-xs text-purple-600 font-medium">
                Waiting for admin confirmation
              </p>
            </div>
          )}

          {isConfirmed && booking.payment?.id && (
            <button
              onClick={handleInvoiceDownload}
              disabled={downloadingInvoice}
              className="w-full h-11 rounded-xl border border-[#17A2B8] text-[#17A2B8] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#17A2B8]/5 transition-colors disabled:opacity-50"
            >
              {downloadingInvoice
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <FileText className="w-4 h-4" />
              }
              {downloadingInvoice ? "Preparing invoice..." : "Download invoice"}
            </button>
          )}

          {isCancelled && firstItem && (
            <Link to={`/packages/${firstItem.travel_package.id}`}>
              <Button className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium">
                Book this package again
              </Button>
            </Link>
          )}

          <Link to="/bookings">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl text-sm border-gray-200 text-gray-600 hover:border-[#17A2B8] hover:text-[#17A2B8] my-2"
            >
              Back to my bookings
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}