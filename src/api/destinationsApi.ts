import API from "./axios";

export type Destination = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  description: string | null;
  is_active: boolean;
  package_count: number;
};

type DestinationsResponse = {
  success: boolean;
  message: string;
  data: Destination[];
};

export const destinationsApi = {
  getAll: () => API.get<DestinationsResponse>("/destinations"),
  getOne: (id: number) => API.get<DestinationsResponse>(`/destinations/${id}`),
};