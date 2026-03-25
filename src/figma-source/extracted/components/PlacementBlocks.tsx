import { ExternalLink } from 'lucide-react';

export function PlacementBlocks() {
  const blocks = [
    {
      name: 'Unassigned',
      period: 'Students without Placement Blocks',
      students: { value: 0, total: 0, color: '#000' },
      requests: { value: 0, color: '#000' },
      placements: { value: 0, color: '#000' },
    },
    {
      name: 'Feb Roster',
      period: '12/02/2024 to 24/02/2024',
      students: { value: 11, total: 11, color: '#66cc66' },
      requests: { value: 22, color: '#66cc66' },
      placements: { value: 11, color: '#66cc66' },
    },
    {
      name: 'Mar Roster',
      period: '04/03/2024 to 15/03/2024',
      students: { value: 0, total: 0, color: '#000' },
      requests: { value: 0, color: '#000' },
      placements: { value: 0, color: '#000' },
    },
    {
      name: 'Apr Roster',
      period: '08/04/2024 to 19/04/2024',
      students: { value: 0, total: 0, color: '#000' },
      requests: { value: 0, color: '#000' },
      placements: { value: 0, color: '#000' },
    },
  ];

  return (
    <div className="bg-white p-4 border border-gray-300 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm">Placement Blocks (Click to View)</h3>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <a href="#" className="text-sm text-blue-600 underline">
            View InPlace Network Capacity
          </a>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto">
        {blocks.map((block, index) => (
          <div key={index} className="flex-shrink-0 border border-gray-300 p-3 min-w-[180px]">
            <div className="text-center mb-2">
              <div className="text-sm">{block.name}</div>
              <div className="text-xs text-gray-600">{block.period}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-lg" style={{ color: block.students.color }}>
                  {block.students.value} / {block.students.total}
                </div>
                <div className="text-gray-600">Students</div>
              </div>
              <div>
                <div className="text-lg" style={{ color: block.requests.color }}>
                  {block.requests.value}
                </div>
                <div className="text-gray-600">Requests</div>
              </div>
              <div>
                <div className="text-lg" style={{ color: block.placements.color }}>
                  {block.placements.value}
                </div>
                <div className="text-gray-600">Placements</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}