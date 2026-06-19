import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  LogOut,
  Loader2,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { Booking } from "../../api/bookingsApi";
import { useAuth } from "../../contexts/AuthContext";

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-[#17A2B8]",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}


function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:              "bg-amber-100 text-amber-700",
    confirmed:            "bg-green-100 text-green-700",
    cancelled:            "bg-red-100 text-red-600",
    completed:            "bg-blue-100 text-blue-700",
    waiting_confirmation: "bg-purple-100 text-purple-700",
  };

  const label = status
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <span className={`
      text-xs font-medium px-2.5 py-1 rounded-full
      ${styles[status] ?? "bg-gray-100 text-gray-600"}
    `}>
      {label}
    </span>
  );
}

// ── AdminDashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await adminApi.getAllBookings();
        setBookings(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // ── derived stats ────────────────────────────────────────
  // calculated from bookings array — no extra API call needed
  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    // revenue — sum of all confirmed booking totals
    revenue:   bookings
      .filter(b => b.status === "confirmed")
      .reduce((sum, b) => sum + Number(b.total_price), 0),
    // needs action — bookings with payment waiting for confirmation
    needsAction: bookings.filter(b =>
      b.status === "pending" &&
      b.payment?.status === "waiting_confirmation"
    ).length,
  };

  // filter bookings by selected status tab
  const filtered = filterStatus === "all"
    ? bookings
    : filterStatus === "needs_action"
    ? bookings.filter(b => 
      b.status === "pending" &&
      b.payment?.status === "waiting_confirmation"
    )
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#17A2B8] flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              BaliEscape <span className="text-[#17A2B8]">Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── PAGE TITLE ───────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage bookings and confirm payments
          </p>
        </div>

        {/* ── STATS ROW ────────────────────────────────────────
            Five cards showing key numbers at a glance.
            All derived from the bookings array — no extra fetch.
        ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={ClipboardList}
            label="Total bookings"
            value={stats.total}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            accent="text-amber-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Confirmed"
            value={stats.confirmed}
            accent="text-green-500"
          />
          <StatCard
            icon={XCircle}
            label="Cancelled"
            value={stats.cancelled}
            accent="text-red-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={`Rp ${stats.revenue.toLocaleString("id-ID")}`}
            accent="text-[#17A2B8]"
          />
        </div>

        {/* needs action alert — only shows when there are payments to review */}
        {stats.needsAction > 0 && (
          <div
            onClick={() => setFilterStatus("needs_action")}
            className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900">
                  {stats.needsAction} payment{stats.needsAction > 1 ? "s" : ""} waiting for confirmation
                </p>
                <p className="text-xs text-purple-600">
                  Click to filter — review transfer proof and confirm
                </p>
              </div>
            </div>
            <span className="text-xs text-purple-600 font-medium">View →</span>
          </div>
        )}

        {/* ── FILTER TABS ──────────────────────────────────────
            Tab buttons that filter the bookings list below.
            Active tab highlighted with teal underline.
        ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl border border-gray-100 p-1 w-fit">
          {[
            { key: "all",          label: "All" },
            { key: "needs_action", label: `Needs action (${stats.needsAction})` },
            { key: "pending",      label: "Pending" },
            { key: "confirmed",    label: "Confirmed" },
            { key: "cancelled",    label: "Cancelled" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${filterStatus === tab.key
                  ? "bg-[#17A2B8] text-white"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BOOKINGS TABLE ───────────────────────────────────
            Shows all bookings with key info.
            Clicking a row navigates to the detail page.
        ────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#17A2B8] animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-center text-red-500 text-sm py-20">{error}</p>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
              <p className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Code
              </p>
              <p className="col-span-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Customer
              </p>
              <p className="col-span-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Package
              </p>
              <p className="col-span-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Total
              </p>
              <p className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Status
              </p>
              <p className="col-span-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Action
              </p>
            </div>

            {/* table rows */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No bookings found</p>
              </div>
            ) : (
              filtered.map(booking => (
                <div
                  key={booking.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-center"
                >
                  {/* booking code */}
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {booking.booking_code}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(booking.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short",
                      })}
                    </p>
                  </div>

                  {/* customer */}
                  <div className="col-span-3">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {booking.user?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {booking.user?.email}
                    </p>
                  </div>

                  {/* package */}
                  <div className="col-span-3">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      {booking.items[0]?.travel_package.title}
                    </p>
                  </div>

                  {/* total */}
                  <div className="col-span-1">
                    <p className="text-xs font-semibold text-gray-900">
                      Rp {Number(booking.total_price).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* status */}
                  <div className="col-span-2">
                    <StatusBadge status={booking.status} />
                    {/* show payment status below if waiting */}
                    {booking.payment?.status === "waiting_confirmation" && (
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        ● Proof uploaded
                      </p>
                    )}
                  </div>

                  {/* action link */}
                  <div className="col-span-1">
                    <Link
                      to={`/admin/bookings/${booking.id}`}
                      className="text-xs text-[#17A2B8] hover:underline font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}