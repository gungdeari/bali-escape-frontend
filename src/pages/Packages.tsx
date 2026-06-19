import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "../components/Navbar";
import PackageCard from "../components/PackageCard";
import { packagesApi, TravelPackage } from "../api/packagesApi";
import { destinationsApi, Destination } from "../api/destinationsApi";

export default function Packages() {

  const [packages, setPackages]         = useState<TravelPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const [searchTerm, setSearchTerm]                   = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty]   = useState("all");
  const [sortBy, setSortBy]                           = useState("default");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const destinationFromUrl = searchParams.get("destination");
    if (destinationFromUrl) {
      setSelectedDestination(destinationFromUrl);
    }
  }, [searchParams]);

  
  useEffect(() => {
    async function loadData() {
      try {
        const firstRes = await packagesApi.getAll(1);
        const { last_page } = firstRes.data.meta;
        let allPackages = [...firstRes.data.data];

        if (last_page > 1) {
          const pageNumbers = Array.from(
            { length: last_page - 1 },
            (_, i) => i + 2  
          );

          const remainingRes = await Promise.all(
            pageNumbers.map(page => packagesApi.getAll(page))
          );

          remainingRes.forEach(res => {
            allPackages = [...allPackages, ...res.data.data];
          });
        }

        const destinationsRes = await destinationsApi.getAll();

        setPackages(allPackages);
        setDestinations(destinationsRes.data.data);

      } catch (err: any) {
        setError(err.response?.data?.message ?? "Failed to load packages.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []); 


  const filteredPackages = packages
    .filter(pkg => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        pkg.title.toLowerCase().includes(term) ||
        pkg.destination?.toLowerCase().includes(term)
      );
    })
    .filter(pkg => {
      if (selectedDestination === "all") return true;
      return pkg.destination === selectedDestination;
    })
    .filter(pkg => {
      if (selectedDifficulty === "all") return true;
      return pkg.difficulty_level === selectedDifficulty;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "duration")   return a.duration_days - b.duration_days;
      if (sortBy === "rating")     return (b.average_rating ?? 0) - (a.average_rating ?? 0);
      return 0; 
    });

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedDestination !== "all" ||
    selectedDifficulty !== "all" ||
    sortBy !== "default";

  function clearFilters() {
    setSearchTerm("");
    setSelectedDestination("all");
    setSelectedDifficulty("all");
    setSortBy("default");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <span className="text-xs font-semibold text-[#17A2B8] bg-[#17A2B8]/10 px-3 py-1.5 rounded-full uppercase tracking-wide">
            Travel packages
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            All packages
          </h1>
          <p className="text-gray-500 text-sm">
            {loading
              ? "Loading packages..."
              : `${filteredPackages.length} of ${packages.length} package${packages.length !== 1 ? "s" : ""}`
            }
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">

            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#17A2B8] focus:ring-1 focus:ring-[#17A2B8]"
              />
            </div>

            <select
              value={selectedDestination}
              onChange={e => setSelectedDestination(e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-[#17A2B8] bg-white"
            >
              <option value="all">All destinations</option>
              {destinations.map(dest => (
                <option key={dest.id} value={dest.name}>
                  {dest.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-[#17A2B8] bg-white"
            >
              <option value="all">All levels</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-[#17A2B8] bg-white"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="duration">Duration: Shortest first</option>
              <option value="rating">Highest rated</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="h-10 px-4 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {selectedDestination !== "all" && (
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Filtering by destination:
              </span>
              <span className="text-xs font-medium text-[#17A2B8] bg-[#17A2B8]/10 px-2 py-0.5 rounded-full">
                {selectedDestination}
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[#17A2B8] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredPackages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-3">
              No packages found matching your filters.
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-[#17A2B8] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!loading && !error && filteredPackages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} className="w-full" />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}