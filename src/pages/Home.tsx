import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Globe, Award } from "lucide-react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import { packagesApi, TravelPackage } from "../api/packagesApi";
import { destinationsApi, Destination } from "../api/destinationsApi";
import { useAuth } from "../contexts/AuthContext";
import HorizontalScroll from "../components/ScrollHorizontal";
import PackageCard from "../components/PackageCard";

function DestinationCard({ destination }: { destination: Destination }) {

  const imageMap: Record<string, string> = {
    "Ubud":            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
    "Seminyak":        "https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&q=80",
    "Canggu":          "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&q=80",
    "Uluwatu":         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    "Kuta":            "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80",
    "Nusa Penida":     "https://plus.unsplash.com/premium_photo-1697730113048-1903ddc36c58?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Nusa Lembongan":  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=80",
    "Jimbaran":        "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=400&q=80",
    "Nusa Dua":        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
    "Kintamani":       "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=400&q=80",
    "Tegallalang":     "https://images.unsplash.com/photo-1531592937781-344ad608fabf?w=400&q=80",
    "Amed":            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80",
    "Lovina":          "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&q=80",
    "Munduk":          "https://images.unsplash.com/photo-1558005530-a7958896ec60?w=400&q=80",
    "Tanah Lot":       "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80",
    "Jatiluwih":       "https://images.unsplash.com/photo-1531592937781-344ad608fabf?w=400&q=80",
    "Tirta Gangga":    "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=400&q=80",
    "Candidasa":       "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=80",
    "Singaraja":       "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&q=80",
    "Goa Gajah":       "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&q=80",
  };

  const imageUrl = imageMap[destination.name] ?? null;

  return (
    <Link
      to={`/packages?destination=${encodeURIComponent(destination.name)}`}
      className="flex-shrink-0 w-56 h-72 rounded-3xl overflow-hidden relative group cursor-pointer"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-[#17A2B8]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-xl mb-1 leading-tight">
          {destination.name}
        </h3>
        {destination.description && (
          <p className="text-white/70 text-xs mb-3 line-clamp-2 leading-relaxed">
            {destination.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {destination.package_count} {destination.package_count === 1 ? "package" : "packages"}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#17A2B8] flex items-center justify-center group-hover:bg-[#138496] transition-colors">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [packages, setPackages]         = useState<TravelPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const [packagesRes, destinationsRes] = await Promise.all([
          packagesApi.getAll(),
          destinationsApi.getAll(),
        ]);

        setPackages(packagesRes.data.data);
        setDestinations(destinationsRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []); 

  return (
    <div className="bg-white">
      <Navbar />

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1737398574225-bc25c46113d4?w=1080&q=80"
          alt="Bali"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-[#0A4B5C]/55" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          {isAuthenticated && user && (
            <p className="text-white/80 text-sm mb-4 font-light">
              Welcome back, {user.name}
            </p>
          )}

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-5 leading-tight tracking-tight">
            Explore Bali
          </h1>

          <p className="text-lg text-white/85 mb-10 font-light leading-relaxed">
            Ancient temples, pristine beaches, and vibrant culture — all in one place
          </p>

          <div className="flex items-center justify-center gap-3">
            <a href="#packages">
              <Button className="h-11 px-7 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium">
                Browse packages
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>

            {!isAuthenticated && (
              <Link to="/register">
                <Button
                  variant="outline"
                  className="h-11 px-7 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-sm font-medium"
                >
                  Get started free
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-10">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-8 py-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-white/70 text-xs mt-0.5 uppercase tracking-wider">Experiences</div>
                </div>
                <div className="border-l border-r border-white/20">
                  <div className="text-2xl font-bold text-white">4.9★</div>
                  <div className="text-white/70 text-xs mt-0.5 uppercase tracking-wider">Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">10k+</div>
                  <div className="text-white/70 text-xs mt-0.5 uppercase tracking-wider">Travelers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50">
        <HorizontalScroll
          badge="Destinations"
          title="Popular places"
          subtitle="The most breathtaking locations across Bali"
        >
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-52 h-36 bg-gray-200 rounded-2xl animate-pulse" />
              ))
            : destinations.map(dest => (
                <DestinationCard key={dest.id} destination={dest} />
              ))
          }
        </HorizontalScroll>
      </div>

      <div className="bg-white">
        <HorizontalScroll
          badge="Travel packages"
          title="Handpicked experiences"
          subtitle="Carefully curated tours for unforgettable memories"
        >
          {loading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-72 bg-gray-100 rounded-2xl animate-pulse" />
              ))
            : packages.map(pkg => (
                <PackageCard key={pkg.id} pkg={pkg} className="flex-shrink-0 w-72" />
              ))
          }
        </HorizontalScroll>
      </div>
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-[#17A2B8] bg-[#17A2B8]/10 px-3 py-1.5 rounded-full uppercase tracking-wide">
              Why us
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-3">Travel with confidence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Curated experiences",
                description: "Handpicked tours designed by local experts for authentic Balinese adventures",
              },
              {
                icon: Award,
                title: "Best price guarantee",
                description: "Competitive pricing with no hidden fees — best value for your tropical escape",
              },
              {
                icon: Globe,
                title: "24/7 support",
                description: "Our travel team is ready to assist before, during, and after your journey",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#17A2B8]/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#17A2B8]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559234628-a48009cfd212?w=1080&q=80"
          alt="Bali beach"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0A4B5C]/70" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Ready for your adventure?
          </h2>
          <p className="text-white/80 text-sm mb-8 font-light">
            Start planning your dream Bali escape today.
          </p>

          {isAuthenticated ? (
            <Link to="/bookings">
              <Button className="h-11 px-8 bg-white text-[#17A2B8] hover:bg-white/90 rounded-xl text-sm font-medium">
                My bookings
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button className="h-11 px-8 bg-white text-[#17A2B8] hover:bg-white/90 rounded-xl text-sm font-medium">
                Start exploring
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}