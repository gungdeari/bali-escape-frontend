// src/components/ReviewSection.tsx
//
// Complete reviews section for a package detail page.
// Manages its own data — fetches reviews independently from the package.
//
// Three sub-sections:
//   1. RatingSummary  — average + star distribution
//   2. ReviewForm     — write a review (logged-in users only)
//   3. ReviewList     — list of all reviews
//
// Optimistic update pattern:
//   When user submits a review, we add it to the local list immediately
//   before the API confirms. This makes the UI feel instant.
//   If the API fails, we remove it and show an error.

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { reviewsApi, Review, ReviewsData } from "../api/reviewsApi";
import StarRating from "./StarRating";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

// ── RatingSummary ─────────────────────────────────────────────
// Shows the average rating and star distribution bar.
// Purely display — receives data via props, no state of its own.
function RatingSummary({ data }: { data: ReviewsData }) {

  // calculate how many reviews have each star rating (1-5)
  // reduce() collapses the array into a count object
  // e.g. { 5: 3, 4: 2, 3: 0, 2: 0, 1: 0 }
  const distribution = data.reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] ?? 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="flex items-start gap-8 p-6 bg-gray-50 rounded-2xl mb-6">

      {/* left — big average number */}
      <div className="text-center flex-shrink-0">
        <p className="text-5xl font-bold text-gray-900 leading-none mb-1">
          {data.average_rating ?? "—"}
        </p>
        <StarRating
          value={data.average_rating ?? 0}
          readonly
          size="sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          {data.total_reviews} {data.total_reviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* right — star distribution bars */}
      <div className="flex-1 space-y-1.5">
        {/* render bars from 5 stars down to 1 */}
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0;

          // percentage width of the bar
          // if no reviews, width is 0%
          const percentage = data.total_reviews > 0
            ? (count / data.total_reviews) * 100
            : 0;

          return (
            <div key={star} className="flex items-center gap-2">
              {/* star number */}
              <span className="text-xs text-gray-500 w-3 text-right">
                {star}
              </span>

              {/* star icon */}
              <svg className="w-3 h-3 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {/* progress bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* count */}
              <span className="text-xs text-gray-400 w-4 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ReviewCard ────────────────────────────────────────────────
// Displays one review.
// Shows a delete button only if the review belongs to the current user.
function ReviewCard({
  review,
  currentUserId,
  onDelete,
}: {
  review: Review;
  currentUserId: number | undefined;
  onDelete: (reviewId: number) => void;
}) {

  // check if this review belongs to the logged-in user
  const isOwner = currentUserId === review.user.id;

  // format the date — "26 April 2026"
  const formattedDate = new Date(review.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

      {/* top row — user name + date + delete button */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* user avatar initial + name */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#17A2B8]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#17A2B8]">
                {review.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {review.user.name}
            </p>
          </div>
          <p className="text-xs text-gray-400 ml-9">{formattedDate}</p>
        </div>

        {/* delete button — only visible to the review owner */}
        {isOwner && (
          <button
            onClick={() => onDelete(review.id)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
            title="Delete your review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* star rating */}
      <div className="mb-2 ml-9">
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      {/* comment — only render if it exists */}
      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed ml-9">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ── ReviewForm ────────────────────────────────────────────────
// Form for writing a new review.
// Only shown to logged-in users who haven't reviewed yet.
function ReviewForm({
  packageId,
  onSubmitted,
}: {
  packageId: number;
  onSubmitted: (review: Review) => void;  // called with new review on success
}) {

  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // validate rating is selected
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await reviewsApi.create(packageId, {
        rating,
        comment: comment.trim() || undefined,
      });

      // call parent with the new review
      // parent will add it to the list (optimistic update)
      onSubmitted(res.data.data);

      // reset form
      setRating(0);
      setComment("");

    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Write a review
      </h3>

      <form onSubmit={handleSubmit}>

        {/* star picker — interactive StarRating */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 block mb-2">
            Your rating
          </label>
          <StarRating
            value={rating}
            onChange={setRating}  // updates rating state on click
            size="lg"
          />
        </div>

        {/* comment textarea */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 block mb-2">
            Your review (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this package..."
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#17A2B8] focus:ring-1 focus:ring-[#17A2B8]"
          />
          {/* character counter */}
          <p className="text-xs text-gray-400 text-right mt-1">
            {comment.length}/1000
          </p>
        </div>

        {/* error message */}
        {error && (
          <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* submit button */}
        <Button
          type="submit"
          disabled={submitting || rating === 0}
          className="h-10 px-6 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit review"
          )}
        </Button>
      </form>
    </div>
  );
}

// ── ReviewSection ─────────────────────────────────────────────
// Main component — fetches data and composes the three sub-sections.
// Exported and used in PackageDetail.tsx.
export default function ReviewSection({ packageId }: { packageId: number }) {

  const { user, isAuthenticated } = useAuth();

  // reviews data state
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // check if the current user has already reviewed this package
  // derived from reviewsData — recalculates when reviews change
  const userHasReviewed = reviewsData?.reviews.some(
    (r) => r.user.id === user?.id
  ) ?? false;

  // fetch reviews when component mounts
  // or when packageId changes (navigating between packages)
  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      setError(null);

      try {
        const res = await reviewsApi.getByPackage(packageId);
        setReviewsData(res.data.data);
      } catch (err: any) {
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [packageId]);

  // called when user submits a review successfully
  // OPTIMISTIC UPDATE — add the review to the list immediately
  // recalculate average_rating and total_reviews locally
  // no need to re-fetch from the API
  function handleReviewSubmitted(newReview: Review) {
    setReviewsData((prev) => {
      if (!prev) return prev;

      const updatedReviews = [newReview, ...prev.reviews];

      // recalculate average from the updated array
      const newAverage = updatedReviews.reduce(
        (sum, r) => sum + r.rating, 0
      ) / updatedReviews.length;

      return {
        reviews:        updatedReviews,
        average_rating: Math.round(newAverage * 10) / 10, // round to 1 decimal
        total_reviews:  updatedReviews.length,
      };
    });
  }

  // called when user deletes their review
  // remove it from the list and recalculate stats
  async function handleReviewDeleted(reviewId: number) {
    try {
      await reviewsApi.delete(packageId);

      setReviewsData((prev) => {
        if (!prev) return prev;

        const updatedReviews = prev.reviews.filter((r) => r.id !== reviewId);

        const newAverage = updatedReviews.length > 0
          ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
          : null;

        return {
          reviews:        updatedReviews,
          average_rating: newAverage
            ? Math.round(newAverage * 10) / 10
            : null,
          total_reviews: updatedReviews.length,
        };
      });

    } catch (err: any) {
      console.error("Failed to delete review:", err);
    }
  }

  // ── loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 text-[#17A2B8] animate-spin" />
      </div>
    );
  }

  // ── error ──────────────────────────────────────────────
  if (error) {
    return (
      <p className="text-center text-red-500 text-sm py-6">{error}</p>
    );
  }

  // shouldn't happen but TypeScript needs the guard
  if (!reviewsData) return null;

  return (
    <div>

      {/* ── SECTION HEADER ────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-[#17A2B8]/10 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-[#17A2B8]" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          Reviews
        </h2>
        {reviewsData.total_reviews > 0 && (
          <span className="text-xs text-gray-400">
            ({reviewsData.total_reviews})
          </span>
        )}
      </div>

      {/* ── RATING SUMMARY ────────────────────────────────
          only show if there are reviews to summarise
      ────────────────────────────────────────────────── */}
      {reviewsData.total_reviews > 0 && (
        <RatingSummary data={reviewsData} />
      )}

      {/* ── REVIEW FORM ───────────────────────────────────
          three conditions must all be true to show the form:
          1. user is logged in
          2. user has not already reviewed this package
          if logged out → show login prompt instead
      ────────────────────────────────────────────────── */}
      {isAuthenticated && !userHasReviewed && (
        <ReviewForm
          packageId={packageId}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {/* prompt for logged-out users */}
      {!isAuthenticated && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-center">
          <p className="text-sm text-gray-500">
            <a href="/login" className="text-[#17A2B8] font-medium hover:underline">
              Sign in
            </a>
            {" "}to write a review
          </p>
        </div>
      )}

      {/* ── REVIEWS LIST ──────────────────────────────────
          empty state when no reviews yet
      ────────────────────────────────────────────────── */}
      {reviewsData.total_reviews === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">No reviews yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Be the first to review this package
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsData.reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onDelete={handleReviewDeleted}
            />
          ))}
        </div>
      )}

    </div>
  );
}