import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

interface RequestDetailsProps {
  experience: string;
  duration: string;
  unitOfMeasure: string;
  selectedBlocks?: string[]; // Array of selected placement blocks
}

export function RequestDetails({ experience, duration, unitOfMeasure, selectedBlocks = ['Feb Roster', 'March Roster', 'April Roster'] }: RequestDetailsProps) {
  // State for multiple selected experiences
  const availableExperiences = [
    'On-Road Emergency',
    'General',
    'Clinical Practice'
  ];
  
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState('');
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  // State for multiple selected specialisms
  const availableSpecialisms = [
    'Critical Care',
    'Emergency Medicine',
    'Pediatrics',
    'Mental Health',
    'Community Care'
  ];
  
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>([]);
  const [currentSpecialismSelection, setCurrentSpecialismSelection] = useState('');

  // State for placement date override
  const [isPlacementOverrideMode, setIsPlacementOverrideMode] = useState(false);
  const [overridePlacementDates, setOverridePlacementDates] = useState({ start: '', end: '' });

  const handleAddExperience = (exp: string) => {
    if (exp && !selectedExperiences.includes(exp)) {
      setSelectedExperiences([...selectedExperiences, exp]);
    }
    setCurrentSelection('');
  };

  const handleRemoveExperience = (exp: string) => {
    setSelectedExperiences(selectedExperiences.filter(e => e !== exp));
  };

  const handleAddSpecialism = (spec: string) => {
    if (spec && !selectedSpecialisms.includes(spec)) {
      setSelectedSpecialisms([...selectedSpecialisms, spec]);
    }
    setCurrentSpecialismSelection('');
  };

  const handleRemoveSpecialism = (spec: string) => {
    setSelectedSpecialisms(selectedSpecialisms.filter(s => s !== spec));
  };

  const handleOverrideDateChange = (field: 'start' | 'end', value: string) => {
    setOverridePlacementDates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Default dates for each placement block
  const getDefaultDates = (blockName: string) => {
    if (blockName.includes('Feb')) {
      return { start: '2024-02-12', end: '2024-02-24' };
    } else if (blockName.includes('Mar')) {
      return { start: '2024-03-04', end: '2024-03-15' };
    } else if (blockName.includes('Apr')) {
      return { start: '2024-04-08', end: '2024-04-19' };
    }
    return { start: '2024-02-12', end: '2024-02-24' };
  };

  const [blockDates, setBlockDates] = useState(() => {
    const dates: Record<string, { start: string; end: string }> = {};
    selectedBlocks.forEach(block => {
      dates[block] = getDefaultDates(block);
    });
    return dates;
  });

  // Update blockDates when selectedBlocks changes
  useEffect(() => {
    setBlockDates(prev => {
      const newDates: Record<string, { start: string; end: string }> = {};
      selectedBlocks.forEach(block => {
        // Keep existing dates if available, otherwise use defaults
        newDates[block] = prev[block] || getDefaultDates(block);
      });
      return newDates;
    });
  }, [selectedBlocks]);

  const handleDateChange = (blockName: string, field: 'start' | 'end', value: string) => {
    setBlockDates(prev => ({
      ...prev,
      [blockName]: {
        ...prev[blockName],
        [field]: value
      }
    }));
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-[16px] py-[8px]">
        <h3 className="text-base font-semibold text-gray-900">Request Details</h3>
      </div>
      <div className="px-[16px] py-[8px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`col-span-2 border rounded p-3 flex items-center justify-between ${
              isOverrideMode 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                <Info size={18} className="text-[#428bca] flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {isOverrideMode 
                    ? 'This Requirements will apply to all selected students, overriding their individual requirements'
                    : 'Requirements are inherited from student\'s experience requirement'
                  }
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOverrideMode(!isOverrideMode)}
                className="text-sm text-[#428bca] underline hover:text-[#0b5f7c] transition-colors whitespace-nowrap"
              >
                {isOverrideMode ? 'Reset to Inherited' : 'Override Requirements'}
              </button>
            </div>
            
            {isOverrideMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    value={currentSelection}
                    onChange={(e) => handleAddExperience(e.target.value)}
                  >
                    <option value=""></option>
                    {[...availableExperiences].sort().map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                  {selectedExperiences.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedExperiences.map(exp => (
                        <div
                          key={exp}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700"
                        >
                          <span>{exp}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      value={duration}
                      onChange={() => {}} // Controlled component
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit of Measure
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      value={unitOfMeasure}
                      onChange={() => {}} // Controlled component
                    >
                      <option>Hour</option>
                      <option>Day</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialism
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    value={currentSpecialismSelection}
                    onChange={(e) => handleAddSpecialism(e.target.value)}
                  >
                    <option value=""></option>
                    {[...availableSpecialisms].sort().map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {selectedSpecialisms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedSpecialisms.map(spec => (
                        <div
                          key={spec}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700"
                        >
                          <span>{spec}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialism(spec)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Code
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="space-y-3">
            <div className={`border rounded p-3 flex items-center justify-between ${
              isPlacementOverrideMode 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                <Info size={18} className="text-[#428bca] flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {isPlacementOverrideMode 
                    ? 'This date will apply to all selected students, overriding their placement block date'
                    : 'Placement Dates are inherited from student\'s placement block'
                  }
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPlacementOverrideMode(!isPlacementOverrideMode)}
                className="text-sm text-[#428bca] underline hover:text-[#0b5f7c] transition-colors whitespace-nowrap"
              >
                {isPlacementOverrideMode ? 'Reset to inherited' : 'Override Placement Dates'}
              </button>
            </div>

            {isPlacementOverrideMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placement Block
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50">
                    Other
                  </div>
                </div>

                <div>
                  <div className="flex items-end gap-2 mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <span className="invisible">→</span>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        End Date <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={overridePlacementDates.start}
                      onChange={(e) => handleOverrideDateChange('start', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <span>→</span>
                    <input
                      type="date"
                      value={overridePlacementDates.end}
                      onChange={(e) => handleOverrideDateChange('end', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="cursor-pointer mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Hide Student Details</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Student name and ID will be hidden from the agency when this request is sent
                  </div>
                </div>
              </label>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="cursor-pointer mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Not Flexible Dates</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    If selected, agencies will not be able to modify the requested dates
                  </div>
                </div>
              </label>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="cursor-pointer mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Not Flexible Experience and Duration</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    If selected, agencies will not be able to modify the requested experience and duration
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mx-[0px] mt-[0px] mb-[8px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity (optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}