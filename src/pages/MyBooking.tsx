import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Package,
  ArrowRight,
  Loader2,
  ClipboardList,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { bookingsApi, Booking } from "../api/bookingsApi";

// // ── StatusBadge ───────────────────────────────────────────────
// // Small pill that shows the booking status with a matching color.
// // Defined outside MyBookings because it's a pure display component
// // with no state — it just takes a status and returns colored text.
// function StatusBadge({ status }: { status: Booking["status"] }) {

//   // map each status to a Tailwind color combination
//   const styles = {
//     pending:   "bg-amber-100 text-amber-700",
//     confirmed: "bg-green-100 text-green-700",
//     cancelled: "bg-red-100  text-red-600",
//   };

//   return (
//     <span className={`
//       text-xs font-medium px-2.5 py-1 rounded-full capitalize
//       ${styles[status] ?? "bg-gray-100 text-gray-600"}
//     `}>
//       {status}
//     </span>
//   );
// }

function BookingCard({ booking }: { booking: Booking }) {
  const firstItem = booking.items[0];
  const extraItems = booking.items.length - 1;

  const formattedDate = new Date(booking.created_at).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );

  const formattedExpiry = new Date(booking.expired_at).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit" }
  );

  function getDisplayStatus(): { label: string; style: string } {
    if (booking.status === "confirmed") {
      return { label: "Confirmed",   style: "bg-green-100 text-green-700" };
    }
    if (booking.status === "cancelled") {
      return { label: "Cancelled",   style: "bg-red-100 text-red-600" };
    }
    if (booking.payment?.status === "waiting_confirmation") {
      return { label: "Waiting confirmation", style: "bg-purple-100 text-purple-700" };
    }
    return { label: "Pending payment", style: "bg-amber-100 text-amber-700" };
  }

  const displayStatus = getDisplayStatus();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Booking code</p>
          <p className="font-bold text-gray-900 tracking-wide text-sm">
            {booking.booking_code}
          </p>
        </div>

        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${displayStatus.style}`}>
          {displayStatus.label}
        </span>
      </div>

      {firstItem && (
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#17A2B8]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="w-4 h-4 text-[#17A2B8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                {firstItem.travel_package.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {firstItem.quantity} {firstItem.quantity === 1 ? "person" : "people"}
                {" · "}
                {firstItem.travel_package.duration_days} days
              </p>
            </div>
          </div>

          {extraItems > 0 && (
            <p className="text-xs text-gray-400 mt-2 ml-12">
              + {extraItems} more {extraItems === 1 ? "package" : "packages"}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-gray-50 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
          <p className="font-bold text-gray-900 text-sm">
            Rp {Number(booking.total_price).toLocaleString("id-ID")}
          </p>
        </div>

        {booking.status === "pending" && !booking.payment && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-3">
            Complete payment before {formattedExpiry}
          </p>
        )}

        {booking.payment?.status === "waiting_confirmation" && (
          <p className="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg mb-3">
            Proof submitted — we'll confirm within 1×24 hours
          </p>
        )}

        <Link
          to={`/bookings/${booking.id}`}
          className="flex items-center justify-between text-sm text-[#17A2B8] font-medium hover:underline"
        >
          View details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function MyBookings() {

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await bookingsApi.getAll();

        setBookings(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <span className="text-xs font-semibold text-[#17A2B8] bg-[#17A2B8]/10 px-3 py-1.5 rounded-full uppercase tracking-wide">
            My bookings
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            Your trips
          </h1>
          <p className="text-gray-500 text-sm">
            {loading
              ? "Loading your bookings..."
              : `${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} found`
            }
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#17A2B8] animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[#17A2B8] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-20">

            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-gray-300" />
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              You haven't booked any trips yet. Start exploring Bali's best packages.
            </p>

            <Link to="/packages">
              <Button className="h-11 px-6 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium">
                Browse packages
              </Button>
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}