import { Link, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <MapPin className="w-6 h-6 text-[#17A2B8] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl text-[#1A1A1A]">
            Bali<span className="text-[#17A2B8]">Escape</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* greeting */}
              <span className="text-sm text-gray-600">
                Hi, <span className="font-semibold text-[#1A1A1A]">{user?.name}</span>
              </span>

              <Link
                to="/bookings"
                className="text-sm text-gray-600 hover:text-[#17A2B8] transition-colors"
              >
                My Bookings
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:border-[#17A2B8] hover:text-[#17A2B8] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-[#17A2B8] transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="text-sm px-4 py-2 bg-[#17A2B8] text-white rounded-full hover:bg-[#138496] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}