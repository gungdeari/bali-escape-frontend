import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  CreditCard,
  Smartphone,
  Clock,
  Loader2,
  Upload,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { packagesApi, TravelPackage } from "../api/packagesApi";
import { bookingsApi, Booking } from "../api/bookingsApi";
import { paymentsApi } from "../api/paymentsApi";


type Step = "form" | "payment" | "success";
type PaymentMethod = "bank_transfer" | "ewallet";

export default function BookingNew() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const packageId      = searchParams.get("packageId");
  const [pkg, setPkg]               = useState<TravelPackage | null>(null);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [pkgError, setPkgError]     = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [proofFile, setProofFile]         = useState<File | null>(null);
  const [proofPreview, setProofPreview]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Fetch package 
  useEffect(() => {
    if (!packageId) {
      navigate("/packages");
      return;
    }

    async function loadPackage() {
      try {
        const res = await packagesApi.getOne(Number(packageId));
        setPkg(res.data.data);
      } catch {
        setPkgError("Package not found.");
      } finally {
        setPkgLoading(false);
      }
    }

    loadPackage();
  }, [packageId, navigate]);

  const pricePerPerson = Number(pkg?.price ?? 0);
  const totalPrice     = pricePerPerson * quantity;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFile(file);

    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleBookingSubmit() {
    if (!pkg) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await bookingsApi.create({
        items: [{
          travel_package_id: pkg.id,
          quantity:          quantity,
        }],
      });

      setBooking(res.data.data);

      setStep("payment");

    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaymentSubmit() {
    if (!booking) return;

    if (paymentMethod === "bank_transfer" && !proofFile) {
      setError("Please upload your transfer proof before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("booking_id",     String(booking.id));
      formData.append("payment_method", paymentMethod);

      if (proofFile) {
        formData.append("proof_of_payment", proofFile);
      }

      await paymentsApi.create(formData);

      setStep("success");

    } catch (err: any) {
      setError(err.response?.data?.message ?? "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (pkgLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#17A2B8] animate-spin" />
        </div>
      </div>
    );
  }

  if (pkgError || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-red-500 text-sm mb-4">{pkgError}</p>
          <Link to="/packages" className="text-sm text-[#17A2B8] hover:underline">
            Back to packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-8">

        {step === "form" && (
          <Link
            to={`/packages/${packageId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#17A2B8] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to package
          </Link>
        )}

        {step !== "success" && (
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-[#17A2B8]" />
            <div className={`flex-1 h-px transition-colors ${
              step === "payment" ? "bg-[#17A2B8]" : "bg-gray-200"
            }`} />
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
              step === "payment" ? "bg-[#17A2B8]" : "bg-gray-200"
            }`} />

            <div className="sr-only">
              {step === "form" ? "Step 1: Booking details" : "Step 2: Payment"}
            </div>
          </div>
        )}

        {step !== "success" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
              You are booking
            </p>
            <h2 className="font-semibold text-gray-900 mb-3">{pkg.title}</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {pkg.duration_days} days
              </span>
              {pkg.max_people && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Max {pkg.max_people} people
                </span>
              )}
            </div>
          </div>
        )}

        {step === "form" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Booking details</h3>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Number of people
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#17A2B8] hover:text-[#17A2B8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                >
                  −
                </button>

                <span className="w-12 text-center font-semibold text-gray-900 text-lg">
                  {quantity}
                </span>

                
                <button
                  onClick={() => setQuantity(q =>
                    pkg.max_people ? Math.min(pkg.max_people, q + 1) : q + 1
                  )}
                  disabled={!!pkg.max_people && quantity >= pkg.max_people}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#17A2B8] hover:text-[#17A2B8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                >
                  +
                </button>

                {pkg.max_people && (
                  <span className="text-xs text-gray-400">
                    max {pkg.max_people}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price per person</span>
                <span className="text-gray-700">
                  Rp {pricePerPerson.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">People</span>
                <span className="text-gray-700">× {quantity}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-[#17A2B8] text-lg">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">
                {error}
              </p>
            )}

            <Button
              onClick={handleBookingSubmit}
              disabled={submitting}
              className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating booking...
                </span>
              ) : (
                "Confirm booking"
              )}
            </Button>
          </div>
        )}

        {step === "payment" && booking && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Payment</h3>
            <p className="text-xs text-gray-400 mb-5">
              Booking {booking.booking_code} · Total Rp {Number(booking.total_price).toLocaleString("id-ID")}
            </p>

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Payment method
              </label>

              <div className="space-y-3">

                <button
                  onClick={() => {
                    setPaymentMethod("bank_transfer");
                    setProofFile(null);
                    setProofPreview(null);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left
                    ${paymentMethod === "bank_transfer"
                      ? "border-[#17A2B8] bg-[#17A2B8]/5"
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  {/* custom radio dot */}
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${paymentMethod === "bank_transfer" ? "border-[#17A2B8]" : "border-gray-300"}
                  `}>
                    {paymentMethod === "bank_transfer" && (
                      <div className="w-2 h-2 rounded-full bg-[#17A2B8]" />
                    )}
                  </div>
                  <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                    <p className="text-xs text-gray-400">BCA · Mandiri · BNI · BRI</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod("ewallet");
                    setProofFile(null);
                    setProofPreview(null);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left
                    ${paymentMethod === "ewallet"
                      ? "border-[#17A2B8] bg-[#17A2B8]/5"
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${paymentMethod === "ewallet" ? "border-[#17A2B8]" : "border-gray-300"}
                  `}>
                    {paymentMethod === "ewallet" && (
                      <div className="w-2 h-2 rounded-full bg-[#17A2B8]" />
                    )}
                  </div>
                  <Smartphone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">E-Wallet</p>
                    <p className="text-xs text-gray-400">GoPay · OVO · Dana · ShopeePay</p>
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod === "bank_transfer" && (
              <div className="mb-5">

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-blue-800 mb-3 uppercase tracking-wide">
                    Transfer to this account
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Bank</span>
                      <span className="font-semibold text-blue-900">BCA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Account number</span>
                      <span className="font-bold text-blue-900 tracking-wider">
                        1234 5678 90
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Account name</span>
                      <span className="font-semibold text-blue-900">BaliEscape Travel</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                      <span className="text-sm text-blue-600">Transfer amount</span>
                      <span className="text-sm font-bold text-blue-900">
                        Rp {Number(booking.total_price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="block mb-1">
                  <span className="text-sm font-medium text-gray-700 block mb-2">
                    Upload transfer proof <span className="text-red-400">*</span>
                  </span>

                  <div className={`
                    border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                    ${proofPreview
                      ? "border-[#17A2B8] bg-[#17A2B8]/5"
                      : "border-gray-200 hover:border-[#17A2B8] hover:bg-gray-50"
                    }
                  `}>
                    {proofPreview ? (
                      <img
                        src={proofPreview}
                        alt="Transfer proof preview"
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                    ) : (
                      <div className="py-2">
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-0.5">
                          Click to upload transfer proof
                        </p>
                        <p className="text-xs text-gray-400">
                          JPEG or PNG, max 2MB
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {proofFile && (
                  <p className="text-xs text-[#17A2B8] mt-2 flex items-center gap-1">
                    ✓ {proofFile.name}
                  </p>
                )}
              </div>
            )}

            {paymentMethod === "ewallet" && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-amber-800 mb-1">
                  E-Wallet payment
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  After submitting, please transfer Rp {Number(booking.total_price).toLocaleString("id-ID")} to our GoPay/OVO number{" "}
                  <span className="font-bold">+62 812 3456 7890</span> and use your booking code{" "}
                  <span className="font-bold">{booking.booking_code}</span> as the payment note.
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">
                {error}
              </p>
            )}

            <Button
              onClick={handlePaymentSubmit}
              disabled={submitting}
              className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting payment...
                </span>
              ) : (
                `Submit payment — Rp ${Number(booking.total_price).toLocaleString("id-ID")}`
              )}
            </Button>
          </div>
        )}

        {step === "success" && booking && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">

            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Payment submitted!
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              We've received your payment proof
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Our team will verify and confirm your booking within 1×24 hours
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">Your booking code</p>
              <p className="text-xl font-bold text-[#17A2B8] tracking-wider">
                {booking.booking_code}
              </p>
            </div>

            <div className="text-left space-y-2.5 mb-6 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Package</span>
                <span className="font-medium text-gray-900 text-right max-w-xs line-clamp-1">
                  {pkg.title}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">People</span>
                <span className="font-medium text-gray-900">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">
                  Rp {Number(booking.total_price).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {paymentMethod.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-amber-600">
                  Waiting confirmation
                </span>
              </div>
            </div>

            <div className="space-y-3 mx-2">
              <Link to="/bookings">
                <Button className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium">
                  View my bookings
                </Button>
              </Link>
              <Link to="/packages">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl text-sm border-gray-200 text-gray-600 hover:border-[#17A2B8] hover:text-[#17A2B8]"
                >
                  Browse more packages
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}