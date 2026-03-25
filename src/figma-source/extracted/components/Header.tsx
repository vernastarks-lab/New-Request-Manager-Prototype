import { Home, HelpCircle, Calendar, MapPin, ChevronDown, User } from 'lucide-react';

export function Header() {
  return (
    <div className="bg-[#003d5c] text-white">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1">
              <div className="w-6 h-6 bg-[#003d5c] rounded-full"></div>
            </div>
            <span className="text-sm">InPlace</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <button className="hover:bg-[#005577] px-2 py-1 rounded">
              <Home className="w-4 h-4" />
            </button>
            <button className="hover:bg-[#005577] px-2 py-1 rounded">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="hover:bg-[#005577] px-2 py-1 rounded">
              <Calendar className="w-4 h-4" />
            </button>
            <button className="hover:bg-[#005577] px-2 py-1 rounded">
              <MapPin className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              Request <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              Placement <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              Manage <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              Advanced <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              Communication <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              Costing <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              Reports <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded">
              More <ChevronDown className="w-3 h-3" />
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:bg-[#005577] px-2 py-1 rounded text-sm">
            <User className="w-4 h-4" />
            User <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}