import API from "./axios";

export type TravelPackage = {
  id: number;
  title: string;
  slug: string;
  destination: string;
  description: string;
  price: string;
  duration_days: number;
  difficulty_level: string | null;
  max_people: number | null;
  average_rating?: number | null;
  total_reviews?: number;
  images: {
    url: string;
    is_primary: number;
  }[];
};

type PackagesResponse = {
  success: boolean;
  message: string;
  data: TravelPackage[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

type PackageResponse = {
  success: boolean;
  message: string;
  data: TravelPackage;
};

export const packagesApi = {
  getAll: (page: number = 1) =>
    API.get<PackagesResponse>(`/travel-packages?page=${page}`),

  getOne: (id: number) =>
    API.get<PackageResponse>(`/travel-packages/${id}`),
};