import { useState, useRef, useEffect } from 'react';
import { Search, X, FileText, Info } from 'lucide-react';

interface AttributeRowProps {
  label: string;
  value: any;
  required?: boolean;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'checkbox' | 'file-combo';
  description?: string;
  options?: string[];
  hasExpiry?: boolean;
  expiryValue?: string;
  hasFileUpload?: boolean;
  fileValue?: File | null;
  onChange: (value: any, expiry?: string, file?: File | null) => void;
  onExpiryChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  multiSelectItems?: string[];
  onMultiSelectChange?: (items: string[]) => void;
}

export function AttributeRow({
  label,
  value,
  required = false,
  type,
  description,
  options = [],
  hasExpiry = false,
  expiryValue = '',
  hasFileUpload = false,
  fileValue = null,
  onChange,
  onExpiryChange,
  onFileChange,
  multiSelectItems = [],
  onMultiSelectChange
}: AttributeRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEditing = isHovered || isFocused || showDropdown;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        rowRef.current &&
        !rowRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
        setIsHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent, callback?: () => void) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      setIsFocused(false);
      setShowDropdown(false);
      callback?.();
    }
  };

  const renderValueField = () => {
    if (type === 'text') {
      return (
        <input
          type="text"
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Enter value..."
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setIsFocused(false);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'multiselect') {
      return (
        <div className="relative">
          <input
            type="text"
            className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded text-xs bg-white cursor-pointer"
            placeholder={multiSelectItems.length > 0 ? `${multiSelectItems.length} Items` : 'Select...'}
            onClick={() => setShowDropdown(!showDropdown)}
            onFocus={() => setIsFocused(true)}
            readOnly
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />

          {showDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#428bca] border-t-2 rounded shadow-lg z-[9999] max-h-48 overflow-y-auto"
              onMouseDown={(e) => e.preventDefault()}
              ref={dropdownRef}
            >
              {multiSelectItems.length > 0 && (
                <div className="p-2 space-y-1.5 border-b border-gray-200">
                  {multiSelectItems.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`selected-${item}`}
                        checked
                        onChange={() => {
                          const newItems = multiSelectItems.filter((i) => i !== item);
                          onMultiSelectChange?.(newItems);
                        }}
                        className="w-3.5 h-3.5 text-[#428bca] border-gray-300 rounded"
                      />
                      <label htmlFor={`selected-${item}`} className="text-xs text-gray-700 cursor-pointer">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-2 space-y-1.5">
                {options
                  .filter((opt) => !multiSelectItems.includes(opt))
                  .map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`option-${item}`}
                        checked={false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newItems = [...multiSelectItems, item];
                            onMultiSelectChange?.(newItems);
                          }
                        }}
                        className="w-3.5 h-3.5 text-[#428bca] border-gray-300 rounded"
                      />
                      <label htmlFor={`option-${item}`} className="text-xs text-gray-700 cursor-pointer">
                        {item}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (type === 'date') {
      return (
        <input
          type="date"
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      );
    }

    if (type === 'checkbox') {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-[#428bca] border-gray-300 rounded"
          />
          <span className="text-xs text-gray-700">Yes</span>
        </label>
      );
    }

    return null;
  };

  const displayValue = () => {
    if (type === 'multiselect') {
      return multiSelectItems.length > 0 ? multiSelectItems.join(', ') : '';
    }
    if (type === 'checkbox') {
      return value ? 'Yes' : '';
    }
    if (type === 'file-combo') {
      return multiSelectItems.length > 0 ? multiSelectItems.join(', ') : '';
    }
    return value || '';
  };

  return (
    <tr
      className="border-b border-gray-200 hover:bg-gray-50 group"
      onMouseEnter={() => {
        if (!showDropdown) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        // Always close hover state when mouse leaves, unless dropdown is open
        if (!showDropdown) {
          setIsHovered(false);
          setIsFocused(false);
        }
      }}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        // Close when focus is lost, unless dropdown is active
        if (!showDropdown) {
          setIsFocused(false);
          setIsHovered(false);
        }
      }}
      ref={rowRef}
    >
      <td className="px-3 py-2 align-top" style={{ width: isEditing ? '50%' : '40%' }}>
        <span className="font-semibold relative">
          {label}
          {required && (
            <span className="relative inline-block">
              <Info 
                className="w-4 h-4 text-[#428bca] ml-1 inline-block cursor-help" 
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <span className="absolute left-0 top-6 z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap pointer-events-none">
                  Required for Agency when responding
                </span>
              )}
            </span>
          )}
        </span>
        {isEditing && (
          <div className="mt-2 space-y-2">
            {description && <div className="text-xs text-gray-600 mb-1 leading-relaxed">{description}</div>}
            <div>{renderValueField()}</div>
            {hasExpiry && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Expiry Date</div>
                <input
                  type="date"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  value={expiryValue || ''}
                  onChange={(e) => onExpiryChange?.(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                />
              </div>
            )}
            {hasFileUpload && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Document Upload</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onFileChange?.(file);
                        }
                      }}
                    />
                  </label>
                  {fileValue ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {fileValue.name}
                      <button onClick={() => onFileChange?.(null)} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 italic">No file chosen</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </td>
      <td className="px-3 py-2 text-gray-700 align-top" style={{ width: '60%' }} colSpan={3}>
        {!isEditing && (
          <div className="flex items-center gap-8">
            {/* Main value display */}
            <div>{displayValue()}</div>
            
            {/* Document indicator icon */}
            {hasFileUpload && fileValue && (
              <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
          </div>
        )}
      </td>
    </tr>
  );
}