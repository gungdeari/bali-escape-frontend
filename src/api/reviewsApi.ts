import API from "./axios";

// ── Types ────────────────────────────────────────────────────

// shape of one review returned by the API
export type Review = {
  id: number;
  rating: number;       // 1-5
  comment: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
};

// shape of the full reviews response
// includes the reviews array plus calculated stats
export type ReviewsData = {
  reviews: Review[];
  average_rating: number | null;  // null when no reviews yet
  total_reviews: number;
};

type ReviewsResponse = {
  success: boolean;
  message: string;
  data: ReviewsData;
};

type ReviewResponse = {
  success: boolean;
  message: string;
  data: Review;
};

// what we send to create a review
export type CreateReviewPayload = {
  rating: number;
  comment?: string;
};

// ── API calls ────────────────────────────────────────────────
export const reviewsApi = {
  // GET /travel-packages/:packageId/reviews
  // public — no token needed
  // returns reviews array + average_rating + total_reviews
  getByPackage: (packageId: number) =>
    API.get<ReviewsResponse>(`/travel-packages/${packageId}/reviews`),

  // POST /travel-packages/:packageId/reviews
  // protected — requires token
  // returns the created review
  create: (packageId: number, payload: CreateReviewPayload) =>
    API.post<ReviewResponse>(`/travel-packages/${packageId}/reviews`, payload),

  // DELETE /travel-packages/:packageId/reviews
  // protected — deletes the logged-in user's review for this package
  delete: (packageId: number) =>
    API.delete(`/travel-packages/${packageId}/reviews`),
};