import { ChevronUp, ChevronDown } from 'lucide-react';

interface RequestSummaryProps {
  studentsCount: number;
  blocksCount: number;
  agenciesCount: number;
  requestsCount: number;
  isExpanded?: boolean;
  onClick?: () => void;
}

export function RequestSummary({ studentsCount, blocksCount, agenciesCount, requestsCount, isExpanded, onClick }: RequestSummaryProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component 
      onClick={onClick}
      className={`bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg shadow-sm px-[16px] py-[8px] w-full ${onClick ? 'hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 cursor-pointer transition-colors' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-gray-900">Request Summary</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#0b5f7c]">{studentsCount}</span>
            <span className="text-xs text-gray-600">Students</span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#0b5f7c]">{blocksCount}</span>
            <span className="text-xs text-gray-600">Blocks</span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-700">{agenciesCount}</span>
            <span className="text-xs text-gray-600">Agencies</span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-purple-700">{requestsCount}</span>
            <span className="text-xs text-gray-600">Requests</span>
          </div>
          {onClick && (
            <>
              <div className="h-6 w-px bg-gray-300"></div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </>
          )}
        </div>
      </div>
    </Component>
  );
}