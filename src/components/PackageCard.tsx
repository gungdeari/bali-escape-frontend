import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { TravelPackage } from "../api/packagesApi";

type Props = {
  pkg: TravelPackage;
  className?: string;
};

export default function PackageCard({ pkg, className = "" }: Props) {

  const image = pkg.images?.find(img => img.is_primary === 1) ?? pkg.images?.[0];

  return (
    <Link
      to={`/packages/${pkg.id}`}
      className={`${className} bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group block`}
    >
      <div className="h-48 bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image.url}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#17A2B8]/10">
            <MapPin className="w-8 h-8 text-[#17A2B8]/40" />
          </div>
        )}
      </div>

      <div className="p-4">

        <span className="text-xs font-medium text-[#17A2B8] bg-[#17A2B8]/10 px-2.5 py-1 rounded-full">
          {pkg.destination}
        </span>

        <h3 className="font-semibold text-gray-900 mt-3 mb-1 text-sm leading-snug line-clamp-2">
          {pkg.title}
        </h3>

        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{pkg.duration_days} days</span>
            {/* show rating */}
            {pkg.average_rating && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-medium"> 
                ★ {pkg.average_rating} 
              </span>
            )}
          </div>

          <span className="text-sm font-semibold text-gray-900">
            Rp {Number(pkg.price).toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </Link>
  );
}