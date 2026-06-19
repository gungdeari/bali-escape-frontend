// src/pages/PackageDetail.tsx
//
// Package detail page — shows full package info + reviews.
// Layout: full-width hero image → details grid → reviews section
//
// Key design decisions:
// - Hero image takes full width at top — like Airbnb/Booking.com
// - Details split into left (info) and right (price card) columns
// - Reviews use compact cards — less padding, more scannable
// - Sticky price card on desktop so it's always visible while scrolling

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  BarChart3,
  MapPin,
  CheckCircle,
  Star,
} from "lucide-react";
import Navbar from "../components/Navbar";
import ReviewSection from "../components/ReviewSection";
import { Button } from "../components/ui/button";
import { packagesApi, TravelPackage } from "../api/packagesApi";
import { useAuth } from "../contexts/AuthContext";

// ── difficulty badge color ────────────────────────────────────
function difficultyColor(level: string | null) {
  if (level === "easy")     return "bg-green-100 text-green-700";
  if (level === "moderate") return "bg-amber-100 text-amber-700";
  if (level === "hard")     return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

export default function PackageDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pkg, setPkg]               = useState<TravelPackage | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function loadPackage() {
      setLoading(true);
      setError(null);
      setSelectedImage(0);
      try {
        const res = await packagesApi.getOne(Number(id));
        setPkg(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Package not found.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadPackage();
  }, [id]);

  function handleBooking() {
    if (!isAuthenticated) {
      navigate("/login", { state: { message: "Please sign in to book this package." } });
      return;
    }
    navigate(`/bookings/new?packageId=${id}`);
  }

  // ── loading skeleton ─────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-72 bg-gray-200 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── error state ───────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Link to="/packages" className="text-sm text-[#17A2B8] hover:underline">
            Back to all packages
          </Link>
        </div>
      </div>
    );
  }

  if (!pkg) return null;

  // sort images — primary first
  const images = [...(pkg.images ?? [])].sort((a, b) => b.is_primary - a.is_primary);
  const currentImage = images[selectedImage];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO IMAGE ─────────────────────────────────────────
          Full width image at the top — maximum visual impact.
          Thumbnail strip below for switching images.
          This pattern is used by Airbnb, Booking.com, and Agoda.
      ────────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* main image — tall on mobile, shorter on desktop */}
        <div className="h-64 md:h-96 bg-gray-100 overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage.url}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#17A2B8]/10">
              <MapPin className="w-12 h-12 text-[#17A2B8]/30" />
            </div>
          )}
        </div>

        {/* back button overlaid on image */}
        <Link
          to="/packages"
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-sm bg-white/90 backdrop-blur-sm text-gray-700 hover:text-[#17A2B8] px-3 py-1.5 rounded-full shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* thumbnail strip — only if multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`
                  w-14 h-14 rounded-lg overflow-hidden border-2 transition-all
                  ${selectedImage === index
                    ? "border-white scale-110 shadow-lg"
                    : "border-white/50 opacity-70 hover:opacity-100"
                  }
                `}
              >
                <img
                  src={img.url}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────
          Two column layout on desktop:
          Left (2/3) — package info, description, reviews
          Right (1/3) — sticky price card
      ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="lg:col-span-2">

            {/* destination badge */}
            <span className="text-xs font-medium text-[#17A2B8] bg-[#17A2B8]/10 px-2.5 py-1 rounded-full">
              {pkg.destination}
            </span>

            {/* title */}
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-4 leading-tight">
              {pkg.title}
            </h1>

            {/* stats row — duration, people, difficulty */}
            <div className="flex flex-wrap gap-2 mb-5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                {pkg.duration_days} days
              </div>
              {pkg.max_people && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  Max {pkg.max_people} people
                </div>
              )}
              {pkg.difficulty_level && (
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full capitalize ${difficultyColor(pkg.difficulty_level)}`}>
                  <BarChart3 className="w-3.5 h-3.5" />
                  {pkg.difficulty_level}
                </div>
              )}
              {/* average rating badge — shows if reviews exist */}
              {pkg.average_rating && (
                <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full font-medium">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {pkg.average_rating}
                  {pkg.total_reviews && (
                    <span className="text-amber-500/70">
                      ({pkg.total_reviews})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* divider */}
            <div className="border-t border-gray-100 mb-5" />

            {/* description */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                About this package
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {pkg.description}
              </p>
            </div>

            {/* what's included */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                What's included
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Professional local guide",
                  "Hotel pickup and drop-off",
                  "Entrance fees",
                  "Light refreshments",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#17A2B8] flex-shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* price card — mobile only (hidden on desktop, shown in right column) */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
              <p className="text-xs text-gray-400 mb-0.5">Price per person</p>
              <p className="text-2xl font-bold text-gray-900 mb-3">
                Rp {Number(pkg.price).toLocaleString("id-ID")}
              </p>
              <Button
                onClick={handleBooking}
                className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium"
              >
                {isAuthenticated ? "Book now" : "Login to book"}
              </Button>
            </div>

            {/* divider before reviews */}
            <div className="border-t border-gray-100 pt-8">
              {/* ReviewSection manages its own data fetching
                  we just pass the packageId and it handles everything */}
              <ReviewSection packageId={Number(id)} />
            </div>

          </div>

          {/* ── RIGHT COLUMN — sticky price card ─────────────────
              sticky top-24 keeps the card visible while user scrolls
              through description and reviews.
              hidden on mobile — shown above reviews instead.
          ────────────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">

                {/* price */}
                <p className="text-xs text-gray-400 mb-0.5">Price per person</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  Rp {Number(pkg.price).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-400 mb-5">
                  {pkg.duration_days} days trip
                </p>

                {/* rating mini summary */}
                {pkg.average_rating && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {pkg.average_rating}
                    </span>
                    {pkg.total_reviews && (
                      <span className="text-xs text-gray-400">
                        · {pkg.total_reviews} {pkg.total_reviews === 1 ? "review" : "reviews"}
                      </span>
                    )}
                  </div>
                )}

                {/* book button */}
                <Button
                  onClick={handleBooking}
                  className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium"
                >
                  {isAuthenticated ? "Book now" : "Login to book"}
                </Button>

                {!isAuthenticated && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Sign in to make a booking
                  </p>
                )}

                {/* quick stats below button */}
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{pkg.duration_days} days</span>
                  </div>
                  {pkg.max_people && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Group size</span>
                      <span className="font-medium text-gray-900">Max {pkg.max_people}</span>
                    </div>
                  )}
                  {pkg.difficulty_level && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Difficulty</span>
                      <span className={`font-medium capitalize px-2 py-0.5 rounded-full text-xs ${difficultyColor(pkg.difficulty_level)}`}>
                        {pkg.difficulty_level}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}