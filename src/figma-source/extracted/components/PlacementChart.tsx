export function PlacementChart() {
  return (
    <div className="bg-white p-4 border border-gray-300 w-fit">
      <h3 className="text-sm mb-4">Placements Required</h3>
      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Request In Draft - gray */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#999"
              strokeWidth="20"
              strokeDasharray="15.7 235.6"
              strokeDashoffset="0"
            />
            {/* Not Yet Responded - orange */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#ff9933"
              strokeWidth="20"
              strokeDasharray="27.5 223.8"
              strokeDashoffset="-15.7"
            />
            {/* Unconfirmed Offers - yellow */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#ffcc00"
              strokeWidth="20"
              strokeDasharray="7.85 243.35"
              strokeDashoffset="-43.2"
            />
            {/* Confirmed Offers - blue */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3399cc"
              strokeWidth="20"
              strokeDasharray="3.93 247.27"
              strokeDashoffset="-51.05"
            />
            {/* Placements Created - green */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#66cc66"
              strokeWidth="20"
              strokeDasharray="157 94.2"
              strokeDashoffset="-54.98"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">60</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#66cc66]"></div>
            <span className="flex-1">Placements Created</span>
            <span>60</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#3399cc]"></div>
            <span className="flex-1">Confirmed Offers</span>
            <span>1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ffcc00]"></div>
            <span className="flex-1">Unconfirmed Offers</span>
            <span>2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ff9933]"></div>
            <span className="flex-1">Not Yet Responded</span>
            <span>11</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#999]"></div>
            <span className="flex-1">Request In Draft</span>
            <span>5</span>
          </div>
        </div>
      </div>
    </div>
  );
}