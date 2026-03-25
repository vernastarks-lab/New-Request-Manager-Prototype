import { useState, useRef, useEffect, Fragment } from 'react';
import { Header } from './components/Header';
import { PlacementChart } from './components/PlacementChart';
import { PlacementBlocks } from './components/PlacementBlocks';
import { RequestSummary } from './components/RequestSummary';
import { RequestDetails } from './components/RequestDetails';
import { AttributeRow } from './components/AttributeRow';
import { ChevronRight, ChevronDown, X, Settings, CheckCircle2, Hourglass, Plus, Sparkles, Target, Users, Trash2, Search, ChevronUp, HelpCircle, Info, ChevronLeft, Ban, Pencil, MessageSquare, Paperclip } from 'lucide-react';
import { Switch } from './components/ui/switch';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import MatchBreakdown from './imports/MatchBreakdown';

export default function App() {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showNestedColumnSettings, setShowNestedColumnSettings] = useState(false);
  const [nestedColumnVisibility, setNestedColumnVisibility] = useState({
    agency: true,
    specialism: true,
    ranking: true,
    location: true,
    action: true,
  });
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [showTrialMatchModal, setShowTrialMatchModal] = useState(false);
  const [selectedRuleset, setSelectedRuleset] = useState('');
  const [autoQueueEnabled, setAutoQueueEnabled] = useState(true);
  const [autoQueueLimit, setAutoQueueLimit] = useState(2);
  const [showMatchBreakdown, setShowMatchBreakdown] = useState(false);
  const [showRulesetDetails, setShowRulesetDetails] = useState(false);
  const [rulesetRules, setRulesetRules] = useState([
    { rule: 'Location (Public Transport Travel Time)', expression: 'Greater Than or Equal To 00:30', weight: 30, active: true },
    { rule: 'Placement History (Match on Agency)', expression: 'Student has never had a Placement at this Agency', weight: 20, active: true },
    { rule: 'Student (Prior Requests)', expression: 'Match: Return true if Student has had Request at Agency before', weight: 30, active: true },
    { rule: 'Student Match on Specialisms (Agency)', expression: 'Equals. Exactly the same options are selected and unselected in both lists', weight: 20, active: true },
  ]);
  const [selectedRanking, setSelectedRanking] = useState(95);
  const [selectedAgencyName, setSelectedAgencyName] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [rulesetError, setRulesetError] = useState(false);
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null);
  const [showAgencySheet, setShowAgencySheet] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [showAgencyColumnSettings, setShowAgencyColumnSettings] = useState(false);
  const [agencyColumnVisibility, setAgencyColumnVisibility] = useState({
    agencyName: true,
    specialism: true,
    location: true,
    ranking: true,
    placements: true,
    action: true,
  });
  const [trialMatchSource, setTrialMatchSource] = useState<'main' | 'side-sheet' | null>(null);
  const [selectedAgencies, setSelectedAgencies] = useState<Map<string, 'select' | 'queued' | 'exclude'>>(new Map());
  const [excludedAgencies, setExcludedAgencies] = useState<Set<string>>(new Set(['Northern Emergency Care']));
  const [manuallyExcludedAgencies, setManuallyExcludedAgencies] = useState<Set<string>>(new Set());
  const [autoMatchStudent, setAutoMatchStudent] = useState<typeof students[0] | null>(null);
  const [showCallout, setShowCallout] = useState(true);
  const [showTrialMatchHelper, setShowTrialMatchHelper] = useState(true);
  const [filterHistoricalAgencies, setFilterHistoricalAgencies] = useState(false);
  const [rulesetModified, setRulesetModified] = useState(false);
  const [showRuleSuggestions, setShowRuleSuggestions] = useState<number | null>(null);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [saveAsRulesetName, setSaveAsRulesetName] = useState('');
  const [showBulkActionDropdown, setShowBulkActionDropdown] = useState(false);
  const [showBulkAddAgencySheet, setShowBulkAddAgencySheet] = useState(false);
  const [bulkSummaryExpanded, setBulkSummaryExpanded] = useState(false);
  const [showCreateRequestSheet, setShowCreateRequestSheet] = useState(false);
  const [showPlacementTimeSection, setShowPlacementTimeSection] = useState(false);
  const [showAttributesSection, setShowAttributesSection] = useState(false);
  const [collapseAllAttributes, setCollapseAllAttributes] = useState(false);
  const [showAllText, setShowAllText] = useState(false);
  const [expandedMainCollections, setExpandedMainCollections] = useState<Set<string>>(new Set(['request', 'jja1']));
  const [expandedSubCollections, setExpandedSubCollections] = useState<Set<string>>(new Set());
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(new Set());
  const [requestListOptions, setRequestListOptions] = useState<string[]>([]);
  const [showRequestListDropdown, setShowRequestListDropdown] = useState(false);
  const [showSelectedStudents, setShowSelectedStudents] = useState(false);
  const [showPerDayTimes, setShowPerDayTimes] = useState(false);
  const [showNotesDocumentsSection, setShowNotesDocumentsSection] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [noteType, setNoteType] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notePrivate, setNotePrivate] = useState(false);
  const [noteChangedUser, setNoteChangedUser] = useState('');
  const [editingNote, setEditingNote] = useState<{ rowIndex: number; field: string } | null>(null);
  const [hoveredNoteCell, setHoveredNoteCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const selectInputRef = useRef<HTMLSelectElement>(null);
  const [notes, setNotes] = useState<Array<{ type: string; date: string; title: string; text: string; private: boolean; changedUser: string }>>([
    {
      type: 'Note',
      date: '03/10/2026',
      title: 'Initial placement review completed',
      text: 'All student requirements have been reviewed and initial agency placements have been assigned based on student preferences and agency capacity.',
      private: false,
      changedUser: 'John Smith'
    }
  ]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documents, setDocuments] = useState<Array<{ title: string; description: string; fileName: string }>>([]); 
  const [editingDocument, setEditingDocument] = useState<{ rowIndex: number; field: string } | null>(null);
  const [hoveredDocumentCell, setHoveredDocumentCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [requestAttributes, setRequestAttributes] = useState([
    { attribute: 'Request List', description: 'Select the status categories for this placement request', value: 'Current, Existing', expiry: '', refNo: '', comment: 'This is a required field for agency processing', attachment: null },
    { attribute: 'Placement Supervision Type', description: 'Specify whether supervision is direct or indirect', value: 'Direct', expiry: '', refNo: '', comment: null, attachment: 'supervision_guidelines.pdf' },
    { attribute: 'Requested Placement Type', description: 'Enter the specific type of placement setting required', value: '', expiry: '', refNo: '', comment: null, attachment: null }
  ]);
  const [jjaAttributes, setJjaAttributes] = useState([
    { attribute: 'JJA Request Boolean', description: 'Indicate if this placement is part of a JJA request', value: 'Yes', expiry: '', refNo: '', comment: 'Confirmed with JJA coordinator', attachment: 'jja_approval.pdf' },
    { attribute: 'JJA Request Combo', description: 'Select the associated JJA account code', value: 'BS63MIR-ACCOUNT', expiry: '', refNo: '', comment: null, attachment: null },
    { attribute: 'JJA Request Date', description: 'Specify the JJA request submission date', value: '2024-03-15', expiry: '', refNo: '', comment: null, attachment: null }
  ]);
  const [editingAttribute, setEditingAttribute] = useState<{ collection: string; rowIndex: number; field: string } | null>(null);
  const [hoveredAttributeCell, setHoveredAttributeCell] = useState<{ collection: string; rowIndex: number; field: string } | null>(null);
  const [activeCommentPopover, setActiveCommentPopover] = useState<{ collection: string; rowIndex: number; type: 'comment' | 'attachment' } | null>(null);
  const [tempCommentText, setTempCommentText] = useState('');
  const [tempAttachmentText, setTempAttachmentText] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [activeWeek, setActiveWeek] = useState(1);
  const [weeks, setWeeks] = useState([1]);
  const [weekData, setWeekData] = useState<Record<number, {
    workingDays: { Mon: boolean; Tue: boolean; Wed: boolean; Thu: boolean; Fri: boolean; Sat: boolean; Sun: boolean };
    globalStartTime: string;
    globalEndTime: string;
    perDayTimes: {
      Mon: { start: string; end: string };
      Tue: { start: string; end: string };
      Wed: { start: string; end: string };
      Thu: { start: string; end: string };
      Fri: { start: string; end: string };
      Sat: { start: string; end: string };
      Sun: { start: string; end: string };
    };
    perDayShiftTypes: {
      Mon: string;
      Tue: string;
      Wed: string;
      Thu: string;
      Fri: string;
      Sat: string;
      Sun: string;
    };
  }>>({
    1: {
      workingDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
      globalStartTime: '08:30',
      globalEndTime: '16:00',
      perDayTimes: {
        Mon: { start: '08:30', end: '16:00' },
        Tue: { start: '08:30', end: '16:00' },
        Wed: { start: '08:30', end: '16:00' },
        Thu: { start: '08:30', end: '16:00' },
        Fri: { start: '08:30', end: '16:00' },
        Sat: { start: '08:30', end: '16:00' },
        Sun: { start: '08:30', end: '16:00' },
      },
      perDayShiftTypes: {
        Mon: 'Custom',
        Tue: 'Custom',
        Wed: 'Custom',
        Thu: 'Custom',
        Fri: 'Custom',
        Sat: 'Custom',
        Sun: 'Custom',
      }
    }
  });
  const [workingDays, setWorkingDays] = useState({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
  });
  const [shiftType, setShiftType] = useState('Custom');
  const [globalStartTime, setGlobalStartTime] = useState('09:00');
  const [globalEndTime, setGlobalEndTime] = useState('17:00');
  const [perDayTimes, setPerDayTimes] = useState({
    Mon: { start: '09:00', end: '17:00' },
    Tue: { start: '09:00', end: '17:00' },
    Wed: { start: '09:00', end: '17:00' },
    Thu: { start: '09:00', end: '17:00' },
    Fri: { start: '09:00', end: '17:00' },
    Sat: { start: '09:00', end: '17:00' },
    Sun: { start: '09:00', end: '17:00' },
  });
  const [perDayShiftTypes, setPerDayShiftTypes] = useState({
    Mon: 'Custom',
    Tue: 'Custom',
    Wed: 'Custom',
    Thu: 'Custom',
    Fri: 'Custom',
    Sat: 'Custom',
    Sun: 'Custom',
  });
  const [showPlannedAgencies, setShowPlannedAgencies] = useState(false);
  const [attributeValues, setAttributeValues] = useState({
    requestList: [] as string[],
    documentUpload: null as File | null,
    placementSupervisionType: '',
    requestedPlacementType: '',
    jjaRequestBoolean: false,
    jjaRequestCombo: '',
    jjaRequestDate: '2025-02-04',
  });
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [expandedPlacementBlocks, setExpandedPlacementBlocks] = useState<Set<string>>(new Set());
  const [selectedStudentsSectionExpanded, setSelectedStudentsSectionExpanded] = useState(true);
  const [showRequestSummary, setShowRequestSummary] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [showMainColumnSettings, setShowMainColumnSettings] = useState(false);
  const [mainColumnVisibility, setMainColumnVisibility] = useState({
    placementBlock: true,
    specialism: true,
    location: true,
    requestQueue: true,
    draftRequest: true,
    sent: true,
    agenciesRequested: true,
  });
  const nestedSettingsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const mainSettingsRef = useRef<HTMLDivElement>(null);
  const agencySettingsRef = useRef<HTMLDivElement>(null);
  const actionDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const ruleSuggestionsRef = useRef<HTMLDivElement>(null);
  const bulkActionRef = useRef<HTMLDivElement>(null);

  // Initialize selected blocks when sidesheet opens
  useEffect(() => {
    if (showCreateRequestSheet) {
      const selectedStudentsList = students.filter((_, idx) => selectedStudents.has(idx));
      const blockKeys = new Set(selectedStudentsList.map(student => `${student.block} (${student.period})`));
      setSelectedBlocks(blockKeys);
    }
  }, [showCreateRequestSheet]);

  // Predefined rule suggestions
  const ruleSuggestions = [
    "First Preference is within 10km",
    "Second Preference is within 15km",
    "Third Preference is within 20km",
    "Students had never had placements in requested agencies",
    "Student has had previous placement at this agency",
    "Agency specialisms match student preferences",
    "Location is accessible by public transport",
    "Student ranking is above 80%",
    "Agency has available capacity",
    "Placement duration matches student availability"
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (nestedSettingsRef.current && !nestedSettingsRef.current.contains(event.target as Node)) {
        setShowNestedColumnSettings(false);
      }
      if (mainSettingsRef.current && !mainSettingsRef.current.contains(event.target as Node)) {
        setShowMainColumnSettings(false);
      }
      if (agencySettingsRef.current && !agencySettingsRef.current.contains(event.target as Node)) {
        setShowAgencyColumnSettings(false);
      }
      if (ruleSuggestionsRef.current && !ruleSuggestionsRef.current.contains(event.target as Node)) {
        setShowRuleSuggestions(null);
      }
      if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
        setShowBulkActionDropdown(false);
      }
      if (openActionDropdown !== null) {
        const currentRef = actionDropdownRefs.current[openActionDropdown];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setOpenActionDropdown(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionDropdown]);

  // Position cursor at end when editing text fields
  useEffect(() => {
    if (textInputRef.current && (editingNote?.field === 'title' || editingNote?.field === 'text' || editingNote?.field === 'changedUser')) {
      const input = textInputRef.current;
      const length = input.value.length;
      input.focus();
      input.setSelectionRange(length, length);
    }
  }, [editingNote]);

  // Close editing when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside the editing area
      if (editingAttribute && !target.closest('.attribute-edit-dropdown')) {
        setEditingAttribute(null);
      }
    };

    if (editingAttribute) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingAttribute]);

  // Auto-focus date input for expiry fields
  useEffect(() => {
    if (dateInputRef.current && editingAttribute?.field === 'expiry') {
      dateInputRef.current.focus();
    }
  }, [editingAttribute]);

  // Auto-focus select dropdown for single-select fields
  useEffect(() => {
    if (selectInputRef.current && editingAttribute?.field === 'value') {
      selectInputRef.current.focus();
    }
  }, [editingAttribute]);

  // Close comment/attachment popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // Check if click is outside popover and not on a trigger button
      if (activeCommentPopover && 
          !target.closest('.absolute.left-full') && 
          !target.closest('button')) {
        setActiveCommentPopover(null);
        setTempCommentText('');
      }
    }

    if (activeCommentPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeCommentPopover]);

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const toggleNestedColumn = (column: keyof typeof nestedColumnVisibility) => {
    setNestedColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const toggleAgencyColumn = (column: keyof typeof agencyColumnVisibility) => {
    setAgencyColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const toggleAgencyExclusion = (agencyName: string) => {
    setManuallyExcludedAgencies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agencyName)) {
        newSet.delete(agencyName);
      } else {
        newSet.add(agencyName);
      }
      return newSet;
    });
  };

  const toggleMainColumn = (column: keyof typeof mainColumnVisibility) => {
    setMainColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const addWeek = () => {
    const newWeekNumber = Math.max(...weeks) + 1;
    setWeeks([...weeks, newWeekNumber]);
    // Copy Week 1 data to new week
    setWeekData({
      ...weekData,
      [newWeekNumber]: { ...weekData[1] }
    });
    setActiveWeek(newWeekNumber);
  };

  const removeWeek = (weekNum: number) => {
    if (weeks.length === 1) return; // Don't remove the last week
    const newWeeks = weeks.filter(w => w !== weekNum);
    setWeeks(newWeeks);
    const newWeekData = { ...weekData };
    delete newWeekData[weekNum];
    setWeekData(newWeekData);
    if (activeWeek === weekNum) {
      setActiveWeek(newWeeks[newWeeks.length - 1]);
    }
  };

  const syncCurrentWeekData = () => {
    setWeekData({
      ...weekData,
      [activeWeek]: {
        workingDays,
        globalStartTime,
        globalEndTime,
        perDayTimes,
        perDayShiftTypes
      }
    });
  };

  const loadWeekData = (weekNum: number) => {
    syncCurrentWeekData();
    const data = weekData[weekNum];
    setWorkingDays(data.workingDays);
    setGlobalStartTime(data.globalStartTime);
    setGlobalEndTime(data.globalEndTime);
    setPerDayTimes(data.perDayTimes);
    setPerDayShiftTypes(data.perDayShiftTypes);
    setActiveWeek(weekNum);
  };

  const toggleAgencySelection = (agencyName: string, isFromQueued: boolean = false) => {
    // Get current state first before any updates
    const currentState = selectedAgencies.get(agencyName);
    let nextState: 'select' | 'queued' | 'exclude' | undefined;
    
    // Determine next state based on current state
    if (isFromQueued) {
      // From queued table: Planned → Select → Exclude → Planned
      if (!currentState || currentState === 'queued') {
        nextState = 'select';
      } else if (currentState === 'select') {
        nextState = 'exclude';
      } else if (currentState === 'exclude') {
        nextState = undefined; // Back to Planned (no state)
      }
    } else {
      // From available table: Select → Queued → Exclude → Select
      if (!currentState || currentState === 'select') {
        nextState = 'queued';
      } else if (currentState === 'queued') {
        nextState = 'exclude';
      } else if (currentState === 'exclude') {
        nextState = 'select'; // Back to Select
      }
    }
    
    console.log('toggleAgencySelection', { agencyName, isFromQueued, currentState, nextState });
    
    // Update the selectedAgencies map
    setSelectedAgencies(prev => {
      const newMap = new Map(prev);
      if (nextState === undefined) {
        newMap.delete(agencyName);
      } else {
        newMap.set(agencyName, nextState);
      }
      console.log('Updated selectedAgencies map:', Array.from(newMap.entries()));
      return newMap;
    });
    
    // Update student data only when moving to/from queued state
    if (selectedStudent) {
      setStudents(prevStudents => {
        return prevStudents.map(student => {
          if (student.name === selectedStudent.name) {
            if (isFromQueued) {
              // From queued table
              if (!currentState || currentState === 'queued') {
                // Planned → Select: dequeue it
                const agency = student.queuedAgencyDetails.find(a => a.name === agencyName);
                if (agency) {
                  return {
                    ...student,
                    agencies: student.agencies.filter(a => a !== agencyName),
                    queuedAgencyDetails: student.queuedAgencyDetails.filter(a => a.name !== agencyName),
                    agencyDetails: [...student.agencyDetails, agency]
                  };
                }
              }
            } else {
              // From available table
              if (!currentState || currentState === 'select') {
                // Select → Queued: queue it
                const agency = student.agencyDetails.find(a => a.name === agencyName);
                if (agency) {
                  return {
                    ...student,
                    agencies: [...student.agencies, agencyName],
                    queuedAgencyDetails: [...student.queuedAgencyDetails, agency],
                    agencyDetails: student.agencyDetails.filter(a => a.name !== agencyName)
                  };
                }
              } else if (currentState === 'queued') {
                // Queued → Exclude: dequeue it
                const agency = student.queuedAgencyDetails.find(a => a.name === agencyName);
                if (agency) {
                  return {
                    ...student,
                    agencies: student.agencies.filter(a => a !== agencyName),
                    queuedAgencyDetails: student.queuedAgencyDetails.filter(a => a.name !== agencyName),
                    agencyDetails: [...student.agencyDetails, agency]
                  };
                }
              }
            }
          }
          return student;
        });
      });
      
      // Update selectedStudent to reflect changes
      setSelectedStudent(prev => {
        if (!prev) return prev;
        
        if (isFromQueued) {
          // From queued table
          if (!currentState || currentState === 'queued') {
            // Planned → Select: dequeue it
            const agency = prev.queuedAgencyDetails.find(a => a.name === agencyName);
            if (agency) {
              return {
                ...prev,
                agencies: prev.agencies.filter(a => a !== agencyName),
                queuedAgencyDetails: prev.queuedAgencyDetails.filter(a => a.name !== agencyName),
                agencyDetails: [...prev.agencyDetails, agency]
              };
            }
          }
        } else {
          // From available table
          if (!currentState || currentState === 'select') {
            // Select → Queued: queue it
            const agency = prev.agencyDetails.find(a => a.name === agencyName);
            if (agency) {
              return {
                ...prev,
                agencies: [...prev.agencies, agencyName],
                queuedAgencyDetails: [...prev.queuedAgencyDetails, agency],
                agencyDetails: prev.agencyDetails.filter(a => a.name !== agencyName)
              };
            }
          } else if (currentState === 'queued') {
            // Queued → Exclude: dequeue it
            const agency = prev.queuedAgencyDetails.find(a => a.name === agencyName);
            if (agency) {
              return {
                ...prev,
                agencies: prev.agencies.filter(a => a !== agencyName),
                queuedAgencyDetails: prev.queuedAgencyDetails.filter(a => a.name !== agencyName),
                agencyDetails: [...prev.agencyDetails, agency]
              };
            }
          }
        }
        return prev;
      });
    }
  };

  const toggleStudent = (index: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map((_, index) => index)));
    }
  };

  // Update queued agencies when auto-queue limit changes
  useEffect(() => {
    if (!showTrialMatchModal) return; // Only apply when Trial Match modal is open
    
    // Determine which students to update
    const shouldUpdateStudent = (index: number) => {
      if (autoMatchStudent) {
        return students[index].name === autoMatchStudent.name;
      } else if (selectedStudents.size > 0) {
        return selectedStudents.has(index);
      } else {
        return true; // Update all students
      }
    };
    
    setStudents(prevStudents => {
      return prevStudents.map((student, index) => {
        if (!shouldUpdateStudent(index)) return student;
        
        const currentQueueCount = student.queuedAgencyDetails.length;
        const difference = autoQueueLimit - currentQueueCount;
        
        if (difference > 0) {
          // Need to add more agencies to queue
          const agenciesToAdd = student.agencyDetails.slice(0, difference);
          const remainingAgencies = student.agencyDetails.slice(difference);
          
          return {
            ...student,
            agencies: [...student.agencies, ...agenciesToAdd.map(a => a.name)],
            queuedAgencyDetails: [...student.queuedAgencyDetails, ...agenciesToAdd],
            agencyDetails: remainingAgencies
          };
        } else if (difference < 0) {
          // Need to remove agencies from queue
          const agenciesToRemove = student.queuedAgencyDetails.slice(difference); // Get last |difference| agencies
          const remainingQueued = student.queuedAgencyDetails.slice(0, autoQueueLimit);
          
          return {
            ...student,
            agencies: remainingQueued.map(a => a.name),
            queuedAgencyDetails: remainingQueued,
            agencyDetails: [...student.agencyDetails, ...agenciesToRemove]
          };
        }
        
        return student;
      });
    });
    
    // Update selectedStudent if it's affected
    if (selectedStudent && showAgencySheet) {
      setSelectedStudent(prev => {
        if (!prev) return prev;
        
        const currentQueueCount = prev.queuedAgencyDetails.length;
        const difference = autoQueueLimit - currentQueueCount;
        
        if (difference > 0) {
          const agenciesToAdd = prev.agencyDetails.slice(0, difference);
          const remainingAgencies = prev.agencyDetails.slice(difference);
          
          return {
            ...prev,
            agencies: [...prev.agencies, ...agenciesToAdd.map(a => a.name)],
            queuedAgencyDetails: [...prev.queuedAgencyDetails, ...agenciesToAdd],
            agencyDetails: remainingAgencies
          };
        } else if (difference < 0) {
          const agenciesToRemove = prev.queuedAgencyDetails.slice(difference);
          const remainingQueued = prev.queuedAgencyDetails.slice(0, autoQueueLimit);
          
          return {
            ...prev,
            agencies: remainingQueued.map(a => a.name),
            queuedAgencyDetails: remainingQueued,
            agencyDetails: [...prev.agencyDetails, ...agenciesToRemove]
          };
        }
        
        return prev;
      });
    }
  }, [autoQueueLimit, showTrialMatchModal]);
  
  const [students, setStudents] = useState([
    { 
      name: 'Ben Trinh (AVSTTU0015)', 
      details: '12 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Emergency Care', 
      location: '', 
      queue: 1, 
      agencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria'], 
      created: 2, 
      requestedAgencies: ['Melbourne Emergency Services', 'Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Emergency Care', ranking: 92, location: 'Melbourne, VIC', placements: 15 },
        { name: 'Royal Ambulance Victoria', specialism: 'Emergency Care', ranking: 85, location: 'Richmond, VIC', placements: 12 },
      ],
      agencyDetails: [
        { name: 'City Medical Response Unit', specialism: 'Emergency Care', ranking: 95, location: 'Melbourne, VIC', placements: 8 },
        { name: 'Northern Emergency Care', specialism: 'Emergency Care', ranking: 88, location: 'Richmond, VIC', placements: 10 },
      ]
    },
    { 
      name: 'Chris Krejcie (AVSTTU0024)', 
      details: '12 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Critical Care', 
      location: '', 
      queue: 1, 
      agencies: ['Melbourne Emergency Services'], 
      created: 2, 
      requestedAgencies: ['Royal Ambulance Victoria', 'Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Critical Care', ranking: 90, location: 'Carlton, VIC', placements: 18 },
      ],
      agencyDetails: [
        { name: 'Western Metro Ambulance', specialism: 'Critical Care', ranking: 92, location: 'Carlton, VIC', placements: 14 },
      ]
    },
    { 
      name: 'Clark Larkin (AVSTUQ016)', 
      details: '12 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: '', 
      location: '', 
      queue: 1, 
      agencies: ['Royal Ambulance Victoria', 'Metropolitan Health Network'], 
      created: 1, 
      requestedAgencies: ['Melbourne Emergency Services'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria', specialism: 'Emergency Care', ranking: 87, location: 'Footscray, VIC', placements: 11 },
        { name: 'Metropolitan Health Network', specialism: 'Emergency Care', ranking: 82, location: 'Brunswick, VIC', placements: 9 },
      ],
      agencyDetails: [
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 85, location: 'Footscray, VIC', placements: 13 },
        { name: 'Northern Emergency Care', specialism: 'Emergency Care', ranking: 78, location: 'Brunswick, VIC', placements: 7 },
      ]
    },
    { 
      name: 'Debra Trimeles (AVSTUD902)', 
      details: '12 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Intensive Care Paramedic', 
      location: 'Clifton Hill, VIC', 
      queue: 1, 
      agencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria', 'City Medical Response Unit'], 
      created: 2, 
      requestedAgencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Intensive Care Paramedic', ranking: 94, location: 'Melbourne, VIC', placements: 16 },
        { name: 'Royal Ambulance Victoria', specialism: 'Intensive Care Paramedic', ranking: 89, location: 'Richmond, VIC', placements: 14 },
        { name: 'City Medical Response Unit', specialism: 'Intensive Care Paramedic', ranking: 84, location: 'Brunswick, VIC', placements: 11 },
      ],
      agencyDetails: [
        { name: 'City Medical Response Unit', specialism: 'Intensive Care Paramedic', ranking: 96, location: 'Melbourne, VIC', placements: 19 },
        { name: 'Western Metro Ambulance', specialism: 'Intensive Care Paramedic', ranking: 90, location: 'Richmond, VIC', placements: 13 },
        { name: 'Northern Emergency Care', specialism: 'Intensive Care Paramedic', ranking: 82, location: 'Brunswick, VIC', placements: 8 },
      ]
    },
    { 
      name: 'Hannah Torin (AVSTUU007)', 
      details: '12 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: '', 
      location: '', 
      queue: 1, 
      agencies: ['Royal Ambulance Victoria'], 
      created: 1, 
      requestedAgencies: ['Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria', specialism: 'Emergency Care', ranking: 86, location: 'Richmond, VIC', placements: 10 },
      ],
      agencyDetails: [
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 87, location: 'Richmond, VIC', placements: 12 },
      ]
    },
    { 
      name: 'Lisa Learad (AVSTUU005)', 
      details: '5 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Critical Care', 
      location: 'Mount Waverley, VIC', 
      queue: 1, 
      agencies: ['Melbourne Emergency Services', 'South Eastern Paramedic Services'], 
      created: 2, 
      requestedAgencies: ['Royal Ambulance Victoria'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Critical Care', ranking: 91, location: 'Melbourne, VIC', placements: 17 },
        { name: 'South Eastern Paramedic Services', specialism: 'Critical Care', ranking: 83, location: 'Brunswick, VIC', placements: 9 },
      ],
      agencyDetails: [
        { name: 'Western Metro Ambulance', specialism: 'Critical Care', ranking: 93, location: 'Melbourne, VIC', placements: 15 },
        { name: 'City Medical Response Unit', specialism: 'Critical Care', ranking: 81, location: 'Brunswick, VIC', placements: 11 },
      ]
    },
    { 
      name: 'Phillip Parker (AVSTUQ020)', 
      details: '2 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Community Paramedic', 
      location: '', 
      queue: 1, 
      agencies: ['Metropolitan Health Network'], 
      created: 1, 
      requestedAgencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria', 'City Medical Response Unit'],
      queuedAgencyDetails: [
        { name: 'Metropolitan Health Network', specialism: 'Community Paramedic', ranking: 80, location: 'Brunswick, VIC', placements: 6 },
      ],
      agencyDetails: [
        { name: 'Northern Emergency Care', specialism: 'Community Paramedic', ranking: 79, location: 'Brunswick, VIC', placements: 5 },
      ]
    },
    { 
      name: 'Rebeccca Harrison (AVSTUD017)', 
      details: '12 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Emergency Care', 
      location: '', 
      queue: 1, 
      agencies: ['Melbourne Emergency Services', 'City Medical Response Unit'], 
      created: 1, 
      requestedAgencies: ['Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Emergency Care', ranking: 93, location: 'Melbourne, VIC', placements: 14 },
        { name: 'City Medical Response Unit', specialism: 'Emergency Care', ranking: 88, location: 'Richmond, VIC', placements: 10 },
      ],
      agencyDetails: [
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 94, location: 'Melbourne, VIC', placements: 16 },
        { name: 'Western Metro Ambulance', specialism: 'Emergency Care', ranking: 86, location: 'Richmond, VIC', placements: 11 },
      ]
    },
    { 
      name: 'Rob Tran (AVSTUD003)', 
      details: '8 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Critical Care', 
      location: 'Mitcham, VIC', 
      queue: 1, 
      agencies: ['Royal Ambulance Victoria', 'South Eastern Paramedic Services'], 
      created: 2, 
      requestedAgencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria', specialism: 'Critical Care', ranking: 90, location: 'Richmond, VIC', placements: 13 },
        { name: 'South Eastern Paramedic Services', specialism: 'Critical Care', ranking: 85, location: 'Brunswick, VIC', placements: 10 },
      ],
      agencyDetails: [
        { name: 'City Medical Response Unit', specialism: 'Critical Care', ranking: 89, location: 'Richmond, VIC', placements: 12 },
        { name: 'Northern Emergency Care', specialism: 'Critical Care', ranking: 83, location: 'Brunswick, VIC', placements: 9 },
      ]
    },
    { 
      name: 'Victor Torin (AVSTUD013)', 
      details: '6 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Emergency Care', 
      location: '', 
      queue: 1, 
      agencies: ['Melbourne Emergency Services'], 
      created: 1, 
      requestedAgencies: ['Royal Ambulance Victoria', 'City Medical Response Unit'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Emergency Care', ranking: 89, location: 'Melbourne, VIC', placements: 15 },
      ],
      agencyDetails: [
        { name: 'Western Metro Ambulance', specialism: 'Emergency Care', ranking: 91, location: 'Melbourne, VIC', placements: 13 },
      ]
    },
    { 
      name: 'Yanessa Trimeles (AVSTUD014)', 
      details: '12 Days On-Road Emergency', 
      block: 'Feb Roster', 
      period: '12/02/2024 - 24/02/2024', 
      specialism: 'Intensive Care Paramedic', 
      location: '', 
      queue: 1, 
      agencies: ['Royal Ambulance Victoria'], 
      created: 1, 
      requestedAgencies: ['Melbourne Emergency Services'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria', specialism: 'Intensive Care Paramedic', ranking: 87, location: 'Richmond, VIC', placements: 12 },
      ],
      agencyDetails: [
        { name: 'South Eastern Paramedic Services', specialism: 'Intensive Care Paramedic', ranking: 88, location: 'Richmond, VIC', placements: 14 },
      ]
    },
    { 
      name: 'Emma Wilson (AVSTTU0025)', 
      details: '10 Days On-Road Emergency', 
      block: 'March Roster', 
      period: '01/03/2024 - 11/03/2024', 
      specialism: 'Emergency Care', 
      location: 'Brunswick, VIC', 
      queue: 1, 
      agencies: ['City Medical Response Unit', 'Northern Emergency Care'], 
      created: 1, 
      requestedAgencies: ['Melbourne Emergency Services'],
      queuedAgencyDetails: [
        { name: 'City Medical Response Unit', specialism: 'Emergency Care', ranking: 90, location: 'Melbourne, VIC', placements: 14 },
        { name: 'Northern Emergency Care', specialism: 'Emergency Care', ranking: 86, location: 'Richmond, VIC', placements: 11 },
      ],
      agencyDetails: [
        { name: 'Western Metro Ambulance', specialism: 'Emergency Care', ranking: 88, location: 'Carlton, VIC', placements: 10 },
      ]
    },
    { 
      name: 'James Mitchell (AVSTTU0026)', 
      details: '8 Days On-Road Emergency', 
      block: 'March Roster', 
      period: '01/03/2024 - 11/03/2024', 
      specialism: 'Critical Care', 
      location: '', 
      queue: 1, 
      agencies: ['Western Metro Ambulance'], 
      created: 2, 
      requestedAgencies: ['Royal Ambulance Victoria', 'City Medical Response Unit'],
      queuedAgencyDetails: [
        { name: 'Western Metro Ambulance', specialism: 'Critical Care', ranking: 91, location: 'Carlton, VIC', placements: 15 },
      ],
      agencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Critical Care', ranking: 93, location: 'Melbourne, VIC', placements: 17 },
        { name: 'Northern Emergency Care', specialism: 'Critical Care', ranking: 85, location: 'Brunswick, VIC', placements: 9 },
      ]
    },
    { 
      name: 'Sophie Anderson (AVSTUQ021)', 
      details: '15 Days Clinical Practice', 
      block: 'April Block', 
      period: '15/04/2024 - 30/04/2024', 
      specialism: 'Community Paramedic', 
      location: 'Footscray, VIC', 
      queue: 1, 
      agencies: ['Metropolitan Health Network', 'South Eastern Paramedic Services', 'Northern Emergency Care'], 
      created: 1, 
      requestedAgencies: [],
      queuedAgencyDetails: [
        { name: 'Metropolitan Health Network', specialism: 'Community Paramedic', ranking: 88, location: 'Brunswick, VIC', placements: 12 },
        { name: 'South Eastern Paramedic Services', specialism: 'Community Paramedic', ranking: 84, location: 'Footscray, VIC', placements: 10 },
        { name: 'Northern Emergency Care', specialism: 'Community Paramedic', ranking: 80, location: 'Brunswick, VIC', placements: 8 },
      ],
      agencyDetails: [
        { name: 'City Medical Response Unit', specialism: 'Community Paramedic', ranking: 86, location: 'Melbourne, VIC', placements: 11 },
      ]
    },
  ]);

  // Computed values for Bulk Add Agency Side Sheet
  const bulkSelectedStudentsList = students.filter((_, idx) => selectedStudents.has(idx));
  const bulkUniqueAgencies = new Set(bulkSelectedStudentsList.flatMap(s => s.agencies));
  const bulkSampleStudent = students.find((_, idx) => selectedStudents.has(idx)) || students[0];

  // Computed values for Create Request Side Sheet
  const createRequestSelectedStudentsList = students.filter((_, idx) => selectedStudents.has(idx));
  const createRequestPlacementBlocks = createRequestSelectedStudentsList.reduce((acc, student) => {
    const blockKey = `${student.block} (${student.period})`;
    if (!acc[blockKey]) {
      acc[blockKey] = [];
    }
    acc[blockKey].push(student);
    return acc;
  }, {} as Record<string, typeof students>);
  
  // Count data from all blocks for Request Summary
  const checkedBlocksStudents = createRequestSelectedStudentsList;
  const createRequestUniqueAgencies = new Set(checkedBlocksStudents.flatMap(s => s.agencies));
  const createRequestTotalRequests = checkedBlocksStudents.reduce((sum, s) => sum + s.agencies.length, 0);
  const checkedBlocksCount = Object.keys(createRequestPlacementBlocks).length;


  // Calculate experience, duration, and unit of measure based on selected students
  let requestExperience = 'General';
  let requestDuration = '0';
  let requestUnitOfMeasure = 'Hour';
  
  if (createRequestSelectedStudentsList.length === 1) {
    // Single student selected - use their details
    const studentDetails = createRequestSelectedStudentsList[0].details;
    requestExperience = studentDetails;
    
    // Extract duration and unit from details string (e.g., "12 Days On-Road Emergency")
    const match = studentDetails.match(/^(\d+)\s+(Days?|Hours?|Weeks?)/i);
    if (match) {
      requestDuration = match[1];
      const unit = match[2].toLowerCase();
      if (unit.startsWith('day')) requestUnitOfMeasure = 'Day';
      else if (unit.startsWith('hour')) requestUnitOfMeasure = 'Hour';
      else if (unit.startsWith('week')) requestUnitOfMeasure = 'Week';
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="bottom-right" />
      <Header />
      
      {/* Page Title */}
      <div className="bg-[#0b5f7c] text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl">Request Manager</h1>
        <button className="text-sm underline">
          Switch to Classic Request Manager <ChevronRight className="inline w-4 h-4" />
        </button>
      </div>

      <div className="p-4 max-w-[2560px] mx-auto">
        {/* Criteria Section */}
        <div className="bg-white border border-gray-300 p-4 mb-4">
          <h2 className="text-sm mb-3">CRITERIA</h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="flex gap-4 mb-4">
                <div className="w-[255px]">
                  <label className="block text-xs mb-1">Academic Year Beginning</label>
                  <select className="w-full border border-gray-300 px-2 py-1 text-sm">
                    <option>All</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1">
                    Discipline <span className="text-blue-600">(?)</span>
                  </label>
                  <select className="w-full border border-gray-300 px-2 py-1 text-sm">
                    <option>Paramedicine</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-1 bg-[#428bca] text-white text-sm">
                  Allocation Group
                </button>
                <button className="px-4 py-1 bg-gray-200 text-gray-700 text-sm">
                  Action Group
                </button>
                <select className="flex-1 border border-gray-300 px-2 py-1 text-sm">
                  <option>2024 - Paramedicine - 1st Semester Placements - SB</option>
                </select>
                <button className="px-6 py-1 bg-[#428bca] text-white text-sm">
                  Reset
                </button>
              </div>
            </div>

            {/* Right Column - Allocation Info */}
            <div>
              <div className="mb-2">
                <span className="text-sm">Allocation / Action Group:</span>
                <div className="text-blue-600 text-sm">
                  2024 - Paramedicine - 1st Semester Placements - SB
                </div>
              </div>
              <div>
                <span className="text-sm">Requirements:</span>
                <div className="text-sm">On-Road Emergency - 60 Days</div>
                <div className="text-sm">Clinical Practice - 30 Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex gap-1 mb-4">
          <PlacementChart />
          <PlacementBlocks />
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-300">
          <div className="grid grid-cols-4 border-b border-gray-300">
            <button className="px-4 py-2 text-sm text-center bg-gray-100 border-r border-gray-300">
              Placement Block Allocation
            </button>
            <button className="px-4 py-2 text-sm text-center bg-gray-100 border-r border-gray-300 border-t-4 border-t-[#428bca]">
              Plan & Create Request
            </button>
            <button className="px-4 py-2 text-sm text-center bg-gray-100 border-r border-gray-300">
              Send Request
            </button>
            <button className="px-4 py-2 text-sm text-center bg-gray-100">
              Process Responses
            </button>
          </div>

          {/* Table Controls */}
          <div className="p-3 border-b border-gray-300 flex items-center justify-between">
            <div className="relative" ref={bulkActionRef}>
              <button 
                className="px-4 py-1 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                onClick={() => setShowBulkActionDropdown(!showBulkActionDropdown)}
              >
                Bulk Action <span className="text-xs">▼</span>
              </button>
              {showBulkActionDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 shadow-lg z-50 min-w-[160px]">
                  <button
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${selectedStudents.size === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                    onClick={() => {
                      if (selectedStudents.size > 0) {
                        setShowCreateRequestSheet(true);
                        setShowBulkActionDropdown(false);
                      }
                    }}
                    disabled={selectedStudents.size === 0}
                  >
                    Create Request
                  </button>
                  <button
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${selectedStudents.size <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                    onClick={() => {
                      if (selectedStudents.size > 1) {
                        setShowBulkAddAgencySheet(true);
                        setShowBulkActionDropdown(false);
                      }
                    }}
                    disabled={selectedStudents.size <= 1}
                  >
                    Add Agency
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  className="px-4 py-2 bg-[rgb(3,98,25)] text-white rounded text-sm flex items-center gap-2"
                  onClick={() => {
                    setAutoMatchStudent(null);
                    setTrialMatchSource('main');
                    setShowTrialMatchModal(true);
                  }}
                >
                  <Target className="w-4 h-4" />
                  Trial Match
                </button>
                
                {/* Tooltip Bubble */}
                {showTrialMatchHelper && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[320px] z-50">
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-lg">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowTrialMatchHelper(false)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-start gap-3 pr-6">
                        <div className="flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-[#f59e0b]" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-bold text-[rgb(36,114,196)] text-sm">Smart Matching Available</h3>
                          <p className="text-xs text-gray-700">
                            Trial Match saves time and ensures optimal allocation to suitable Agencies, using your customised ruleset criteria.
                          </p>
                        </div>
                      </div>
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px]">
                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-300"></div>
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-50 absolute top-[-8px] left-1/2 -translate-x-1/2"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button className="px-4 py-1 bg-white text-[#428bca] border border-gray-300 rounded text-sm hover:bg-gray-50">
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left w-8">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.size === students.length}
                      onChange={toggleAllStudents}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Student <span className="text-xs">▼</span></th>
                  {mainColumnVisibility.placementBlock && <th className="px-3 py-2 text-left">Placement Block</th>}
                  {mainColumnVisibility.specialism && <th className="px-3 py-2 text-left">Specialism</th>}
                  {mainColumnVisibility.location && <th className="px-3 py-2 text-left">Location</th>}
                  {mainColumnVisibility.requestQueue && <th className="px-3 py-2 text-left">Request Queue</th>}
                  {mainColumnVisibility.draftRequest && <th className="px-3 py-2 text-left">Draft Request</th>}
                  {mainColumnVisibility.sent && <th className="px-3 py-2 text-left">Sent</th>}
                  {mainColumnVisibility.agenciesRequested && <th className="px-3 py-2 text-left">Agencies Requested</th>}
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left w-10">
                    <div className="relative" ref={mainSettingsRef}>
                      <button 
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={() => setShowMainColumnSettings(!showMainColumnSettings)}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {showMainColumnSettings && (
                        <div className="fixed bg-white border border-gray-300 shadow-lg rounded p-3 z-[1000] w-56" style={{
                          top: `${mainSettingsRef.current?.getBoundingClientRect().bottom ?? 0}px`,
                          right: `${window.innerWidth - (mainSettingsRef.current?.getBoundingClientRect().right ?? 0)}px`
                        }}>
                          <div className="text-sm mb-2">Show/Hide Columns</div>
                          <div className="flex flex-col gap-2">
                            {Object.entries({
                              placementBlock: 'Placement Block',
                              specialism: 'Specialism',
                              location: 'Location',
                              requestQueue: 'Request Queue',
                              draftRequest: 'Draft Request',
                              sent: 'Sent',
                              agenciesRequested: 'Agencies Requested',
                            }).map(([key, label]) => (
                              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                                <input
                                  type="checkbox"
                                  checked={mainColumnVisibility[key as keyof typeof mainColumnVisibility]}
                                  onChange={() => toggleMainColumn(key as keyof typeof mainColumnVisibility)}
                                  className="cursor-pointer"
                                />
                                <span>{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.flatMap((student, index) => {
                  const rows = [
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.has(index)}
                          onChange={() => toggleStudent(index)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button 
                            className="p-1 hover:bg-gray-200 rounded"
                            onClick={() => toggleRow(index)}
                          >
                            {expandedRows.has(index) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <div className="text-blue-600">{student.name}</div>
                            <div className="text-xs text-gray-600">{student.details}</div>
                          </div>
                        </div>
                      </td>
                      {mainColumnVisibility.placementBlock && (
                        <td className="px-3 py-2">
                          <div>{student.block}</div>
                          <div className="text-xs text-gray-600">{student.period}</div>
                        </td>
                      )}
                      {mainColumnVisibility.specialism && <td className="px-3 py-2 text-gray-700">{student.specialism}</td>}
                      {mainColumnVisibility.location && <td className="px-3 py-2 text-gray-700">{student.location}</td>}
                      {mainColumnVisibility.requestQueue && <td className="px-3 py-2 text-center">{student.agencies.length}</td>}
                      {mainColumnVisibility.draftRequest && (
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {student.agencies.map((agency, agencyIndex) => (
                              <span 
                                key={agencyIndex}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {agency}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                      {mainColumnVisibility.sent && <td className="px-3 py-2 text-center">{student.requestedAgencies.length}</td>}
                      {mainColumnVisibility.agenciesRequested && (
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {student.requestedAgencies.map((agency, agencyIndex) => (
                              <span 
                                key={agencyIndex}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {agency}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <div className="relative" ref={(el) => actionDropdownRefs.current[`main-${index}`] = el}>
                          <button 
                            className="px-3 py-1 text-sm text-blue-600 bg-white border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center gap-1 whitespace-nowrap"
                            onClick={() => {
                              setOpenActionDropdown(openActionDropdown === `main-${index}` ? null : `main-${index}`);
                            }}
                          >
                            Action <span className="text-xs">▼</span>
                          </button>
                          {openActionDropdown === `main-${index}` && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[160px]">
                              <button
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-b border-gray-200"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setSelectedAgencies(new Map());
                                  setShowAgencySheet(true);
                                  setOpenActionDropdown(null);
                                }}
                              >
                                Add Agency
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-b border-gray-200"
                                onClick={() => {
                                  setAutoMatchStudent(student);
                                  setTrialMatchSource('main');
                                  setShowTrialMatchModal(true);
                                  setOpenActionDropdown(null);
                                }}
                              >
                                Run Auto-Match
                              </button>
                              <button
                                disabled={student.queuedAgencyDetails.length === 0}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  student.queuedAgencyDetails.length === 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => {
                                  if (student.queuedAgencyDetails.length === 0) return;
                                  
                                  // Clear all queued agencies for this student
                                  setStudents(prevStudents => {
                                    return prevStudents.map(s => {
                                      if (s.name === student.name) {
                                        return {
                                          ...s,
                                          agencies: [],
                                          queuedAgencyDetails: [],
                                          agencyDetails: [...s.agencyDetails, ...s.queuedAgencyDetails]
                                        };
                                      }
                                      return s;
                                    });
                                  });
                                  
                                  // Update selectedStudent if it matches
                                  if (selectedStudent?.name === student.name) {
                                    setSelectedStudent(prev => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        agencies: [],
                                        queuedAgencyDetails: [],
                                        agencyDetails: [...prev.agencyDetails, ...prev.queuedAgencyDetails]
                                      };
                                    });
                                  }
                                  
                                  toast.success('Queue cleared for ' + student.name.split(' (')[0], {
                                    position: 'top-right',
                                    icon: <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  });
                                  setOpenActionDropdown(null);
                                }}
                              >
                                Clear Shortlisted Agencies
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2"></td>
                    </tr>
                  ];
                  
                  if (expandedRows.has(index)) {
                    rows.push(
                      <tr key={`expanded-${index}`}>
                        <td colSpan={11} className="bg-gray-50 p-0">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm">Planned Agencies</h4>
                              <button 
                                className="px-3 py-1 bg-[#428bca] text-white rounded hover:bg-[#357ebd] text-sm inline-flex items-center gap-1"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setSelectedAgencies(new Map());
                                  setShowAgencySheet(true);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                                Add Agency
                              </button>
                            </div>
                            <div className="bg-white border border-gray-300 rounded overflow-visible">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b border-gray-300">
                                  <tr>
                                    {nestedColumnVisibility.agency && <th className="px-3 py-2 text-left">Agency</th>}
                                    {nestedColumnVisibility.specialism && <th className="px-3 py-2 text-left">Specialism</th>}
                                    {nestedColumnVisibility.ranking && <th className="px-3 py-2 text-left">Ranking</th>}
                                    {nestedColumnVisibility.location && <th className="px-3 py-2 text-left">Location</th>}
                                    {nestedColumnVisibility.action && <th className="px-3 py-2 text-left">Action</th>}
                                    <th className="px-3 py-2 text-left w-10 relative">
                                      <div ref={nestedSettingsRef}>
                                        <button 
                                          onClick={() => setShowNestedColumnSettings(!showNestedColumnSettings)}
                                          className="hover:bg-gray-200 p-1 rounded"
                                        >
                                          <Settings className="w-4 h-4" />
                                        </button>
                                        {showNestedColumnSettings && (
                                          <div className="fixed bg-white border border-gray-300 shadow-lg rounded p-3 z-[1000] w-56" style={{
                                            top: `${nestedSettingsRef.current?.getBoundingClientRect().bottom ?? 0}px`,
                                            right: `${window.innerWidth - (nestedSettingsRef.current?.getBoundingClientRect().right ?? 0)}px`
                                          }}>
                                            <div className="text-sm mb-2">Show/Hide Columns</div>
                                            <div className="flex flex-col gap-2">
                                              {Object.entries({
                                                agency: 'Agency',
                                                specialism: 'Specialism',
                                                ranking: 'Ranking',
                                                location: 'Location',
                                                action: 'Action',
                                              }).map(([key, label]) => (
                                                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                                                  <input
                                                    type="checkbox"
                                                    checked={nestedColumnVisibility[key as keyof typeof nestedColumnVisibility]}
                                                    onChange={() => toggleNestedColumn(key as keyof typeof nestedColumnVisibility)}
                                                    className="cursor-pointer"
                                                  />
                                                  <span>{label}</span>
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {student.queuedAgencyDetails.filter(agency => selectedAgencies.get(agency.name) !== 'exclude').map((agency, agencyIndex) => (
                                    <tr key={agencyIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                      {nestedColumnVisibility.agency && <td className="px-3 py-2 text-blue-600">{agency.name}</td>}
                                      {nestedColumnVisibility.specialism && (
                                        <td className="px-3 py-2">
                                          <div className="relative">
                                            <div className="border border-gray-300 rounded px-2 py-1 min-h-[32px] flex flex-wrap items-center gap-1 bg-white">
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-700 text-white rounded text-xs">
                                                {agency.specialism}
                                                <button 
                                                  className="hover:bg-green-800 rounded"
                                                  onClick={() => console.log(`Remove ${agency.specialism}`)}
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </span>
                                              <input
                                                type="text"
                                                placeholder="Search..."
                                                className="flex-1 min-w-[60px] text-xs outline-none bg-transparent"
                                              />
                                            </div>
                                          </div>
                                        </td>
                                      )}
                                      {nestedColumnVisibility.ranking && (
                                        <td className="px-3 py-2">
                                          <button
                                            className="text-blue-600 hover:underline cursor-pointer text-sm"
                                            onClick={() => {
                                              setSelectedRanking(agency.ranking);
                                              setSelectedAgencyName(agency.name);
                                              setSelectedStudentName(student.name);
                                              setShowMatchBreakdown(true);
                                            }}
                                          >
                                            {agency.ranking}
                                          </button>
                                        </td>
                                      )}
                                      {nestedColumnVisibility.location && <td className="px-3 py-2 text-gray-700">{agency.location}</td>}
                                      {nestedColumnVisibility.action && (
                                        <td className="px-3 py-2">
                                          <div className="relative" ref={(el) => actionDropdownRefs.current[`nested-${index}-${agencyIndex}`] = el}>
                                            <button 
                                              className="px-3 py-1 text-xs text-blue-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                              onClick={() => {
                                                setOpenActionDropdown(openActionDropdown === `nested-${index}-${agencyIndex}` ? null : `nested-${index}-${agencyIndex}`);
                                              }}
                                            >
                                              Action <span className="text-xs">▼</span>
                                            </button>
                                            {openActionDropdown === `nested-${index}-${agencyIndex}` && (
                                              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-[100] min-w-[180px]">
                                                <button
                                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-b border-gray-200"
                                                  onClick={() => {
                                                    console.log('Create Request Details for', agency.name);
                                                    toast.success('Creating request details for ' + agency.name);
                                                    setOpenActionDropdown(null);
                                                  }}
                                                >
                                                  Create Request Details
                                                </button>
                                                <button
                                                  className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed border-b border-gray-200"
                                                  disabled
                                                >
                                                  Edit Request Details
                                                </button>
                                                <button
                                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                  onClick={() => {
                                                    // Remove from queue and move back to available agencies
                                                    setStudents(prevStudents => {
                                                      return prevStudents.map(s => {
                                                        if (s.name === student.name) {
                                                          return {
                                                            ...s,
                                                            agencies: s.agencies.filter(a => a !== agency.name),
                                                            queuedAgencyDetails: s.queuedAgencyDetails.filter(a => a.name !== agency.name),
                                                            agencyDetails: [...s.agencyDetails, agency]
                                                          };
                                                        }
                                                        return s;
                                                      });
                                                    });
                                                    
                                                    // Update selectedStudent if it matches
                                                    if (selectedStudent?.name === student.name) {
                                                      setSelectedStudent(prev => {
                                                        if (!prev) return prev;
                                                        return {
                                                          ...prev,
                                                          agencies: prev.agencies.filter(a => a !== agency.name),
                                                          queuedAgencyDetails: prev.queuedAgencyDetails.filter(a => a.name !== agency.name),
                                                          agencyDetails: [...prev.agencyDetails, agency]
                                                        };
                                                      });
                                                    }
                                                    
                                                    // Remove from selected agencies if it was selected
                                                    setSelectedAgencies(prev => {
                                                      const newSet = new Set(prev);
                                                      newSet.delete(agency.name);
                                                      return newSet;
                                                    });
                                                    
                                                    toast.success(agency.name + ' removed from queue', {
                                                      position: 'top-right',
                                                      icon: <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    });
                                                    setOpenActionDropdown(null);
                                                  }}
                                                >
                                                  Remove from Queue
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                      )}
                                      <td className="px-3 py-2"></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  
                  return rows;
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 flex items-center justify-between border-t border-gray-300">
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border border-gray-300 text-sm hover:bg-gray-50">«</button>
              <button className="px-2 py-1 border border-gray-300 text-sm hover:bg-gray-50">‹</button>
              <button className="px-3 py-1 bg-[#428bca] text-white text-sm">1</button>
              <button className="px-2 py-1 border border-gray-300 text-sm hover:bg-gray-50">›</button>
              <button className="px-2 py-1 border border-gray-300 text-sm hover:bg-gray-50">»</button>
              <span className="text-sm text-gray-600 ml-2">40 items per page</span>
            </div>
            <div className="text-sm text-gray-600">
              1 - 11 of 11 items
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-600">
          <div>
            InPlace Software - Smart Placement Solutions by Quantum IT - Copyright 2009 - 2025 - Acceptable Use & Privacy Notice
          </div>
        </div>
      </div>

      {/* Trial Match Side Sheet */}
      {showTrialMatchModal && (
        <div className="fixed inset-0 z-[2000] flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowTrialMatchModal(false);
              setRulesetModified(false);
            }}
          />
          
          {/* Side Sheet */}
          <div className="ml-auto relative w-full max-w-[800px] bg-white shadow-xl flex flex-col h-full">
            {/* Header */}
            <div className="bg-[#0b5f7c] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg">Run Trial Match</h2>
              <button 
                onClick={() => {
                  setShowTrialMatchModal(false);
                  setRulesetModified(false);
                }}
                className="hover:bg-[#084d63] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Summary Card - Only show when triggered from main screen with no selections */}
              {!autoMatchStudent && selectedStudents.size === 0 && (
                <div className="mb-6 bg-[#eff6ff] border-2 border-[#428bca] rounded-lg p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 self-center">
                    <Users className="w-8 h-8 text-[#428bca]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl text-[#428bca]">11</span>
                      <div className="flex items-baseline gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 bg-[#428bca] text-white rounded text-sm">All</span>
                        <span className="font-bold text-[#428bca]">student experience requirements</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">Trial Match will search for agencies across all experience requirements in this cohort</p>
                  </div>
                </div>
              )}

              {/* Student Info Card - Show when exactly 1 student is selected OR when Run Auto-Match is clicked */}
              {((!autoMatchStudent && selectedStudents.size === 1) || autoMatchStudent) && (
                <div className="mb-6">
                  <h3 className="text-sm mb-3">Student Details</h3>
                  <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-blue-600">{(autoMatchStudent || students[Array.from(selectedStudents)[0]]).name}</div>
                      {(autoMatchStudent || students[Array.from(selectedStudents)[0]]).location && (
                        <div className="text-sm text-gray-700">{(autoMatchStudent || students[Array.from(selectedStudents)[0]]).location}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{(autoMatchStudent || students[Array.from(selectedStudents)[0]]).details}</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Placement Block:</span>
                        <div>{(autoMatchStudent || students[Array.from(selectedStudents)[0]]).block}</div>
                        <div className="text-xs text-gray-500">{(autoMatchStudent || students[Array.from(selectedStudents)[0]]).period}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Specialism:</span>
                        <div>{(autoMatchStudent || students[Array.from(selectedStudents)[0]]).specialism}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Card - Show when multiple students are selected */}
              {!autoMatchStudent && selectedStudents.size > 1 && (
                <div className="mb-6 bg-[#eff6ff] border-2 border-[#3b82f6] rounded-lg p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 self-center">
                    <Users className="w-8 h-8 text-[#3b82f6]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl text-[#3b82f6]">{selectedStudents.size}</span>
                      <span className="font-bold text-[#3b82f6]">student experience requirements selected</span>
                    </div>
                    <p className="text-sm text-gray-700">Trial Match will find suitable agencies for these experience requirements</p>
                  </div>
                </div>
              )}

              {/* Auto-queue Toggle */}
              <div className="mb-6 pb-6 border-b border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <Switch 
                    checked={autoQueueEnabled}
                    onCheckedChange={setAutoQueueEnabled}
                  />
                  <label className="text-sm flex-1">
                    Automatically plan top-ranked agencies <span className="text-gray-500 text-xs font-normal">- disable to manually review rankings</span>
                  </label>
                </div>
                
                {/* Auto-queue Limit */}
                <div className="flex items-center gap-3 ml-11">
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={autoQueueLimit}
                    onChange={(e) => setAutoQueueLimit(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-20 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <label className="text-sm text-gray-700">
                    Requests per student limit
                  </label>
                </div>
              </div>

              {/* Select Ruleset */}
              <div className="mb-6">
                <label className="text-sm block mb-2">Select Ruleset <span className="text-red-600">*</span></label>
                <select 
                  className={`w-full rounded px-3 py-2 text-sm ${
                    rulesetError 
                      ? 'border-2 border-red-600' 
                      : 'border border-gray-300'
                  }`}
                  value={selectedRuleset}
                  onChange={(e) => {
                    setSelectedRuleset(e.target.value);
                    setRulesetModified(false);
                    if (e.target.value) {
                      setRulesetError(false);
                    }
                  }}
                >
                  <option value="">Choose a ruleset...</option>
                  <option value="ruleset1">Ruleset 1</option>
                  <option value="ruleset2">Ruleset 2</option>
                  <option value="ruleset3">Ruleset 3</option>
                </select>

                {/* Ruleset Details Table */}
                {selectedRuleset && (
                  <>
                    {/* Ruleset Title */}
                    <h3 className="text-base mt-4 mb-3">
                      {selectedRuleset.replace('ruleset', 'Ruleset ')}
                    </h3>
                    
                    <div className="border border-gray-300 rounded overflow-visible">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-gray-300">
                          <tr>
                            <th className="px-3 py-2 text-left">Rules</th>
                            <th className="px-3 py-2 text-left">Weight</th>
                            <th className="px-3 py-2 text-left">Active</th>
                            <th className="px-3 py-2 text-left w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <span className="text-gray-700">Location (Public Transport Travel Time is greater than or equal to 00:30</span>
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={25}
                                className="w-20 border border-gray-300 rounded px-3 py-1 text-sm"
                                onChange={() => setRulesetModified(true)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Switch defaultChecked={true} onCheckedChange={() => setRulesetModified(true)} />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => {
                                  setRulesetRules(prev => prev.filter((_, i) => i !== 0));
                                  setRulesetModified(true);
                                  toast.success('Rule deleted');
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                                title="Delete rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <span className="text-gray-700">Placement History: Student has never had a placement at this agency</span>
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={30}
                                className="w-20 border border-gray-300 rounded px-3 py-1 text-sm"
                                onChange={() => setRulesetModified(true)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Switch defaultChecked={true} onCheckedChange={() => setRulesetModified(true)} />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => {
                                  setRulesetRules(prev => prev.filter((_, i) => i !== 1));
                                  setRulesetModified(true);
                                  toast.success('Rule deleted');
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                                title="Delete rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <span className="text-gray-700">Student Prior Requests: Student has had a request at this agency before</span>
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={20}
                                className="w-20 border border-gray-300 rounded px-3 py-1 text-sm"
                                onChange={() => setRulesetModified(true)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Switch defaultChecked={true} onCheckedChange={() => setRulesetModified(true)} />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => {
                                  setRulesetRules(prev => prev.filter((_, i) => i !== 2));
                                  setRulesetModified(true);
                                  toast.success('Rule deleted');
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                                title="Delete rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <span className="text-gray-700">Student Specialisms is same as Agency Specialisms</span>
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={25}
                                className="w-20 border border-gray-300 rounded px-3 py-1 text-sm"
                                onChange={() => setRulesetModified(true)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Switch defaultChecked={true} onCheckedChange={() => setRulesetModified(true)} />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => {
                                  setRulesetRules(prev => prev.filter((_, i) => i !== 3));
                                  setRulesetModified(true);
                                  toast.success('Rule deleted');
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                                title="Delete rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          {rulesetRules.slice(4).map((rule, index) => (
                            <tr key={index + 4} className="border-b border-gray-200">
                              <td className="px-3 py-2">
                                {rule.isNew ? (
                                  <div className="relative" ref={showRuleSuggestions === index ? ruleSuggestionsRef : null}>
                                    <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                      type="text"
                                      placeholder="Search Rule"
                                      value={rule.rule}
                                      className="w-full border border-gray-300 rounded px-3 py-1 pl-8 text-sm"
                                      onFocus={() => setShowRuleSuggestions(index)}
                                      onChange={(e) => {
                                        setRulesetRules(prev => prev.map((r, i) => 
                                          i === index + 4 ? { ...r, rule: e.target.value } : r
                                        ));
                                      }}
                                    />
                                    {showRuleSuggestions === index && (
                                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                                        {ruleSuggestions.map((suggestion, suggestionIndex) => (
                                          <div
                                            key={suggestionIndex}
                                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                            onClick={() => {
                                              setRulesetRules(prev => prev.map((r, i) => 
                                                i === index + 4 ? { ...r, rule: suggestion } : r
                                              ));
                                              setShowRuleSuggestions(null);
                                            }}
                                          >
                                            {suggestion}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-700">{rule.rule}</span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={rule.weight}
                                  onChange={(e) => {
                                    setRulesetRules(prev => prev.map((r, i) => 
                                      i === index + 4 ? { ...r, weight: e.target.value } : r
                                    ));
                                    setRulesetModified(true);
                                  }}
                                  className="w-20 border border-gray-300 rounded px-3 py-1 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Switch 
                                  checked={rule.active}
                                  onCheckedChange={(checked) => {
                                    setRulesetRules(prev => prev.map((r, i) => 
                                      i === index + 4 ? { ...r, active: checked } : r
                                    ));
                                    setRulesetModified(true);
                                  }}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => {
                                    setRulesetRules(prev => prev.filter((_, i) => i !== index + 4));
                                    setRulesetModified(true);
                                    toast.success('Rule deleted');
                                  }}
                                  className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                                  title="Delete rule"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Add Rule Button */}
                    <div className="mt-3">
                      <button 
                        className="px-4 py-2 bg-white text-[#428bca] border border-gray-300 rounded hover:bg-blue-50 text-sm inline-flex items-center gap-2"
                        onClick={() => {
                          setRulesetRules(prev => [...prev, {
                            rule: '',
                            expression: '',
                            weight: '',
                            active: true,
                            isNew: true
                          }]);
                          setRulesetModified(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Rule
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 px-6 py-4 bg-gray-50 flex items-center justify-between gap-2">
              {/* Left side - Cancel link */}
              <a 
                href="#"
                className="text-sm text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTrialMatchModal(false);
                  setRulesetModified(false);
                }}
              >
                Cancel
              </a>

              {/* Right side - Action buttons */}
              <div className="flex items-center gap-2">
                {/* Save buttons - only show when ruleset is modified */}
                {selectedRuleset && rulesetModified && (
                  <>
                    <button 
                      className="px-4 py-2 bg-white text-[#428bca] border border-gray-300 rounded hover:bg-blue-50 text-sm"
                      onClick={() => {
                        setRulesetModified(false);
                        toast.success('Ruleset saved');
                      }}
                    >
                      Save
                    </button>
                    <button 
                      className="px-4 py-2 bg-white text-[#428bca] border border-gray-300 rounded hover:bg-blue-50 text-sm"
                      onClick={() => {
                        const currentRuleset = selectedRuleset.replace('ruleset', 'Ruleset ');
                        setSaveAsRulesetName(`Copy of ${currentRuleset}`);
                        setShowSaveAsModal(true);
                      }}
                    >
                      Save As
                    </button>
                  </>
                )}
                <button 
                  className="px-4 py-2 bg-white text-[#428bca] border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  onClick={() => {
                    // Validate that a ruleset is selected
                    if (!selectedRuleset) {
                      setRulesetError(true);
                      return;
                    }
                    
                    // If triggered from "Run Auto-Match" action, only clear that student's queue
                    if (autoMatchStudent) {
                      const studentToClear = autoMatchStudent;
                      
                      // Get the requests per student limit
                      const limitSelect = document.querySelector('select.w-16') as HTMLSelectElement;
                      const requestLimit = parseInt(limitSelect?.value || '2');
                      
                      // Clear this student's queue
                      setStudents(prevStudents => {
                        return prevStudents.map(student => {
                          if (student.name === studentToClear.name) {
                            // Clear only this student's queue
                            return {
                              ...student,
                              agencies: [],
                              queuedAgencyDetails: [],
                              agencyDetails: [...student.agencyDetails, ...student.queuedAgencyDetails]
                            };
                          }
                          return student;
                        });
                      });
                      
                      setShowTrialMatchModal(false);
                      setShowAgencySheet(false);
                      
                      // Schedule adding agencies after 5 seconds
                      setTimeout(() => {
                        setStudents(prevStudents => {
                          return prevStudents.map(student => {
                            if (student.name === studentToClear.name) {
                              const agenciesToQueue = student.agencyDetails.slice(0, requestLimit);
                              const remainingAgencies = student.agencyDetails.slice(requestLimit);
                              
                              return {
                                ...student,
                                agencies: agenciesToQueue.map(a => a.name),
                                queuedAgencyDetails: agenciesToQueue,
                                agencyDetails: remainingAgencies
                              };
                            }
                            return student;
                          });
                        });
                      }, 5000);
                      
                      // Show custom notification popup with processing state
                      const now = new Date();
                      const timestamp = now.toLocaleString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }).replace(',', '');
                      
                      toast.custom((t) => {
                        const ClearQueueToast = () => {
                          const [isProcessing, setIsProcessing] = useState(true);
                          
                          useEffect(() => {
                            const timer = setTimeout(() => {
                              setIsProcessing(false);
                            }, 5000);
                            
                            return () => clearTimeout(timer);
                          }, []);
                          
                          return (
                            <div className="bg-white border border-gray-400 rounded shadow-lg w-[320px]">
                              {/* Header */}
                              <div className="bg-[#0b5f7c] text-white px-3 py-2 flex items-center justify-between rounded-t">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Notifications</span>
                                  <button className="text-white hover:bg-[#084d63] rounded px-1">
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => toast.dismiss(t)}
                                  className="text-white hover:bg-[#084d63] rounded p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Content */}
                              <div className="px-3 py-2 border-b border-gray-200">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-1">
                                    {isProcessing ? (
                                      <Hourglass className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    )}
                                    <span className="text-sm">{isProcessing ? 'Trial Match Processing' : 'Trial Match Complete'}</span>
                                  </div>
                                  <button
                                    onClick={() => toast.dismiss(t)}
                                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  {!isProcessing && (
                                    <a 
                                      href="#" 
                                      className="text-sm text-blue-600 hover:underline"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        toast.dismiss(t);
                                        // Get the updated student from current state
                                        setStudents(currentStudents => {
                                          const updatedStudent = currentStudents.find(s => s.name === studentToClear.name);
                                          if (updatedStudent) {
                                            setSelectedStudent(updatedStudent);
                                            setSelectedAgencies(new Map());
                                            setShowAgencySheet(true);
                                          }
                                          return currentStudents;
                                        });
                                      }}
                                    >
                                      View Results
                                    </a>
                                  )}
                                  <span className="text-xs text-gray-500">{timestamp}</span>
                                </div>
                              </div>
                            </div>
                          );
                        };
                        
                        return <ClearQueueToast />;
                      }, {
                        duration: 10000,
                      });
                    } else if (selectedStudents.size > 0) {
                      // If students are selected, only process those students
                      // Get the requests per student limit
                      const limitSelect = document.querySelector('select.w-16') as HTMLSelectElement;
                      const requestLimit = parseInt(limitSelect?.value || '2');
                      
                      // Clear queues only from selected students
                      setStudents(prevStudents => {
                        return prevStudents.map((student, index) => {
                          if (selectedStudents.has(index)) {
                            return {
                              ...student,
                              agencies: [],
                              queuedAgencyDetails: [],
                              agencyDetails: [...student.agencyDetails, ...student.queuedAgencyDetails]
                            };
                          }
                          return student;
                        });
                      });
                      
                      setShowTrialMatchModal(false);
                      setShowAgencySheet(false);
                      
                      // Schedule adding agencies after 5 seconds
                      setTimeout(() => {
                        setStudents(prevStudents => {
                          return prevStudents.map((student, index) => {
                            if (selectedStudents.has(index)) {
                              const agenciesToQueue = student.agencyDetails.slice(0, requestLimit);
                              const remainingAgencies = student.agencyDetails.slice(requestLimit);
                              
                              return {
                                ...student,
                                agencies: agenciesToQueue.map(a => a.name),
                                queuedAgencyDetails: agenciesToQueue,
                                agencyDetails: remainingAgencies
                              };
                            }
                            return student;
                          });
                        });
                      }, 5000);
                      
                      // Show notification
                      const now = new Date();
                      const timestamp = now.toLocaleString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }).replace(',', '');
                      
                      toast.custom((t) => {
                        const ClearQueueToast = () => {
                          const [isProcessing, setIsProcessing] = useState(true);
                          
                          useEffect(() => {
                            const timer = setTimeout(() => {
                              setIsProcessing(false);
                            }, 5000);
                            
                            return () => clearTimeout(timer);
                          }, []);
                          
                          return (
                            <div className="bg-white border border-gray-400 rounded shadow-lg w-[320px]">
                              {/* Header */}
                              <div className="bg-[#0b5f7c] text-white px-3 py-2 flex items-center justify-between rounded-t">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Notifications</span>
                                  <button className="text-white hover:bg-[#084d63] rounded px-1">
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => toast.dismiss(t)}
                                  className="text-white hover:bg-[#084d63] rounded p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Content */}
                              <div className="px-3 py-2 border-b border-gray-200">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-1">
                                    {isProcessing ? (
                                      <Hourglass className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    )}
                                    <span className="text-sm">{isProcessing ? 'Trial Match Processing' : 'Trial Match Complete'}</span>
                                  </div>
                                  <button
                                    onClick={() => toast.dismiss(t)}
                                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">{timestamp}</span>
                                </div>
                              </div>
                            </div>
                          );
                        };
                        
                        return <ClearQueueToast />;
                      }, {
                        duration: 10000,
                      });
                    } else {
                      // If triggered from main "Trial Match" button with no students selected
                      // Get the requests per student limit
                      const limitSelect = document.querySelector('select.w-16') as HTMLSelectElement;
                      const requestLimit = parseInt(limitSelect?.value || '2');
                      
                      // Clear all queues from all students
                      setStudents(prevStudents => {
                        return prevStudents.map(student => ({
                          ...student,
                          agencies: [],
                          queuedAgencyDetails: [],
                          agencyDetails: [...student.agencyDetails, ...student.queuedAgencyDetails]
                        }));
                      });
                      
                      setShowTrialMatchModal(false);
                      setShowAgencySheet(false);
                      
                      // Schedule adding agencies after 5 seconds
                      setTimeout(() => {
                        setStudents(prevStudents => {
                          return prevStudents.map(student => {
                            const agenciesToQueue = student.agencyDetails.slice(0, requestLimit);
                            const remainingAgencies = student.agencyDetails.slice(requestLimit);
                            
                            return {
                              ...student,
                              agencies: agenciesToQueue.map(a => a.name),
                              queuedAgencyDetails: agenciesToQueue,
                              agencyDetails: remainingAgencies
                            };
                          });
                        });
                      }, 5000);
                      
                      // Show notification
                      const now = new Date();
                      const timestamp = now.toLocaleString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }).replace(',', '');
                      
                      toast.custom((t) => {
                        const ClearQueueToast = () => {
                          const [isProcessing, setIsProcessing] = useState(true);
                          
                          useEffect(() => {
                            const timer = setTimeout(() => {
                              setIsProcessing(false);
                            }, 5000);
                            
                            return () => clearTimeout(timer);
                          }, []);
                          
                          return (
                            <div className="bg-white border border-gray-400 rounded shadow-lg w-[320px]">
                              {/* Header */}
                              <div className="bg-[#0b5f7c] text-white px-3 py-2 flex items-center justify-between rounded-t">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Notifications</span>
                                  <button className="text-white hover:bg-[#084d63] rounded px-1">
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => toast.dismiss(t)}
                                  className="text-white hover:bg-[#084d63] rounded p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Content */}
                              <div className="px-3 py-2 border-b border-gray-200">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-1">
                                    {isProcessing ? (
                                      <Hourglass className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    )}
                                    <span className="text-sm">{isProcessing ? 'Trial Match Processing' : 'Trial Match Complete'}</span>
                                  </div>
                                  <button
                                    onClick={() => toast.dismiss(t)}
                                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">{timestamp}</span>
                                </div>
                              </div>
                            </div>
                          );
                        };
                        
                        return <ClearQueueToast />;
                      }, {
                        duration: 10000,
                      });
                    }
                  }}
                >
                  Clear Planned & Run Trial Match
                </button>
                <button 
                  disabled={!selectedRuleset}
                  className={`px-4 py-2 rounded text-sm ${
                    selectedRuleset 
                      ? 'bg-[#428bca] text-white hover:bg-[#357ebd] cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    // Validate that a ruleset is selected
                    if (!selectedRuleset) {
                      setRulesetError(true);
                      return;
                    }
                    
                    const source = trialMatchSource;
                    
                    // Get the requests per student limit
                    const limitSelect = document.querySelector('select.w-16') as HTMLSelectElement;
                    const requestLimit = parseInt(limitSelect?.value || '2');
                    
                    // If auto-queue is enabled, schedule adding agencies after 5 seconds
                    if (autoQueueEnabled) {
                      if (autoMatchStudent) {
                        // For specific student from Run Auto-Match
                        const studentToMatch = autoMatchStudent;
                        setTimeout(() => {
                          setStudents(prevStudents => {
                            return prevStudents.map(student => {
                              if (student.name === studentToMatch.name) {
                                // Calculate how many more agencies need to be queued
                                const currentQueueCount = student.queuedAgencyDetails.length;
                                const needToQueue = Math.max(0, autoQueueLimit - currentQueueCount);
                                
                                if (needToQueue === 0) {
                                  // Already have enough queued, don't add more
                                  return student;
                                }
                                
                                const agenciesToQueue = student.agencyDetails.slice(0, needToQueue);
                                const remainingAgencies = student.agencyDetails.slice(needToQueue);
                                
                                return {
                                  ...student,
                                  agencies: [...student.agencies, ...agenciesToQueue.map(a => a.name)],
                                  queuedAgencyDetails: [...student.queuedAgencyDetails, ...agenciesToQueue],
                                  agencyDetails: remainingAgencies
                                };
                              }
                              return student;
                            });
                          });
                        }, 5000);
                      } else if (selectedStudents.size > 0) {
                        // For selected students
                        setTimeout(() => {
                          setStudents(prevStudents => {
                            return prevStudents.map((student, index) => {
                              if (selectedStudents.has(index)) {
                                // Calculate how many more agencies need to be queued
                                const currentQueueCount = student.queuedAgencyDetails.length;
                                const needToQueue = Math.max(0, autoQueueLimit - currentQueueCount);
                                
                                if (needToQueue === 0) {
                                  // Already have enough queued, don't add more
                                  return student;
                                }
                                
                                const agenciesToQueue = student.agencyDetails.slice(0, needToQueue);
                                const remainingAgencies = student.agencyDetails.slice(needToQueue);
                                
                                return {
                                  ...student,
                                  agencies: [...student.agencies, ...agenciesToQueue.map(a => a.name)],
                                  queuedAgencyDetails: [...student.queuedAgencyDetails, ...agenciesToQueue],
                                  agencyDetails: remainingAgencies
                                };
                              }
                              return student;
                            });
                          });
                        }, 5000);
                      } else {
                        // For all students
                        setTimeout(() => {
                          setStudents(prevStudents => {
                            return prevStudents.map(student => {
                              // Calculate how many more agencies need to be queued
                              const currentQueueCount = student.queuedAgencyDetails.length;
                              const needToQueue = Math.max(0, autoQueueLimit - currentQueueCount);
                              
                              if (needToQueue === 0) {
                                // Already have enough queued, don't add more
                                return student;
                              }
                              
                              const agenciesToQueue = student.agencyDetails.slice(0, needToQueue);
                              const remainingAgencies = student.agencyDetails.slice(needToQueue);
                              
                              return {
                                ...student,
                                agencies: [...student.agencies, ...agenciesToQueue.map(a => a.name)],
                                queuedAgencyDetails: [...student.queuedAgencyDetails, ...agenciesToQueue],
                                agencyDetails: remainingAgencies
                              };
                            });
                          });
                        }, 5000);
                      }
                    }
                    
                    setShowTrialMatchModal(false);
                    setShowAgencySheet(false);
                    const now = new Date();
                    const timestamp = now.toLocaleString('en-GB', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    }).replace(',', '');
                    
                    toast.custom((t) => {
                      const TrialMatchToast = () => {
                        const [isProcessing, setIsProcessing] = useState(true);
                        
                        useEffect(() => {
                          const timer = setTimeout(() => {
                            setIsProcessing(false);
                          }, 5000);
                          
                          return () => clearTimeout(timer);
                        }, []);
                        
                        return (
                          <div className="bg-white border border-gray-400 rounded shadow-lg w-[320px]">
                            {/* Header */}
                            <div className="bg-[#0b5f7c] text-white px-3 py-2 flex items-center justify-between rounded-t">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Notifications</span>
                                <button className="text-white hover:bg-[#084d63] rounded px-1">
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => toast.dismiss(t)}
                                className="text-white hover:bg-[#084d63] rounded p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Content */}
                            <div className="px-3 py-2 border-b border-gray-200">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-1">
                                  {isProcessing ? (
                                    <Hourglass className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  )}
                                  <span className="text-sm">{isProcessing ? 'Trial Match Processing' : 'Trial Match Complete'}</span>
                                </div>
                                <button
                                  onClick={() => toast.dismiss(t)}
                                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                {!isProcessing && (
                                  <a 
                                    href="#" 
                                    className="text-sm text-blue-600 hover:underline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toast.dismiss(t);
                                      if (source === 'side-sheet' || (source === 'main' && autoMatchStudent)) {
                                        // Get the updated student from current state
                                        setStudents(currentStudents => {
                                          const targetStudent = autoMatchStudent || selectedStudent;
                                          if (targetStudent) {
                                            const updatedStudent = currentStudents.find(s => s.name === targetStudent.name);
                                            if (updatedStudent) {
                                              setSelectedStudent(updatedStudent);
                                              setSelectedAgencies(new Map());
                                              setShowAgencySheet(true);
                                            }
                                          }
                                          return currentStudents;
                                        });
                                      }
                                    }}
                                  >
                                    View Results
                                  </a>
                                )}
                                <span className="text-xs text-gray-500">{timestamp}</span>
                              </div>
                            </div>
                          </div>
                        );
                      };
                      
                      return <TrialMatchToast />;
                    }, {
                      duration: 10000,
                    });
                  }}
                >
                  Run Trial Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Breakdown Modal */}
      {showMatchBreakdown && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[3000]"
          onClick={() => setShowMatchBreakdown(false)}
        >
          <div 
            className="w-[650px] rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MatchBreakdown onClose={() => setShowMatchBreakdown(false)} ranking={selectedRanking} agencyName={selectedAgencyName} studentName={selectedStudentName} />
          </div>
        </div>
      )}

      {/* Save As Modal */}
      {showSaveAsModal && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[3000]"
          onClick={() => setShowSaveAsModal(false)}
        >
          <div 
            className="w-[500px] bg-white rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0b5f7c] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg">Save As</h2>
              <button
                onClick={() => setShowSaveAsModal(false)}
                className="text-white hover:bg-[#084d63] rounded p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <label className="block text-sm mb-2">
                Ruleset Description
              </label>
              <input
                type="text"
                value={saveAsRulesetName}
                onChange={(e) => setSaveAsRulesetName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Enter ruleset name"
              />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 px-6 py-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSaveAsModal(false)}
                className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSaveAsModal(false);
                  setRulesetModified(false);
                  toast.success(`Ruleset saved as "${saveAsRulesetName}"`);
                }}
                className="px-4 py-2 text-sm bg-[#428bca] text-white rounded hover:bg-[#357ebd]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agency Selection Side Sheet */}
      {showAgencySheet && selectedStudent && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAgencySheet(false)}
          />
          
          {/* Side Sheet */}
          <div className="ml-auto relative w-full max-w-[800px] bg-white shadow-xl flex flex-col h-full">
            {/* Header */}
            <div className="bg-[#0088a8] text-white px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg">Add Agency</h2>
              <button 
                onClick={() => setShowAgencySheet(false)}
                className="hover:bg-[#007a96] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Student Details - At Top */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold mb-3 text-gray-700">Student Details</h3>
                  <div className="bg-white border border-gray-300 p-3 rounded bg-[#f3f4f8]">
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-blue-600 font-medium">{selectedStudent.name}</div>
                      {selectedStudent.location && (
                        <div className="text-xs text-gray-700">{selectedStudent.location}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{selectedStudent.details}</div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-600 font-medium">Placement Block:</span>
                        <div>{selectedStudent.block}</div>
                        <div className="text-gray-500">{selectedStudent.period}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Specialism:</span>
                        <div>{selectedStudent.specialism}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency Selection */}
                <div className="mb-4">
                  <h3 className="text-sm mb-3 font-bold">Search and Filter Agencies</h3>
                
                  {/* Search Filters */}
                  <div className="mb-3 space-y-2">
                    {/* First Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                          <input 
                            type="text" 
                            placeholder="Search Agencies"
                            className="w-full border border-gray-300 px-3 py-2 text-sm rounded"
                          />
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Agency Type</option>
                            <option>Hospital</option>
                            <option>Government</option>
                            <option>Health - Aged Care</option>
                            <option>Health - Mental Health</option>
                            <option>Education - Primary</option>
                            <option>Education - Secondary</option>
                          </select>
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Specialism</option>
                            <option>Emergency Care</option>
                            <option>Critical Care</option>
                            <option>Intensive Care Paramedic</option>
                            <option>Community Paramedic</option>
                          </select>
                        </div>
                    </div>
                    
                    {/* Second Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Categories</option>
                            <option>Category 1</option>
                            <option>Category 2</option>
                            <option>Category 3</option>
                          </select>
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Integration Partner</option>
                            <option>Partner 1</option>
                            <option>Partner 2</option>
                            <option>Partner 3</option>
                          </select>
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Groups</option>
                            <option>Group 1</option>
                            <option>Group 2</option>
                            <option>Group 3</option>
                          </select>
                        </div>
                    </div>
                    
                    {/* Third Row - Checkbox Filter */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filterHistoricalAgencies}
                            onChange={(e) => setFilterHistoricalAgencies(e.target.checked)}
                            className="cursor-pointer w-4 h-4"
                          />
                          <span className="text-sm">Has Placements in this Allocation Group</span>
                        </label>
                    </div>
                    
                    {/* Filter Actions Row */}
                    <div className="flex items-center justify-end gap-2">
                        <button className="px-2 py-2 text-[rgb(46,109,164)] hover:text-gray-800 text-sm flex items-center gap-1">
                          Cancel
                        </button>
                        <button className="px-4 py-2 bg-[#428bca] text-white rounded hover:bg-[#357ebd] text-sm">
                          Filter
                        </button>
                    </div>
                    
                    {/* Trial Match Row */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Showing {filterHistoricalAgencies 
                          ? selectedStudent.queuedAgencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name)).length + selectedStudent.agencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name)).length
                          : selectedStudent.queuedAgencyDetails.length + selectedStudent.agencyDetails.length} agencies</span>
                        <div className="flex items-center gap-2 relative">
                          <button 
                            className="px-4 py-2 bg-[rgb(3,98,25)] text-white rounded hover:bg-[rgb(4,120,87)] text-sm flex items-center gap-2"
                            onClick={() => {
                              setAutoMatchStudent(selectedStudent);
                              setTrialMatchSource('side-sheet');
                              setShowTrialMatchModal(true);
                            }}
                          >
                            <Target className="w-4 h-4" />
                            Trial Match
                          </button>
                          
                          {/* Tooltip Bubble */}
                          {showTrialMatchHelper && (
                            <div className="absolute bottom-full mb-2 right-0 w-[320px] z-50">
                              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-lg">
                                <button
                                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowTrialMatchHelper(false)}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <div className="flex items-start gap-3 pr-6">
                                  <div className="flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-[#f59e0b]" />
                                  </div>
                                  <div>
                                    <h3 className="mb-1 font-bold text-[rgb(36,114,196)] text-sm">Smart Matching Available</h3>
                                    <p className="text-xs text-gray-700">
                                      Trial Match saves time and ensures optimal allocation to suitable Agencies, using your customised ruleset criteria.
                                    </p>
                                  </div>
                                </div>
                                {/* Arrow pointing down to the right */}
                                <div className="absolute top-full right-6 -mt-[2px]">
                                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-300"></div>
                                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-50 absolute top-[-8px] left-1/2 -translate-x-1/2"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                    </div>
                  </div>

                  {/* Agency List */}
                  <div className="border border-gray-300 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        {agencyColumnVisibility.agencyName && <th className="px-3 py-2 text-left">Agency Name</th>}
                        {agencyColumnVisibility.specialism && <th className="px-3 py-2 text-left">Specialism</th>}
                        {agencyColumnVisibility.location && <th className="px-3 py-2 text-left">Location</th>}
                        {agencyColumnVisibility.ranking && <th className="px-3 py-2 text-left">Ranking</th>}
                        {agencyColumnVisibility.placements && (
                          <th className="px-3 py-2 text-left relative overflow-visible">
                            <div className="flex items-center gap-1">
                              Plc (LY+TY)
                              <div className="group relative inline-block">
                                <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                                <div className="invisible group-hover:visible fixed bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-2xl whitespace-normal leading-snug w-52 z-[99999]" style={{transform: 'translateY(-110%)'}}>
                                  Total placements for this Discipline from Last Year and This Year onwards. Excludes Withdrawn/Rejected placements
                                </div>
                              </div>
                            </div>
                          </th>
                        )}
                        {agencyColumnVisibility.action && <th className="px-3 py-2 text-left">Action</th>}
                        <th className="px-3 py-2 text-left w-10"></th>
                        <th className="px-3 py-2 text-left w-10 relative">
                          <div ref={agencySettingsRef}>
                            <button 
                              onClick={() => setShowAgencyColumnSettings(!showAgencyColumnSettings)}
                              className="hover:bg-gray-200 p-1 rounded"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            {showAgencyColumnSettings && (
                              <div className="fixed bg-white border border-gray-300 shadow-lg rounded p-3 z-[1000] w-56" style={{
                                top: `${agencySettingsRef.current?.getBoundingClientRect().bottom ?? 0}px`,
                                right: `${window.innerWidth - (agencySettingsRef.current?.getBoundingClientRect().right ?? 0)}px`
                              }}>
                                <div className="text-sm mb-2">Show/Hide Columns</div>
                                <div className="flex flex-col gap-2">
                                  {Object.entries({
                                    agencyName: 'Agency Name',
                                    specialism: 'Specialism',
                                    location: 'Location',
                                    ranking: 'Ranking',
                                    placements: 'Plc (LY+TY)',
                                    action: 'Action',
                                  }).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                                      <input
                                        type="checkbox"
                                        checked={agencyColumnVisibility[key as keyof typeof agencyColumnVisibility]}
                                        onChange={() => toggleAgencyColumn(key as keyof typeof agencyColumnVisibility)}
                                        className="cursor-pointer"
                                      />
                                      <span>{label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Queued Agencies */}
                      {(filterHistoricalAgencies 
                        ? selectedStudent.queuedAgencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name))
                        : selectedStudent.queuedAgencyDetails
                      ).map((agency, index) => {
                        const isManuallyExcluded = manuallyExcludedAgencies.has(agency.name);
                        return (
                        <tr key={`queued-${index}`} className={`border-b border-gray-200 ${isManuallyExcluded ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                          {agencyColumnVisibility.agencyName && (
                            <td className={`px-3 py-2 ${isManuallyExcluded ? 'text-[#ced4da]' : 'text-blue-600'}`}>
                              <span className={isManuallyExcluded ? 'line-through' : ''}>{agency.name}</span>
                            </td>
                          )}
                          {agencyColumnVisibility.specialism && <td className={`px-3 py-2 ${isManuallyExcluded ? 'text-[#ced4da]' : 'text-gray-700'}`}>{agency.specialism}</td>}
                          {agencyColumnVisibility.location && <td className={`px-3 py-2 ${isManuallyExcluded ? 'text-[#ced4da]' : 'text-gray-700'}`}>{agency.location}</td>}
                          {agencyColumnVisibility.ranking && (
                            <td className={`px-3 py-2 ${isManuallyExcluded ? 'text-[#ced4da]' : ''}`}>
                              {isManuallyExcluded ? (
                                <span>{agency.ranking}</span>
                              ) : (
                                <button
                                  className="text-blue-600 hover:underline cursor-pointer"
                                  onClick={() => {
                                    setSelectedRanking(agency.ranking);
                                    setSelectedAgencyName(agency.name);
                                    setSelectedStudentName(selectedStudent?.name || '');
                                    setShowMatchBreakdown(true);
                                  }}
                                >
                                  {agency.ranking}
                                </button>
                              )}
                            </td>
                          )}
                          {agencyColumnVisibility.placements && <td className={`px-3 py-2 ${isManuallyExcluded ? 'text-[#ced4da]' : 'text-gray-700'}`}>{agency.placements}</td>}
                          {agencyColumnVisibility.action && (
                            <td className="px-3 py-2">
                              {isManuallyExcluded ? (
                                <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded text-sm cursor-not-allowed">Excluded</span>
                              ) : (
                                <button 
                                  className={`px-3 py-1 rounded text-sm ${
                                    !selectedAgencies.get(agency.name) || selectedAgencies.get(agency.name) === 'queued'
                                      ? 'bg-[#1E8820] text-white hover:bg-[#176a18]'
                                      : selectedAgencies.get(agency.name) === 'select'
                                      ? 'bg-[#428bca] text-white hover:bg-[#357ebd]'
                                      : 'bg-amber-500 text-white hover:bg-amber-600'
                                  }`}
                                  onClick={() => {
                                    toggleAgencySelection(agency.name, true);
                                  }}
                                >
                                  {!selectedAgencies.get(agency.name) || selectedAgencies.get(agency.name) === 'queued' 
                                    ? 'Planned' 
                                    : selectedAgencies.get(agency.name) === 'select'
                                    ? 'Select'
                                    : 'Exclude'}
                                </button>
                              )}
                            </td>
                          )}
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => toggleAgencyExclusion(agency.name)}
                              className="hover:bg-gray-100 p-1 rounded"
                              title={isManuallyExcluded ? 'Remove exclusion' : 'Exclude agency'}
                            >
                              <Ban className={`w-4 h-4 ${isManuallyExcluded ? 'text-red-500' : 'text-gray-400'}`} />
                            </button>
                          </td>
                          <td className="px-3 py-2"></td>
                        </tr>
                        );
                      })}
                      {/* Available Agencies */}
                      {(filterHistoricalAgencies 
                        ? selectedStudent.agencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name))
                        : selectedStudent.agencyDetails
                      ).map((agency, index) => {
                        const isIncompatible = excludedAgencies.has(agency.name);
                        const isManuallyExcluded = manuallyExcludedAgencies.has(agency.name);
                        const isExcluded = isIncompatible || isManuallyExcluded;
                        return (
                        <tr key={`available-${index}`} className={`border-b border-gray-200 ${isIncompatible ? 'bg-[#fff8f8]' : isManuallyExcluded ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                          {agencyColumnVisibility.agencyName && (
                            <td 
                              className={`px-3 py-2 ${isExcluded ? 'text-[#ced4da]' : 'text-blue-600'} ${isIncompatible ? 'cursor-help' : ''}`}
                              title={isIncompatible ? 'Incompatible. Has Parent working at site.' : undefined}
                            >
                              <span className={isExcluded ? 'line-through' : ''}>{agency.name}</span>
                            </td>
                          )}
                          {agencyColumnVisibility.specialism && (
                            <td 
                              className={`px-3 py-2 ${isExcluded ? 'text-[#ced4da]' : 'text-gray-700'} ${isIncompatible ? 'cursor-help' : ''}`}
                              title={isIncompatible ? 'Incompatible. Has Parent working at site.' : undefined}
                            >
                              {agency.specialism}
                            </td>
                          )}
                          {agencyColumnVisibility.location && (
                            <td 
                              className={`px-3 py-2 ${isExcluded ? 'text-[#ced4da]' : 'text-gray-700'} ${isIncompatible ? 'cursor-help' : ''}`}
                              title={isIncompatible ? 'Incompatible. Has Parent working at site.' : undefined}
                            >
                              {agency.location}
                            </td>
                          )}
                          {agencyColumnVisibility.ranking && (
                            <td 
                              className={`px-3 py-2 ${isExcluded ? 'text-[#ced4da]' : ''} ${isIncompatible ? 'cursor-help' : ''}`}
                              title={isIncompatible ? 'Incompatible. Has Parent working at site.' : undefined}
                            >
                              {isExcluded ? (
                                <span>{agency.ranking}</span>
                              ) : (
                                <button
                                  className="text-blue-600 hover:underline cursor-pointer"
                                  onClick={() => {
                                    setSelectedRanking(agency.ranking);
                                    setSelectedAgencyName(agency.name);
                                    setSelectedStudentName(selectedStudent?.name || '');
                                    setShowMatchBreakdown(true);
                                  }}
                                >
                                  {agency.ranking}
                                </button>
                              )}
                            </td>
                          )}
                          {agencyColumnVisibility.placements && (
                            <td 
                              className={`px-3 py-2 ${isExcluded ? 'text-[#ced4da]' : 'text-gray-700'} ${isIncompatible ? 'cursor-help' : ''}`}
                              title={isIncompatible ? 'Incompatible. Has Parent working at site.' : undefined}
                            >
                              {agency.placements}
                            </td>
                          )}
                          {agencyColumnVisibility.action && (
                            <td className="px-3 py-2">
                              {isExcluded ? (
                                <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded text-sm cursor-not-allowed">Excluded</span>
                              ) : (
                                <button 
                                  className={`px-3 py-1 rounded text-sm ${
                                    selectedAgencies.get(agency.name) === 'queued'
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : selectedAgencies.get(agency.name) === 'exclude'
                                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                                      : 'bg-[#428bca] text-white hover:bg-[#357ebd]'
                                  }`}
                                  onClick={() => {
                                    toggleAgencySelection(agency.name);
                                  }}
                                >
                                  {selectedAgencies.get(agency.name) === 'queued' 
                                    ? 'Queued' 
                                    : selectedAgencies.get(agency.name) === 'exclude'
                                    ? 'Exclude'
                                    : 'Select'}
                                </button>
                              )}
                            </td>
                          )}
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => toggleAgencyExclusion(agency.name)}
                              className="hover:bg-gray-100 p-1 rounded"
                              title={isManuallyExcluded ? 'Remove exclusion' : 'Exclude agency'}
                            >
                              <Ban className={`w-4 h-4 ${isIncompatible || isManuallyExcluded ? 'text-red-500' : 'text-gray-400'}`} />
                            </button>
                          </td>
                          <td className="px-3 py-2"></td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </div>
              </div>

            {/* Footer */}
            <div className="border-t border-gray-300 px-4 py-3 bg-gray-50">
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Agency Side Sheet */}
      {showBulkAddAgencySheet && selectedStudents.size > 1 && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBulkAddAgencySheet(false)}
          />
          
          {/* Side Sheet */}
          <div className="ml-auto relative w-full max-w-[800px] bg-white shadow-xl flex flex-col h-full">
            {/* Header */}
            <div className="bg-[#0088a8] text-white px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg">Add Agency</h2>
                <button 
                  onClick={() => setShowBulkAddAgencySheet(false)}
                  className="hover:bg-[#007a96] p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content - Single Panel Layout */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Summary Bar */}
                <div className="border-b-2 border-gray-300">
                  <button
                    onClick={() => setBulkSummaryExpanded(!bulkSummaryExpanded)}
                    className="w-full px-[16px] py-[12px] m-[0px] bg-[#effaff] hover:bg-[#d9f3fc] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-[#428bca]" />
                          <span className="text-sm font-semibold text-gray-900">
                            {selectedStudents.size} Student{selectedStudents.size !== 1 ? 's' : ''} Selected
                          </span>
                        </div>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                          <Target size={18} className="text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            {bulkUniqueAgencies.size} Agenc{bulkUniqueAgencies.size !== 1 ? 'ies' : 'y'} Planned
                          </span>
                        </div>
                      </div>
                      {bulkSummaryExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Summary Content */}
                  {bulkSummaryExpanded && (
                    <div className="px-[16px] py-[4px]">
                      <div className="grid gap-0" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
                        {/* Left: Selected Students */}
                        <div className="pr-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Students</h3>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto [scrollbar-gutter:stable]">
                            {/* Group by placement block */}
                            {Object.entries(
                              bulkSelectedStudentsList.reduce((acc, student) => {
                                if (!acc[student.block]) acc[student.block] = [];
                                acc[student.block].push(student);
                                return acc;
                              }, {} as Record<string, typeof bulkSelectedStudentsList>)
                            ).map(([block, blockStudents]) => {
                              const isExpanded = expandedPlacementBlocks.has(block);
                              // Generate date range label - use period from first student
                              const samplePeriod = blockStudents[0]?.period || '';
                              const blockLabel = `${block.split(' ')[0]} Roster (${samplePeriod})`;
                              
                              // Group students by requirement (details field)
                              const studentsByRequirement = blockStudents.reduce((acc, student) => {
                                const requirement = student.details;
                                if (!acc[requirement]) {
                                  acc[requirement] = [];
                                }
                                acc[requirement].push(student);
                                return acc;
                              }, {} as Record<string, typeof blockStudents>);
                              
                              return (
                                <div key={block} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                                  {/* Block header with 4px vertical padding */}
                                  <div className="flex items-start gap-2 px-[6px] py-[4px]">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedPlacementBlocks);
                                        if (isExpanded) {
                                          newExpanded.delete(block);
                                        } else {
                                          newExpanded.add(block);
                                        }
                                        setExpandedPlacementBlocks(newExpanded);
                                      }}
                                      className="flex-1 flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-left text-[#005bda] text-[12px]">{blockLabel}</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-1.5 py-0.5 rounded">
                                          {blockStudents.length}
                                        </span>
                                      </div>
                                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                                    </button>
                                  </div>
                                  {isExpanded && (
                                    <div className="border-t border-gray-200">
                                      {Object.entries(studentsByRequirement).map(([requirement, reqStudents]) => (
                                        <div key={requirement}>
                                          {/* Requirement Sub-Header */}
                                          <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                                            <span className="text-xs font-semibold text-gray-800">{requirement}</span>
                                          </div>
                                          {/* Students under this requirement */}
                                          <div className="space-y-0">
                                            {reqStudents.map((student, idx) => (
                                              <div key={idx} className="px-3 py-1.5 pl-6 text-xs text-gray-600 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                                                {student.name}{student.specialism ? ` - ${student.specialism}` : ''}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Vertical Separator */}
                        <div className="w-px bg-gray-300"></div>

                        {/* Right: Planned Agencies */}
                        <div className="pl-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Planned Agencies</h3>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {bulkUniqueAgencies.size > 0 ? (
                              Array.from(bulkUniqueAgencies).map((agency, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm text-gray-700">{agency}</span>
                                  <span className="text-xs text-gray-500">
                                    {bulkSelectedStudentsList.filter(s => s.agencies.includes(agency)).length} student{bulkSelectedStudentsList.filter(s => s.agencies.includes(agency)).length > 1 ? 's' : ''}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500 italic">No planned agencies</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4">

                  {/* Agency Selection */}
                  <div className="mb-4">
                    <h3 className="text-sm mb-3 font-bold">Search and Filter Agencies</h3>
                  
                    {/* Search Filters */}
                    <div className="mb-3 space-y-2">
                      {/* First Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <input 
                            type="text" 
                            placeholder="Search Agencies"
                            className="w-full border border-gray-300 px-3 py-2 text-sm rounded"
                          />
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Agency Type</option>
                            <option>Hospital</option>
                            <option>Government</option>
                            <option>Health - Aged Care</option>
                            <option>Health - Mental Health</option>
                            <option>Education - Primary</option>
                            <option>Education - Secondary</option>
                          </select>
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Specialism</option>
                            <option>Emergency Care</option>
                            <option>Critical Care</option>
                            <option>Intensive Care Paramedic</option>
                            <option>Community Paramedic</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Second Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Categories</option>
                            <option>Category 1</option>
                            <option>Category 2</option>
                            <option>Category 3</option>
                          </select>
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Integration Partner</option>
                            <option>Partner 1</option>
                            <option>Partner 2</option>
                            <option>Partner 3</option>
                          </select>
                        </div>
                        <div>
                          <select className="w-full border border-gray-300 px-3 py-2 text-sm rounded">
                            <option>Search Groups</option>
                            <option>Group 1</option>
                            <option>Group 2</option>
                            <option>Group 3</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Third Row - Checkbox Filter */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filterHistoricalAgencies}
                            onChange={(e) => setFilterHistoricalAgencies(e.target.checked)}
                            className="cursor-pointer w-4 h-4"
                          />
                          <span className="text-sm">Has Placements in this Allocation Group</span>
                        </label>
                      </div>
                      
                      {/* Filter Actions Row */}
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-2 py-2 text-[rgb(46,109,164)] hover:text-gray-800 text-sm flex items-center gap-1">
                          Cancel
                        </button>
                        <button className="px-4 py-2 bg-[#428bca] text-white rounded hover:bg-[#357ebd] text-sm">
                          Filter
                        </button>
                      </div>
                      
                      {/* Agencies Count Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Showing {filterHistoricalAgencies 
                          ? bulkSampleStudent.queuedAgencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name)).length + bulkSampleStudent.agencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name)).length
                          : bulkSampleStudent.queuedAgencyDetails.length + bulkSampleStudent.agencyDetails.length} agencies</span>
                      </div>
                    </div>
                  </div>

                  {/* Agency List */}
                  <div className="border border-gray-300 rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        {agencyColumnVisibility.agencyName && <th className="px-3 py-2 text-left">Agency Name</th>}
                        {agencyColumnVisibility.specialism && <th className="px-3 py-2 text-left">Specialism</th>}
                        {agencyColumnVisibility.location && <th className="px-3 py-2 text-left">Location</th>}
                        {agencyColumnVisibility.ranking && <th className="px-3 py-2 text-left">Ranking</th>}
                        {agencyColumnVisibility.placements && (
                          <th className="px-3 py-2 text-left relative overflow-visible">
                            <div className="flex items-center gap-1">
                              Plc (LY+TY)
                              <div className="group relative inline-block">
                                <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                                <div className="invisible group-hover:visible fixed bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-2xl whitespace-normal leading-snug w-52 z-[99999]" style={{transform: 'translateY(-110%)'}}>
                                  Total placements for this discipline from last year to this year onwards. Excludes Withdrawn/Rejected placements.
                                </div>
                              </div>
                            </div>
                          </th>
                        )}
                        {agencyColumnVisibility.action && <th className="px-3 py-2 text-left">Action</th>}
                        <th className="px-3 py-2 text-left w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(filterHistoricalAgencies 
                        ? bulkSampleStudent.queuedAgencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name))
                        : bulkSampleStudent.queuedAgencyDetails
                      ).map(agency => (
                        <tr key={`queued-${agency.name}`} className="border-b border-gray-200 hover:bg-gray-50">
                          {agencyColumnVisibility.agencyName && (
                            <td className="px-3 py-2">
                              <span className="text-blue-600">{agency.name}</span>
                            </td>
                          )}
                          {agencyColumnVisibility.specialism && <td className="px-3 py-2">{agency.specialism}</td>}
                          {agencyColumnVisibility.location && <td className="px-3 py-2">{agency.location}</td>}
                          {agencyColumnVisibility.ranking && (
                            <td className="px-3 py-2">
                              <button className="text-blue-600 hover:underline">
                                {agency.ranking}
                              </button>
                            </td>
                          )}
                          {agencyColumnVisibility.placements && <td className="px-3 py-2 text-gray-700">{agency.placements}</td>}
                          {agencyColumnVisibility.action && (
                            <td className="px-3 py-2">
                              <button 
                                className={`px-3 py-1 rounded text-sm ${
                                  selectedAgencies.get(agency.name) === 'queued'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : selectedAgencies.get(agency.name) === 'exclude'
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-[#428bca] text-white hover:bg-[#357ebd]'
                                }`}
                                onClick={() => {
                                  toggleAgencySelection(agency.name);
                                }}
                              >
                                {selectedAgencies.get(agency.name) === 'queued' 
                                  ? 'Queued' 
                                  : selectedAgencies.get(agency.name) === 'exclude'
                                  ? 'Exclude'
                                  : 'Select'}
                              </button>
                            </td>
                          )}
                          <td className="px-3 py-2"></td>
                        </tr>
                      ))}
                      {(filterHistoricalAgencies 
                        ? bulkSampleStudent.agencyDetails.filter(a => ['Royal Ambulance Victoria', 'Western Metro Ambulance', 'Melbourne Emergency Services'].includes(a.name))
                        : bulkSampleStudent.agencyDetails
                      ).map(agency => (
                        <tr key={`available-${agency.name}`} className="border-b border-gray-200 hover:bg-gray-50">
                          {agencyColumnVisibility.agencyName && (
                            <td className="px-3 py-2">
                              <span className="text-blue-600">{agency.name}</span>
                            </td>
                          )}
                          {agencyColumnVisibility.specialism && <td className="px-3 py-2">{agency.specialism}</td>}
                          {agencyColumnVisibility.location && <td className="px-3 py-2">{agency.location}</td>}
                          {agencyColumnVisibility.ranking && (
                            <td className="px-3 py-2">
                              <button className="text-blue-600 hover:underline">
                                {agency.ranking}
                              </button>
                            </td>
                          )}
                          {agencyColumnVisibility.placements && <td className="px-3 py-2 text-gray-700">{agency.placements}</td>}
                          {agencyColumnVisibility.action && (
                            <td className="px-3 py-2">
                              <button 
                                className={`px-3 py-1 rounded text-sm ${
                                  selectedAgencies.get(agency.name) === 'queued'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : selectedAgencies.get(agency.name) === 'exclude'
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-[#428bca] text-white hover:bg-[#357ebd]'
                                }`}
                                onClick={() => {
                                  toggleAgencySelection(agency.name);
                                }}
                              >
                                {selectedAgencies.get(agency.name) === 'queued' 
                                  ? 'Queued' 
                                  : selectedAgencies.get(agency.name) === 'exclude'
                                  ? 'Exclude'
                                  : 'Select'}
                              </button>
                            </td>
                          )}
                          <td className="px-3 py-2"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 px-4 py-3 bg-gray-50">
            </div>
          </div>
        </div>
      )}

      {/* Create Request Side Sheet */}
      {showCreateRequestSheet && (
        <div className="fixed inset-0 z-[2100] flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateRequestSheet(false)}
          />
          
          {/* Side Sheet - Same width as Trial Match */}
          <div className="ml-auto relative w-full max-w-[800px] bg-white shadow-xl flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0b5f7c] to-[#0a5470] text-white px-6 py-4 flex items-center justify-between shadow-lg">
                <h2 className="text-xl font-semibold">Create Requests</h2>
                <button
                  onClick={() => setShowCreateRequestSheet(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content - Single Panel Layout */}
              <div className="flex-1 overflow-hidden flex">
                {/* Single Panel - All Components */}
                <div className="flex-1 overflow-y-auto px-[10px] py-[14px]">
                  {/* Request Summary - Now Expandable with Selected Students and Planned Agencies */}
                  <div className="mb-3">
                    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                      <RequestSummary 
                        studentsCount={checkedBlocksStudents.length}
                        blocksCount={checkedBlocksCount}
                        agenciesCount={createRequestUniqueAgencies.size}
                        requestsCount={createRequestTotalRequests}
                        isExpanded={showRequestSummary}
                        onClick={() => setShowRequestSummary(!showRequestSummary)}
                      />
                      
                      {showRequestSummary && (
                        <div className="p-4">
                          {/* Two Column Layout with Separator */}
                          <div className="grid gap-0" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
                            {/* Left Column - Selected Students */}
                            <div className="pr-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Students</h3>
                              
                              {/* Placement Blocks - Always Visible */}
                              <div className="space-y-2 max-h-[400px] overflow-y-auto [scrollbar-gutter:stable]">
                                {Object.entries(createRequestPlacementBlocks).map(([blockName, blockStudents]) => {
                                  const isExpanded = expandedPlacementBlocks.has(blockName);
                                  // Generate date range label (example format)
                                  const blockLabel = `${blockName.split(' ')[0]} Roster (01/02/2026-28/02/2026)`;
                                  
                                  // Group students by requirement (details field)
                                  const studentsByRequirement = blockStudents.reduce((acc, student) => {
                                    const requirement = student.details;
                                    if (!acc[requirement]) {
                                      acc[requirement] = [];
                                    }
                                    acc[requirement].push(student);
                                    return acc;
                                  }, {} as Record<string, typeof blockStudents>);
                                  
                                  return (
                                    <div key={blockName} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                                      {/* Block header with 4px vertical padding */}
                                      <div className="flex items-start gap-2 px-[6px] py-[4px]">
                                        <button
                                          onClick={() => {
                                            const newExpanded = new Set(expandedPlacementBlocks);
                                            if (isExpanded) {
                                              newExpanded.delete(blockName);
                                            } else {
                                              newExpanded.add(blockName);
                                            }
                                            setExpandedPlacementBlocks(newExpanded);
                                          }}
                                          className="flex-1 flex items-center justify-between"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-left text-[#005bda] text-[12px]">{blockLabel}</span>
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-1.5 py-0.5 rounded">
                                              {blockStudents.length}
                                            </span>
                                          </div>
                                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                                        </button>
                                      </div>
                                      {isExpanded && (
                                        <div className="border-t border-gray-200">
                                          {Object.entries(studentsByRequirement).map(([requirement, reqStudents]) => (
                                            <div key={requirement}>
                                              {/* Requirement Sub-Header */}
                                              <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                                                <span className="text-xs font-semibold text-gray-800">{requirement}</span>
                                              </div>
                                              {/* Students under this requirement */}
                                              <div className="space-y-0">
                                                {reqStudents.map((student, idx) => (
                                                  <div key={idx} className="px-3 py-1.5 pl-6 text-xs text-gray-600 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                                                    {student.name}{student.specialism ? ` - ${student.specialism}` : ''}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Vertical Separator */}
                            <div className="w-px bg-gray-300"></div>

                            {/* Right Column - Planned Agencies */}
                            <div className="pl-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">Planned Agencies</h3>
                              
                              {/* Show agencies from all blocks */}
                              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {(() => {
                                  // Calculate agencies from all blocks
                                  const allBlockAgencies = new Set<string>();
                                  Object.entries(createRequestPlacementBlocks).forEach(([blockName, blockStudents]) => {
                                    blockStudents.forEach(student => {
                                      student.agencies.forEach(agency => allBlockAgencies.add(agency));
                                    });
                                  });
                                  
                                  if (allBlockAgencies.size === 0) {
                                    return (
                                      <div className="text-sm text-gray-500 italic">
                                        No planned agencies
                                      </div>
                                    );
                                  }
                                  
                                  return Array.from(allBlockAgencies).map((agency, idx) => {
                                    // Count students from all blocks
                                    const studentCount = createRequestSelectedStudentsList.filter(s => {
                                      // Check if student has this agency
                                      return s.agencies.includes(agency);
                                    }).length;
                                    
                                    return (
                                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-700">{agency}</span>
                                        <span className="text-xs text-gray-500">
                                          {studentCount} student{studentCount > 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="mb-3">
                    <RequestDetails 
                      experience={requestExperience}
                      duration={requestDuration}
                      unitOfMeasure={requestUnitOfMeasure}
                      selectedBlocks={Array.from(selectedBlocks).map(blockKey => blockKey.split(' (')[0])}
                    />
                  </div>

                  {/* Placement Time Section */}
                  <div className="mb-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                    <button
                      onClick={() => setShowPlacementTimeSection(!showPlacementTimeSection)}
                      className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50"
                    >
                      <h3 className="text-base font-semibold text-gray-900">
                        Placement Time <span className="text-gray-500 font-normal">(optional)</span>
                      </h3>
                      {showPlacementTimeSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {showPlacementTimeSection && (
                      <div className="p-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Template</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                            <option value="">Select Template</option>
                          </select>
                        </div>
                        
                        {!showPerDayTimes && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Preferred Days</label>
                            <div className="flex gap-2 flex-wrap">
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <label key={day} className="flex items-center gap-1 text-sm">
                                  <input 
                                    type="checkbox" 
                                    checked={workingDays[day as keyof typeof workingDays]}
                                    onChange={(e) => setWorkingDays({ ...workingDays, [day]: e.target.checked })}
                                  />
                                  <span>{day}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {!showPerDayTimes && (
                          <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type</label>
                            <select 
                              value={shiftType}
                              onChange={(e) => {
                                setShiftType(e.target.value);
                                // If Custom is selected, set default times
                                if (e.target.value === 'Custom') {
                                  setGlobalStartTime('09:00');
                                  setGlobalEndTime('17:00');
                                  // Update all per-day times with defaults
                                  const updated = { ...perDayTimes };
                                  Object.keys(updated).forEach((day) => {
                                    updated[day as keyof typeof updated].start = '09:00';
                                    updated[day as keyof typeof updated].end = '17:00';
                                  });
                                  setPerDayTimes(updated);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="Custom">Custom</option>
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                              <option value="Full Day">Full Day</option>
                              <option value="Half Day">Half Day</option>
                              <option value="Shift">Shift</option>
                              <option value="Night">Night</option>
                              <option value="None">None</option>
                            </select>
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input 
                              type={shiftType !== 'Custom' ? "text" : "time"}
                              value={shiftType !== 'Custom' ? "--:--" : globalStartTime}
                              onChange={(e) => {
                                setGlobalStartTime(e.target.value);
                                // Update all per-day times
                                const updated = { ...perDayTimes };
                                Object.keys(updated).forEach((day) => {
                                  updated[day as keyof typeof updated].start = e.target.value;
                                });
                                setPerDayTimes(updated);
                              }}
                              disabled={shiftType !== 'Custom'}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-center" 
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                            <input 
                              type={shiftType !== 'Custom' ? "text" : "time"}
                              value={shiftType !== 'Custom' ? "--:--" : globalEndTime}
                              onChange={(e) => {
                                setGlobalEndTime(e.target.value);
                                // Update all per-day times
                                const updated = { ...perDayTimes };
                                Object.keys(updated).forEach((day) => {
                                  updated[day as keyof typeof updated].end = e.target.value;
                                });
                                setPerDayTimes(updated);
                              }}
                              disabled={shiftType !== 'Custom'}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-center" 
                            />
                          </div>
                        </div>
                        )}
                        <button
                          onClick={() => setShowPerDayTimes(!showPerDayTimes)}
                          className="text-[#428bca] text-sm flex items-center gap-1 hover:underline"
                        >
                          {showPerDayTimes ? '− Hide per-day times' : '+ Set different times per day'}
                        </button>

                        {/* Per-Day Times Table */}
                        {showPerDayTimes && (
                          <div>
                            {/* Week Tabs */}
                            <div className="flex items-center gap-2 mb-3">
                              <button
                                onClick={() => {
                                  const currentIndex = weeks.indexOf(activeWeek);
                                  if (currentIndex > 0) {
                                    loadWeekData(weeks[currentIndex - 1]);
                                  }
                                }}
                                disabled={weeks.indexOf(activeWeek) === 0}
                                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Previous week"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              
                              {weeks.map((weekNum) => (
                                <button
                                  key={weekNum}
                                  onClick={() => loadWeekData(weekNum)}
                                  className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${
                                    activeWeek === weekNum 
                                      ? 'bg-[#428bca] text-white' 
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  Week {weekNum}
                                  {weeks.length > 1 && (
                                    <X
                                      className="w-3.5 h-3.5 cursor-pointer hover:opacity-70"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeWeek(weekNum);
                                      }}
                                    />
                                  )}
                                </button>
                              ))}
                              
                              <button
                                onClick={addWeek}
                                className="text-[#428bca] text-sm flex items-center gap-1 hover:underline"
                              >
                                + Add Week
                              </button>
                              
                              <button
                                onClick={() => {
                                  const currentIndex = weeks.indexOf(activeWeek);
                                  if (currentIndex < weeks.length - 1) {
                                    loadWeekData(weeks[currentIndex + 1]);
                                  }
                                }}
                                disabled={weeks.indexOf(activeWeek) === weeks.length - 1}
                                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
                                title="Next week"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="border border-gray-300 rounded">
                              <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-300">
                                  <th className="text-left px-3 py-2 font-medium text-gray-700 w-12"></th>
                                  <th className="text-left px-3 py-2 font-medium text-gray-700">DAY</th>
                                  <th className="text-left px-3 py-2 font-medium text-gray-700">SHIFT TYPE</th>
                                  <th className="text-left px-3 py-2 font-medium text-gray-700">START TIME</th>
                                  <th className="text-left px-3 py-2 font-medium text-gray-700">END TIME</th>
                                </tr>
                              </thead>
                              <tbody>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                                  <tr key={day} className={idx < 6 ? 'border-b border-gray-200' : ''}>
                                    <td className="px-3 py-2">
                                      <input 
                                        type="checkbox" 
                                        checked={workingDays[day as keyof typeof workingDays]}
                                        onChange={(e) => setWorkingDays({ ...workingDays, [day]: e.target.checked })}
                                        className="cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">{day}</td>
                                    <td className="px-3 py-2">
                                      {workingDays[day as keyof typeof workingDays] ? (
                                        <select
                                          value={perDayShiftTypes[day as keyof typeof perDayShiftTypes]}
                                          onChange={(e) => {
                                            setPerDayShiftTypes({
                                              ...perDayShiftTypes,
                                              [day]: e.target.value
                                            });
                                          }}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                          <option value="Custom">Custom</option>
                                          <option value="AM">AM</option>
                                          <option value="PM">PM</option>
                                          <option value="Full Day">Full Day</option>
                                          <option value="Half Day">Half Day</option>
                                          <option value="Shift">Shift</option>
                                          <option value="Night">Night</option>
                                          <option value="None">None</option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 w-32">
                                      {workingDays[day as keyof typeof workingDays] ? (
                                        <input
                                          type={perDayShiftTypes[day as keyof typeof perDayShiftTypes] !== 'Custom' ? "text" : "time"}
                                          value={perDayShiftTypes[day as keyof typeof perDayShiftTypes] !== 'Custom' ? "--:--" : perDayTimes[day as keyof typeof perDayTimes].start}
                                          onChange={(e) => {
                                            setPerDayTimes({
                                              ...perDayTimes,
                                              [day]: { ...perDayTimes[day as keyof typeof perDayTimes], start: e.target.value }
                                            });
                                            // Clear global times if any day is different
                                            const allSameStart = Object.keys(perDayTimes).every(d => 
                                              perDayTimes[d as keyof typeof perDayTimes].start === e.target.value || !workingDays[d as keyof typeof workingDays]
                                            );
                                            if (!allSameStart) setGlobalStartTime('');
                                          }}
                                          disabled={perDayShiftTypes[day as keyof typeof perDayShiftTypes] !== 'Custom'}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-center"
                                        />
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 w-32">
                                      {workingDays[day as keyof typeof workingDays] ? (
                                        <input
                                          type={perDayShiftTypes[day as keyof typeof perDayShiftTypes] !== 'Custom' ? "text" : "time"}
                                          value={perDayShiftTypes[day as keyof typeof perDayShiftTypes] !== 'Custom' ? "--:--" : perDayTimes[day as keyof typeof perDayTimes].end}
                                          onChange={(e) => {
                                            setPerDayTimes({
                                              ...perDayTimes,
                                              [day]: { ...perDayTimes[day as keyof typeof perDayTimes], end: e.target.value }
                                            });
                                            // Clear global times if any day is different
                                            const allSameEnd = Object.keys(perDayTimes).every(d => 
                                              perDayTimes[d as keyof typeof perDayTimes].end === e.target.value || !workingDays[d as keyof typeof workingDays]
                                            );
                                            if (!allSameEnd) setGlobalEndTime('');
                                          }}
                                          disabled={perDayShiftTypes[day as keyof typeof perDayShiftTypes] !== 'Custom'}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-center"
                                        />
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Save as New Template Section - Always visible */}
                    {showPlacementTimeSection && (
                      <div className="px-4 pb-4">
                        <div className="pt-4 border-t border-gray-300">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Save as New Template</h4>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              placeholder="Enter template name"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <button
                              disabled={!templateName.trim()}
                              onClick={() => {
                                toast.success(`Template "${templateName}" saved successfully`);
                                setTemplateName('');
                              }}
                              className={`px-4 py-2 text-sm rounded ${
                                templateName.trim()
                                  ? 'bg-[#428bca] text-white hover:bg-[#3276b1] cursor-pointer'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attributes Section */}
                  <div className="mb-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                    <button
                      onClick={() => setShowAttributesSection(!showAttributesSection)}
                      className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50"
                    >
                      <h3 className="text-base font-semibold text-gray-900">
                        Attributes <span className="text-gray-500 font-normal">(optional)</span>
                      </h3>
                      {showAttributesSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {showAttributesSection && (
                      <div className="p-4">
                        {/* Controls */}
                        <div className="flex items-center justify-end gap-4 mb-3">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input 
                              type="checkbox" 
                              checked={collapseAllAttributes}
                              onChange={(e) => {
                                setCollapseAllAttributes(e.target.checked);
                                if (e.target.checked) {
                                  setExpandedMainCollections(new Set());
                                } else {
                                  setExpandedMainCollections(new Set(['request', 'jja1']));
                                }
                              }}
                            />
                            Collapse All
                          </label>
                        </div>

                        {/* Collections */}
                        <div className="space-y-2">
                          {/* Request Collection */}
                          <div className="rounded">
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedMainCollections);
                                if (newExpanded.has('request')) {
                                  newExpanded.delete('request');
                                } else {
                                  newExpanded.add('request');
                                }
                                setExpandedMainCollections(newExpanded);
                              }}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 text-left"
                            >
                              <span className="text-sm text-[#000000] font-bold">Request Collection</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 whitespace-nowrap">1 agency-required field</span>
                                {expandedMainCollections.has('request') ? 
                                  <ChevronUp className="w-4 h-4 text-gray-600" /> : 
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                }
                              </div>
                            </button>
                            
                            {expandedMainCollections.has('request') && (
                              <div className="border-t border-gray-300">
                                {/* Request Sub Collection */}
                                <div className="border-b border-gray-200">
                                  <div className="w-full px-3 py-2">
                                    <span className="text-sm text-black italic">Request Sub Collection</span>
                                  </div>
                                  
                                  <div className="px-3 pb-3">
                                    {/* Attributes Table */}
                                    <div className="border border-gray-300 rounded">
                                      <table className="w-full text-sm table-fixed">
                                        <thead>
                                          <tr className="bg-gray-100 border-b border-gray-300 h-10">
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[15%] border-r border-gray-300">Attribute</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[25%] border-r border-gray-300">Description</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[20%] border-r border-gray-300">Value</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[15%] border-r border-gray-300">Expiry</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[15%] border-r border-gray-300">Ref No.</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-8 border-r border-gray-300"></th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-8"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {requestAttributes.map((attr, index) => (
                                            <tr key={index} className="border-b border-gray-200 h-10">
                                              {/* Attribute */}
                                              <td className="px-3 py-2 text-sm text-gray-900 font-semibold overflow-hidden" title={attr.attribute}>
                                                <div className="truncate flex items-center gap-1">
                                                  <span className="truncate">{attr.attribute}</span>
                                                  {attr.attribute === 'Placement Supervision Type' && (
                                                    <Info 
                                                      size={14} 
                                                      className="text-[#428bca] flex-shrink-0 cursor-help" 
                                                      title="Agency Required"
                                                    />
                                                  )}
                                                </div>
                                              </td>

                                              {/* Description */}
                                              <td className="px-3 py-2 text-sm text-gray-600 overflow-hidden" title={attr.description}>
                                                <div className="truncate">{attr.description}</div>
                                              </td>

                                              {/* Value */}
                                              <td 
                                                className={`px-3 py-2 text-sm text-gray-900 relative group cursor-pointer attribute-edit-dropdown ${editingAttribute?.collection === 'request' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'value' ? '' : 'overflow-hidden'}`}
                                                onMouseEnter={() => setHoveredAttributeCell({ collection: 'request', rowIndex: index, field: 'value' })}
                                                onMouseLeave={() => setHoveredAttributeCell(null)}
                                                onClick={() => setEditingAttribute({ collection: 'request', rowIndex: index, field: 'value' })}
                                                title={attr.value}
                                              >
                                                {editingAttribute?.collection === 'request' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'value' ? (
                                                  <>
                                                    {/* Request List - Multi-select dropdown */}
                                                    {attr.attribute === 'Request List' && (
                                                      <div 
                                                        className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-[100] w-48"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => {
                                                          if (e.key === 'Enter' || e.key === 'Escape') {
                                                            setEditingAttribute(null);
                                                          }
                                                        }}
                                                      >
                                                        {['Current', 'Existing', 'Placed', 'Completed'].map((option) => {
                                                          const values = attr.value.split(', ').filter(v => v);
                                                          const isChecked = values.includes(option);
                                                          return (
                                                            <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                                              <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                  const newAttributes = [...requestAttributes];
                                                                  let currentValues = newAttributes[index].value.split(', ').filter(v => v);
                                                                  if (e.target.checked) {
                                                                    currentValues.push(option);
                                                                  } else {
                                                                    currentValues = currentValues.filter(v => v !== option);
                                                                  }
                                                                  newAttributes[index].value = currentValues.join(', ');
                                                                  setRequestAttributes(newAttributes);
                                                                }}
                                                                className="mr-2"
                                                              />
                                                              <span className="text-sm">{option}</span>
                                                            </label>
                                                          );
                                                        })}
                                                      </div>
                                                    )}
                                                    
                                                    {/* Placement Supervision Type - Single select dropdown */}
                                                    {attr.attribute === 'Placement Supervision Type' && (
                                                      <div className="absolute left-0 top-0 z-10">
                                                        <select
                                                          ref={selectInputRef}
                                                          value={attr.value}
                                                          onChange={(e) => {
                                                            const newAttributes = [...requestAttributes];
                                                            newAttributes[index].value = e.target.value;
                                                            setRequestAttributes(newAttributes);
                                                            setEditingAttribute(null);
                                                          }}
                                                          onBlur={() => setEditingAttribute(null)}
                                                          className="min-w-[150px] px-2 py-1 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded shadow-lg"
                                                          size={3}
                                                        >
                                                          <option value="">Select...</option>
                                                          <option value="Direct">Direct</option>
                                                          <option value="Indirect">Indirect</option>
                                                        </select>
                                                      </div>
                                                    )}
                                                    
                                                    {/* Requested Placement Type - Single select dropdown */}
                                                    {attr.attribute === 'Requested Placement Type' && (
                                                      <div className="absolute left-0 top-0 z-10">
                                                        <select
                                                          ref={selectInputRef}
                                                          value={attr.value}
                                                          onChange={(e) => {
                                                            const newAttributes = [...requestAttributes];
                                                            newAttributes[index].value = e.target.value;
                                                            setRequestAttributes(newAttributes);
                                                            setEditingAttribute(null);
                                                          }}
                                                          onBlur={() => setEditingAttribute(null)}
                                                          className="min-w-[150px] px-2 py-1 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded shadow-lg"
                                                          size={5}
                                                        >
                                                          <option value="">Select...</option>
                                                          <option value="Clinical">Clinical</option>
                                                          <option value="Field">Field</option>
                                                          <option value="Research">Research</option>
                                                          <option value="Internship">Internship</option>
                                                        </select>
                                                      </div>
                                                    )}
                                                  </>
                                                ) : (
                                                  <div className="flex items-center justify-between">
                                                    <span className="truncate">{attr.value}</span>
                                                    {hoveredAttributeCell?.collection === 'request' && hoveredAttributeCell?.rowIndex === index && hoveredAttributeCell?.field === 'value' && (
                                                      <Pencil className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                                    )}
                                                  </div>
                                                )}
                                              </td>

                                              {/* Expiry */}
                                              <td 
                                                className="px-3 py-2 text-sm text-gray-900 relative group cursor-pointer overflow-hidden"
                                                onMouseEnter={() => setHoveredAttributeCell({ collection: 'request', rowIndex: index, field: 'expiry' })}
                                                onMouseLeave={() => setHoveredAttributeCell(null)}
                                                onClick={() => setEditingAttribute({ collection: 'request', rowIndex: index, field: 'expiry' })}
                                              >
                                                {editingAttribute?.collection === 'request' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'expiry' ? (
                                                  <input
                                                    ref={dateInputRef}
                                                    type="date"
                                                    className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                                    value={attr.expiry}
                                                    onChange={(e) => {
                                                      const newAttributes = [...requestAttributes];
                                                      newAttributes[index].expiry = e.target.value;
                                                      setRequestAttributes(newAttributes);
                                                    }}
                                                    onBlur={() => setEditingAttribute(null)}
                                                  />
                                                ) : (
                                                  <div className="flex items-center justify-between">
                                                    <span className="truncate">{attr.expiry}</span>
                                                    {hoveredAttributeCell?.collection === 'request' && hoveredAttributeCell?.rowIndex === index && hoveredAttributeCell?.field === 'expiry' && (
                                                      <Pencil className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                                    )}
                                                  </div>
                                                )}
                                              </td>

                                              {/* Ref No */}
                                              <td 
                                                className="px-3 py-2 text-sm text-gray-900 relative group cursor-pointer overflow-hidden"
                                                onMouseEnter={() => setHoveredAttributeCell({ collection: 'request', rowIndex: index, field: 'refNo' })}
                                                onMouseLeave={() => setHoveredAttributeCell(null)}
                                                onClick={() => setEditingAttribute({ collection: 'request', rowIndex: index, field: 'refNo' })}
                                              >
                                                {editingAttribute?.collection === 'request' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'refNo' ? (
                                                  <input
                                                    ref={textInputRef}
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={attr.refNo}
                                                    onChange={(e) => {
                                                      const newAttributes = [...requestAttributes];
                                                      newAttributes[index].refNo = e.target.value;
                                                      setRequestAttributes(newAttributes);
                                                    }}
                                                    onBlur={() => setEditingAttribute(null)}
                                                  />
                                                ) : (
                                                  <div className="flex items-center justify-between">
                                                    <span className="truncate">{attr.refNo}</span>
                                                    {hoveredAttributeCell?.collection === 'request' && hoveredAttributeCell?.rowIndex === index && hoveredAttributeCell?.field === 'refNo' && (
                                                      <Pencil className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                                    )}
                                                  </div>
                                                )}
                                              </td>

                                              {/* Comment Icon */}
                                              <td className="px-3 py-2 text-center relative">
                                                {attr.attribute !== 'Requested Placement Type' && (
                                                  <>
                                                    {attr.comment ? (
                                                      <button 
                                                        className="text-[#428bca] hover:text-[#3276b1] transition-colors relative group/comment"
                                                        title={attr.comment}
                                                      >
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/comment:opacity-100 transition-opacity pointer-events-none z-50">
                                                          {attr.comment}
                                                        </span>
                                                      </button>
                                                    ) : (
                                                      <button 
                                                        className="text-gray-300 hover:text-gray-400 transition-colors relative group/addcomment"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setActiveCommentPopover({ collection: 'request', rowIndex: index, type: 'comment' });
                                                          setTempCommentText('');
                                                        }}
                                                      >
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/addcomment:opacity-100 transition-opacity pointer-events-none z-50">
                                                          Add comment
                                                        </span>
                                                      </button>
                                                    )}
                                                    
                                                    {/* Comment Popover */}
                                                    {activeCommentPopover?.collection === 'request' && activeCommentPopover?.rowIndex === index && activeCommentPopover?.type === 'comment' && (
                                                      <div 
                                                        className="absolute right-full top-0 mr-2 bg-white border border-gray-300 rounded shadow-lg p-3 w-64 z-[200]"
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        <textarea
                                                          autoFocus
                                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                          rows={3}
                                                          placeholder="Type your comment"
                                                          value={tempCommentText}
                                                          onChange={(e) => setTempCommentText(e.target.value)}
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                          <button
                                                            className="px-3 py-1 bg-[#428bca] text-white text-xs rounded hover:bg-[#3276b1]"
                                                            onClick={() => {
                                                              const newAttributes = [...requestAttributes];
                                                              newAttributes[index].comment = tempCommentText;
                                                              setRequestAttributes(newAttributes);
                                                              setActiveCommentPopover(null);
                                                              setTempCommentText('');
                                                            }}
                                                          >
                                                            Save
                                                          </button>
                                                          <button
                                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                            onClick={() => {
                                                              setActiveCommentPopover(null);
                                                              setTempCommentText('');
                                                            }}
                                                          >
                                                            Cancel
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                              </td>

                                              {/* Attachment Icon */}
                                              <td className="px-3 py-2 text-center relative">
                                                {attr.attribute !== 'Requested Placement Type' && (
                                                  <>
                                                    {attr.attachment ? (
                                                      <button 
                                                        className="text-[#428bca] hover:text-[#3276b1] transition-colors relative group/attachment"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setActiveCommentPopover({ collection: 'request', rowIndex: index, type: 'attachment' });
                                                        }}
                                                      >
                                                        <Paperclip className="w-4 h-4" />
                                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/attachment:opacity-100 transition-opacity pointer-events-none z-50">
                                                          {attr.attachment}
                                                        </span>
                                                      </button>
                                                    ) : (
                                                      <button 
                                                        className="text-gray-300 hover:text-gray-400 transition-colors relative group/addattachment"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setActiveCommentPopover({ collection: 'request', rowIndex: index, type: 'attachment' });
                                                          setTempAttachmentText('');
                                                        }}
                                                      >
                                                        <Paperclip className="w-4 h-4" />
                                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/addattachment:opacity-100 transition-opacity pointer-events-none z-50">
                                                          Add attachment
                                                        </span>
                                                      </button>
                                                    )}
                                                    
                                                    {/* Attachment Popover */}
                                                    {activeCommentPopover?.collection === 'request' && activeCommentPopover?.rowIndex === index && activeCommentPopover?.type === 'attachment' && (
                                                      <div 
                                                        className="absolute right-full top-0 mr-2 bg-white border border-gray-300 rounded shadow-lg p-3 w-64 z-[200]"
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        {attr.attachment ? (
                                                          <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700 truncate flex-1">{attr.attachment}</span>
                                                            <button
                                                              className="ml-2 text-red-600 hover:text-red-700 transition-colors"
                                                              onClick={() => {
                                                                const newAttributes = [...requestAttributes];
                                                                newAttributes[index].attachment = null;
                                                                setRequestAttributes(newAttributes);
                                                                setActiveCommentPopover(null);
                                                              }}
                                                              title="Delete attachment"
                                                            >
                                                              <Trash2 className="w-4 h-4" />
                                                            </button>
                                                          </div>
                                                        ) : (
                                                          <>
                                                            <input
                                                              autoFocus
                                                              type="text"
                                                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                              placeholder="Enter attachment filename"
                                                              value={tempAttachmentText}
                                                              onChange={(e) => setTempAttachmentText(e.target.value)}
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                              <button
                                                                className="px-3 py-1 bg-[#428bca] text-white text-xs rounded hover:bg-[#3276b1]"
                                                                onClick={() => {
                                                                  const newAttributes = [...requestAttributes];
                                                                  newAttributes[index].attachment = tempAttachmentText;
                                                                  setRequestAttributes(newAttributes);
                                                                  setActiveCommentPopover(null);
                                                                  setTempAttachmentText('');
                                                                }}
                                                              >
                                                                Save
                                                              </button>
                                                              <button
                                                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                                onClick={() => {
                                                                  setActiveCommentPopover(null);
                                                                  setTempAttachmentText('');
                                                                }}
                                                              >
                                                                Cancel
                                                              </button>
                                                            </div>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* JJA Request Collection */}
                          <div>
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedMainCollections);
                                if (newExpanded.has('jja1')) {
                                  newExpanded.delete('jja1');
                                } else {
                                  newExpanded.add('jja1');
                                }
                                setExpandedMainCollections(newExpanded);
                              }}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 text-left"
                            >
                              <span className="text-sm text-[#000000] font-bold">JJA Request Collection</span>
                              <div>
                                {expandedMainCollections.has('jja1') ? 
                                  <ChevronUp className="w-4 h-4 text-gray-600" /> : 
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                }
                              </div>
                            </button>
                            
                            {expandedMainCollections.has('jja1') && (
                              <div className="border-t border-gray-300">
                                {/* JJA Request Collection Sub */}
                                <div className="border-b border-gray-200">
                                  <div className="w-full px-3 py-2">
                                    <span className="text-sm text-black italic">JJA Request Collection</span>
                                  </div>
                                  
                                  <div className="px-3 pb-3">
                                    {/* Attributes Table */}
                                    <div className="border border-gray-300 rounded">
                                      <table className="w-full text-sm table-fixed">
                                        <thead>
                                          <tr className="bg-gray-100 border-b border-gray-300 h-10">
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[15%] border-r border-gray-300">Attribute</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[25%] border-r border-gray-300">Description</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[20%] border-r border-gray-300">Value</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[15%] border-r border-gray-300">Expiry</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-[15%] border-r border-gray-300">Ref No.</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-8 border-r border-gray-300"></th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700 w-8"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {jjaAttributes.map((attr, index) => (
                                            <tr key={index} className="border-b border-gray-200 h-10">
                                              {/* Attribute */}
                                              <td className="px-3 py-2 text-sm text-gray-900 font-semibold overflow-hidden" title={attr.attribute}>
                                                <div className="truncate">{attr.attribute}</div>
                                              </td>

                                              {/* Description */}
                                              <td className="px-3 py-2 text-sm text-gray-600 overflow-hidden" title={attr.description}>
                                                <div className="truncate">{attr.description}</div>
                                              </td>

                                              {/* Value */}
                                              <td 
                                                className={`px-3 py-2 text-sm text-gray-900 relative group cursor-pointer attribute-edit-dropdown ${editingAttribute?.collection === 'jja' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'value' ? '' : 'overflow-hidden'}`}
                                                onMouseEnter={() => setHoveredAttributeCell({ collection: 'jja', rowIndex: index, field: 'value' })}
                                                onMouseLeave={() => setHoveredAttributeCell(null)}
                                                onClick={() => setEditingAttribute({ collection: 'jja', rowIndex: index, field: 'value' })}
                                                title={attr.value}
                                              >
                                                {editingAttribute?.collection === 'jja' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'value' ? (
                                                  <>
                                                    {/* JJA Request Boolean - Checkbox toggle */}
                                                    {attr.attribute === 'JJA Request Boolean' && (
                                                      <label className="flex items-center cursor-pointer">
                                                        <input
                                                          ref={textInputRef}
                                                          type="checkbox"
                                                          checked={attr.value === 'Yes'}
                                                          onChange={(e) => {
                                                            const newAttributes = [...jjaAttributes];
                                                            newAttributes[index].value = e.target.checked ? 'Yes' : 'No';
                                                            setJjaAttributes(newAttributes);
                                                          }}
                                                          onBlur={() => setEditingAttribute(null)}
                                                          className="mr-2"
                                                          autoFocus
                                                        />
                                                        <span className="text-sm">{attr.value}</span>
                                                      </label>
                                                    )}
                                                    
                                                    {/* JJA Request Combo - Single select dropdown */}
                                                    {attr.attribute === 'JJA Request Combo' && (
                                                      <div className="absolute left-0 top-0 z-10">
                                                        <select
                                                          ref={selectInputRef}
                                                          value={attr.value}
                                                          onChange={(e) => {
                                                            const newAttributes = [...jjaAttributes];
                                                            newAttributes[index].value = e.target.value;
                                                            setJjaAttributes(newAttributes);
                                                            setEditingAttribute(null);
                                                          }}
                                                          onBlur={() => setEditingAttribute(null)}
                                                          className="min-w-[180px] px-2 py-1 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded shadow-lg"
                                                          size={4}
                                                        >
                                                          <option value="">Select...</option>
                                                          <option value="BS63MIR-ACCOUNT">BS63MIR-ACCOUNT</option>
                                                          <option value="BS64ABC-ACCOUNT">BS64ABC-ACCOUNT</option>
                                                          <option value="BS65XYZ-ACCOUNT">BS65XYZ-ACCOUNT</option>
                                                        </select>
                                                      </div>
                                                    )}
                                                    
                                                    {/* JJA Request Date - keep as is, handled in Expiry field */}
                                                    {attr.attribute === 'JJA Request Date' && (
                                                      <input
                                                        ref={textInputRef}
                                                        type="text"
                                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                                        value={attr.value}
                                                        onChange={(e) => {
                                                          const newAttributes = [...jjaAttributes];
                                                          newAttributes[index].value = e.target.value;
                                                          setJjaAttributes(newAttributes);
                                                        }}
                                                        onBlur={() => setEditingAttribute(null)}
                                                      />
                                                    )}
                                                  </>
                                                ) : (
                                                  <div className="flex items-center justify-between">
                                                    <span className="truncate">{attr.value}</span>
                                                    {hoveredAttributeCell?.collection === 'jja' && hoveredAttributeCell?.rowIndex === index && hoveredAttributeCell?.field === 'value' && (
                                                      <Pencil className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                                    )}
                                                  </div>
                                                )}
                                              </td>

                                              {/* Expiry */}
                                              <td 
                                                className="px-3 py-2 text-sm text-gray-900 relative group cursor-pointer overflow-hidden"
                                                onMouseEnter={() => setHoveredAttributeCell({ collection: 'jja', rowIndex: index, field: 'expiry' })}
                                                onMouseLeave={() => setHoveredAttributeCell(null)}
                                                onClick={() => setEditingAttribute({ collection: 'jja', rowIndex: index, field: 'expiry' })}
                                              >
                                                {editingAttribute?.collection === 'jja' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'expiry' ? (
                                                  <input
                                                    ref={dateInputRef}
                                                    type="date"
                                                    className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                                    value={attr.expiry}
                                                    onChange={(e) => {
                                                      const newAttributes = [...jjaAttributes];
                                                      newAttributes[index].expiry = e.target.value;
                                                      setJjaAttributes(newAttributes);
                                                    }}
                                                    onBlur={() => setEditingAttribute(null)}
                                                  />
                                                ) : (
                                                  <div className="flex items-center justify-between">
                                                    <span className="truncate">{attr.expiry}</span>
                                                    {hoveredAttributeCell?.collection === 'jja' && hoveredAttributeCell?.rowIndex === index && hoveredAttributeCell?.field === 'expiry' && (
                                                      <Pencil className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                                    )}
                                                  </div>
                                                )}
                                              </td>

                                              {/* Ref No */}
                                              <td 
                                                className="px-3 py-2 text-sm text-gray-900 relative group cursor-pointer overflow-hidden"
                                                onMouseEnter={() => setHoveredAttributeCell({ collection: 'jja', rowIndex: index, field: 'refNo' })}
                                                onMouseLeave={() => setHoveredAttributeCell(null)}
                                                onClick={() => setEditingAttribute({ collection: 'jja', rowIndex: index, field: 'refNo' })}
                                              >
                                                {editingAttribute?.collection === 'jja' && editingAttribute?.rowIndex === index && editingAttribute?.field === 'refNo' ? (
                                                  <input
                                                    ref={textInputRef}
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={attr.refNo}
                                                    onChange={(e) => {
                                                      const newAttributes = [...jjaAttributes];
                                                      newAttributes[index].refNo = e.target.value;
                                                      setJjaAttributes(newAttributes);
                                                    }}
                                                    onBlur={() => setEditingAttribute(null)}
                                                  />
                                                ) : (
                                                  <div className="flex items-center justify-between">
                                                    <span className="truncate">{attr.refNo}</span>
                                                    {hoveredAttributeCell?.collection === 'jja' && hoveredAttributeCell?.rowIndex === index && hoveredAttributeCell?.field === 'refNo' && (
                                                      <Pencil className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                                    )}
                                                  </div>
                                                )}
                                              </td>

                                              {/* Comment Icon */}
                                              <td className="px-3 py-2 text-center relative">
                                                {attr.comment ? (
                                                  <button 
                                                    className="text-[#428bca] hover:text-[#3276b1] transition-colors relative group/comment"
                                                    title={attr.comment}
                                                  >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/comment:opacity-100 transition-opacity pointer-events-none z-50">
                                                      {attr.comment}
                                                    </span>
                                                  </button>
                                                ) : (
                                                  <button 
                                                    className="text-gray-300 hover:text-gray-400 transition-colors relative group/addcomment"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setActiveCommentPopover({ collection: 'jja', rowIndex: index, type: 'comment' });
                                                      setTempCommentText('');
                                                    }}
                                                  >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/addcomment:opacity-100 transition-opacity pointer-events-none z-50">
                                                      Add comment
                                                    </span>
                                                  </button>
                                                )}
                                                
                                                {/* Comment Popover */}
                                                {activeCommentPopover?.collection === 'jja' && activeCommentPopover?.rowIndex === index && activeCommentPopover?.type === 'comment' && (
                                                  <div 
                                                    className="absolute right-full top-0 mr-2 bg-white border border-gray-300 rounded shadow-lg p-3 w-64 z-[200]"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <textarea
                                                      autoFocus
                                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                      rows={3}
                                                      placeholder="Type your comment"
                                                      value={tempCommentText}
                                                      onChange={(e) => setTempCommentText(e.target.value)}
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                      <button
                                                        className="px-3 py-1 bg-[#428bca] text-white text-xs rounded hover:bg-[#3276b1]"
                                                        onClick={() => {
                                                          const newAttributes = [...jjaAttributes];
                                                          newAttributes[index].comment = tempCommentText;
                                                          setJjaAttributes(newAttributes);
                                                          setActiveCommentPopover(null);
                                                          setTempCommentText('');
                                                        }}
                                                      >
                                                        Save
                                                      </button>
                                                      <button
                                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                        onClick={() => {
                                                          setActiveCommentPopover(null);
                                                          setTempCommentText('');
                                                        }}
                                                      >
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  </div>
                                                )}
                                              </td>

                                              {/* Attachment Icon */}
                                              <td className="px-3 py-2 text-center relative">
                                                {attr.attachment ? (
                                                  <button 
                                                    className="text-[#428bca] hover:text-[#3276b1] transition-colors relative group/attachment"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setActiveCommentPopover({ collection: 'jja', rowIndex: index, type: 'attachment' });
                                                    }}
                                                  >
                                                    <Paperclip className="w-4 h-4" />
                                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/attachment:opacity-100 transition-opacity pointer-events-none z-50">
                                                      {attr.attachment}
                                                    </span>
                                                  </button>
                                                ) : (
                                                  <button 
                                                    className="text-gray-300 hover:text-gray-400 transition-colors relative group/addattachment"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setActiveCommentPopover({ collection: 'jja', rowIndex: index, type: 'attachment' });
                                                      setTempAttachmentText('');
                                                    }}
                                                  >
                                                    <Paperclip className="w-4 h-4" />
                                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/addattachment:opacity-100 transition-opacity pointer-events-none z-50">
                                                      Add attachment
                                                    </span>
                                                  </button>
                                                )}
                                                
                                                {/* Attachment Popover */}
                                                {activeCommentPopover?.collection === 'jja' && activeCommentPopover?.rowIndex === index && activeCommentPopover?.type === 'attachment' && (
                                                  <div 
                                                    className="absolute right-full top-0 mr-2 bg-white border border-gray-300 rounded shadow-lg p-3 w-64 z-[200]"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    {attr.attachment ? (
                                                      <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700 truncate flex-1">{attr.attachment}</span>
                                                        <button
                                                          className="ml-2 text-red-600 hover:text-red-700 transition-colors"
                                                          onClick={() => {
                                                            const newAttributes = [...jjaAttributes];
                                                            newAttributes[index].attachment = null;
                                                            setJjaAttributes(newAttributes);
                                                            setActiveCommentPopover(null);
                                                          }}
                                                          title="Delete attachment"
                                                        >
                                                          <Trash2 className="w-4 h-4" />
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <>
                                                        <input
                                                          autoFocus
                                                          type="text"
                                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                          placeholder="Enter attachment filename"
                                                          value={tempAttachmentText}
                                                          onChange={(e) => setTempAttachmentText(e.target.value)}
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                          <button
                                                            className="px-3 py-1 bg-[#428bca] text-white text-xs rounded hover:bg-[#3276b1]"
                                                            onClick={() => {
                                                              const newAttributes = [...jjaAttributes];
                                                              newAttributes[index].attachment = tempAttachmentText;
                                                              setJjaAttributes(newAttributes);
                                                              setActiveCommentPopover(null);
                                                              setTempAttachmentText('');
                                                            }}
                                                          >
                                                            Save
                                                          </button>
                                                          <button
                                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                            onClick={() => {
                                                              setActiveCommentPopover(null);
                                                              setTempAttachmentText('');
                                                            }}
                                                          >
                                                            Cancel
                                                          </button>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes and Documents Section */}
                  <div className="mb-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                    <button
                      onClick={() => setShowNotesDocumentsSection(!showNotesDocumentsSection)}
                      className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50"
                    >
                      <h3 className="text-base font-semibold text-gray-900">
                        Notes and Documents <span className="text-gray-500 font-normal">(optional)</span>
                      </h3>
                      {showNotesDocumentsSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {showNotesDocumentsSection && (
                      <div className="p-4">
                        {/* Notes Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                            <button
                              onClick={() => {
                                if (showAddNote) {
                                  // Save the note
                                  if (noteType && noteDate && noteTitle && noteText) {
                                    setNotes([...notes, { type: noteType, date: noteDate, title: noteTitle, text: noteText, private: notePrivate, changedUser: noteChangedUser }]);
                                    setNoteType('');
                                    setNoteDate('');
                                    setNoteTitle('');
                                    setNoteText('');
                                    setNotePrivate(false);
                                    setNoteChangedUser('');
                                    setShowAddNote(false);
                                  }
                                } else {
                                  setShowAddNote(true);
                                }
                              }}
                              className="flex items-center gap-1 text-sm text-[#428bca] hover:text-[#0b5f7c] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Note
                            </button>
                          </div>
                          
                          <div className="border border-gray-300 rounded overflow-hidden">
                            <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
                              <thead>
                                <tr className="bg-gray-100 border-b border-gray-300">
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-300 hover:border-r-2 hover:border-[#428bca] cursor-col-resize w-20">Note Type</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-300 hover:border-r-2 hover:border-[#428bca] cursor-col-resize w-24">Date</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-300 hover:border-r-2 hover:border-[#428bca] cursor-col-resize w-40">Title</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-300 hover:border-r-2 hover:border-[#428bca] cursor-col-resize">Text</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-300 hover:border-r-2 hover:border-[#428bca] cursor-col-resize w-16">Private</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-300 hover:border-r-2 hover:border-[#428bca] cursor-col-resize w-28">Changed User</th>
                                  <th className="px-3 py-2 w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {notes.map((note, index) => (
                                  <tr key={index} className="border-b border-gray-200">
                                    {/* Note Type */}
                                    <td 
                                      className="px-3 py-2 border-r border-gray-200 text-sm text-gray-900 relative group cursor-pointer"
                                      onMouseEnter={() => setHoveredNoteCell({ rowIndex: index, field: 'type' })}
                                      onMouseLeave={() => setHoveredNoteCell(null)}
                                      onClick={() => setEditingNote({ rowIndex: index, field: 'type' })}
                                    >
                                      {editingNote?.rowIndex === index && editingNote?.field === 'type' ? (
                                        <select
                                          className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                          value={note.type}
                                          onChange={(e) => {
                                            const newNotes = [...notes];
                                            newNotes[index].type = e.target.value;
                                            setNotes(newNotes);
                                            setEditingNote(null);
                                          }}
                                          onBlur={() => setEditingNote(null)}
                                          autoFocus
                                        >
                                          <option value="Note">Note</option>
                                          <option value="General">General</option>
                                          <option value="Important">Important</option>
                                          <option value="Urgent">Urgent</option>
                                        </select>
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <span>{note.type}</span>
                                          {hoveredNoteCell?.rowIndex === index && hoveredNoteCell?.field === 'type' && (
                                            <Pencil className="w-3 h-3 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </td>

                                    {/* Date */}
                                    <td 
                                      className="px-3 py-2 border-r border-gray-200 text-sm text-gray-900 relative group cursor-pointer"
                                      onMouseEnter={() => setHoveredNoteCell({ rowIndex: index, field: 'date' })}
                                      onMouseLeave={() => setHoveredNoteCell(null)}
                                      onClick={() => setEditingNote({ rowIndex: index, field: 'date' })}
                                    >
                                      {editingNote?.rowIndex === index && editingNote?.field === 'date' ? (
                                        <input
                                          type="date"
                                          className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                          value={note.date.split('/').reverse().join('-')}
                                          onChange={(e) => {
                                            const newNotes = [...notes];
                                            const dateParts = e.target.value.split('-');
                                            newNotes[index].date = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
                                            setNotes(newNotes);
                                          }}
                                          onBlur={() => setEditingNote(null)}
                                          autoFocus
                                        />
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <span>{note.date}</span>
                                          {hoveredNoteCell?.rowIndex === index && hoveredNoteCell?.field === 'date' && (
                                            <Pencil className="w-3 h-3 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </td>

                                    {/* Title */}
                                    <td 
                                      className="px-3 py-2 border-r border-gray-200 text-sm text-gray-900 relative group cursor-pointer"
                                      onMouseEnter={() => setHoveredNoteCell({ rowIndex: index, field: 'title' })}
                                      onMouseLeave={() => setHoveredNoteCell(null)}
                                      onClick={() => setEditingNote({ rowIndex: index, field: 'title' })}
                                      title={note.title}
                                    >
                                      {editingNote?.rowIndex === index && editingNote?.field === 'title' ? (
                                        <input
                                          ref={textInputRef}
                                          type="text"
                                          className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                          value={note.title}
                                          onChange={(e) => {
                                            const newNotes = [...notes];
                                            newNotes[index].title = e.target.value;
                                            setNotes(newNotes);
                                          }}
                                          onBlur={() => setEditingNote(null)}
                                        />
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <div className="truncate flex-1">{note.title}</div>
                                          {hoveredNoteCell?.rowIndex === index && hoveredNoteCell?.field === 'title' && (
                                            <Pencil className="w-3 h-3 text-gray-400 ml-1 flex-shrink-0" />
                                          )}
                                        </div>
                                      )}
                                    </td>

                                    {/* Text */}
                                    <td 
                                      className="px-3 py-2 border-r border-gray-200 text-sm text-gray-900 relative group cursor-pointer"
                                      onMouseEnter={() => setHoveredNoteCell({ rowIndex: index, field: 'text' })}
                                      onMouseLeave={() => setHoveredNoteCell(null)}
                                      onClick={() => setEditingNote({ rowIndex: index, field: 'text' })}
                                      title={note.text}
                                    >
                                      {editingNote?.rowIndex === index && editingNote?.field === 'text' ? (
                                        <input
                                          ref={textInputRef}
                                          type="text"
                                          className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                          value={note.text}
                                          onChange={(e) => {
                                            const newNotes = [...notes];
                                            newNotes[index].text = e.target.value;
                                            setNotes(newNotes);
                                          }}
                                          onBlur={() => setEditingNote(null)}
                                        />
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <div className="truncate flex-1">{note.text}</div>
                                          {hoveredNoteCell?.rowIndex === index && hoveredNoteCell?.field === 'text' && (
                                            <Pencil className="w-3 h-3 text-gray-400 ml-1 flex-shrink-0" />
                                          )}
                                        </div>
                                      )}
                                    </td>

                                    {/* Private */}
                                    <td 
                                      className="px-3 py-2 border-r border-gray-200 text-sm text-gray-900 relative group cursor-pointer"
                                      onMouseEnter={() => setHoveredNoteCell({ rowIndex: index, field: 'private' })}
                                      onMouseLeave={() => setHoveredNoteCell(null)}
                                      onClick={() => setEditingNote({ rowIndex: index, field: 'private' })}
                                    >
                                      {editingNote?.rowIndex === index && editingNote?.field === 'private' ? (
                                        <select
                                          className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                          value={note.private ? 'Yes' : 'No'}
                                          onChange={(e) => {
                                            const newNotes = [...notes];
                                            newNotes[index].private = e.target.value === 'Yes';
                                            setNotes(newNotes);
                                            setEditingNote(null);
                                          }}
                                          onBlur={() => setEditingNote(null)}
                                          autoFocus
                                        >
                                          <option value="Yes">Yes</option>
                                          <option value="No">No</option>
                                        </select>
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <span>{note.private ? 'Yes' : 'No'}</span>
                                          {hoveredNoteCell?.rowIndex === index && hoveredNoteCell?.field === 'private' && (
                                            <Pencil className="w-3 h-3 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </td>

                                    {/* Changed User */}
                                    <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-900">
                                      {note.changedUser}
                                    </td>

                                    {/* Delete Button */}
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        onClick={() => setNotes(notes.filter((_, i) => i !== index))}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {showAddNote && (
                                  <tr className="border-b border-gray-200 bg-blue-50">
                                    <td className="px-3 py-2 border-r border-gray-200">
                                      <select
                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 h-5"
                                        value={noteType}
                                        onChange={(e) => setNoteType(e.target.value)}
                                      >
                                        <option value="">Select...</option>
                                        <option value="general">General</option>
                                        <option value="important">Important</option>
                                        <option value="urgent">Urgent</option>
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 border-r border-gray-200">
                                      <input
                                        type="date"
                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 h-5"
                                        value={noteDate}
                                        onChange={(e) => setNoteDate(e.target.value)}
                                      />
                                    </td>
                                    <td className="px-3 py-2 border-r border-gray-200">
                                      <input
                                        type="text"
                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 h-5"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        placeholder="Enter title"
                                      />
                                    </td>
                                    <td className="px-3 py-2 border-r border-gray-200">
                                      <input
                                        type="text"
                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 h-5"
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Enter text"
                                      />
                                    </td>
                                    <td className="px-3 py-2 border-r border-gray-200">
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={notePrivate}
                                        onChange={(e) => setNotePrivate(e.target.checked)}
                                      />
                                    </td>
                                    <td className="px-3 py-2 border-r border-gray-200">
                                      <input
                                        type="text"
                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 h-5"
                                        value={noteChangedUser}
                                        onChange={(e) => setNoteChangedUser(e.target.value)}
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        className="text-gray-300 cursor-not-allowed"
                                        disabled
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                )}
                                {notes.length === 0 && !showAddNote && (
                                  <tr>
                                    <td colSpan={7} className="px-3 py-8 text-center text-gray-500 text-sm">
                                      No notes added. Click "Add Note" to create one.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-300 mb-6"></div>

                        {/* Documents Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Documents</h4>
                            <button
                              onClick={() => setShowAddDocument(!showAddDocument)}
                              className="flex items-center gap-1 text-sm text-[#428bca] hover:text-[#0b5f7c] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Document
                            </button>
                          </div>
                          
                          <div className="border border-gray-300 rounded overflow-hidden">
                            <table className="w-full text-sm table-fixed">
                              <thead>
                                <tr className="bg-gray-100 border-b border-gray-300">
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 w-1/4">Title</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 w-1/2">Description</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 w-1/5">Document</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 w-12"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {documents.map((doc, index) => (
                                  <tr key={index} className="border-b border-gray-200">
                                    {/* Title */}
                                    <td 
                                      className="px-3 py-2 text-sm text-gray-900 relative group cursor-pointer"
                                      onMouseEnter={() => setHoveredDocumentCell({ rowIndex: index, field: 'title' })}
                                      onMouseLeave={() => setHoveredDocumentCell(null)}
                                      onClick={() => setEditingDocument({ rowIndex: index, field: 'title' })}
                                    >
                                      {editingDocument?.rowIndex === index && editingDocument?.field === 'title' ? (
                                        <input
                                          ref={textInputRef}
                                          type="text"
                                          className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                          value={doc.title}
                                          onChange={(e) => {
                                            const newDocuments = [...documents];
                                            newDocuments[index].title = e.target.value;
                                            setDocuments(newDocuments);
                                          }}
                                          onBlur={() => setEditingDocument(null)}
                                        />
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <span>{doc.title}</span>
                                          {hoveredDocumentCell?.rowIndex === index && hoveredDocumentCell?.field === 'title' && (
                                            <Pencil className="w-3 h-3 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </td>

                                    {/* Description */}
                                    <td 
                                      className="px-3 py-2 text-sm text-gray-900 relative group cursor-pointer"
                                      onMouseEnter={() => setHoveredDocumentCell({ rowIndex: index, field: 'description' })}
                                      onMouseLeave={() => setHoveredDocumentCell(null)}
                                      onClick={() => setEditingDocument({ rowIndex: index, field: 'description' })}
                                    >
                                      {editingDocument?.rowIndex === index && editingDocument?.field === 'description' ? (
                                        <input
                                          ref={textInputRef}
                                          type="text"
                                          className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                                          value={doc.description}
                                          onChange={(e) => {
                                            const newDocuments = [...documents];
                                            newDocuments[index].description = e.target.value;
                                            setDocuments(newDocuments);
                                          }}
                                          onBlur={() => setEditingDocument(null)}
                                        />
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <span>{doc.description}</span>
                                          {hoveredDocumentCell?.rowIndex === index && hoveredDocumentCell?.field === 'description' && (
                                            <Pencil className="w-3 h-3 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </td>

                                    {/* Document */}
                                    <td className="px-3 py-2 text-sm">
                                      <button 
                                        className="text-[#428bca] hover:text-[#0b5f7c] hover:underline transition-colors text-sm"
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                              const newDocuments = [...documents];
                                              newDocuments[index].fileName = file.name;
                                              setDocuments(newDocuments);
                                            }
                                          };
                                          input.click();
                                        }}
                                      >
                                        {doc.fileName || 'select file'}
                                      </button>
                                    </td>

                                    {/* Delete Button */}
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {showAddDocument && (
                                  <tr className="border-b border-gray-200 bg-blue-50">
                                    <td className="px-3 py-2">
                                      <input
                                        type="text"
                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 placeholder:text-gray-500"
                                        value={documentTitle}
                                        onChange={(e) => setDocumentTitle(e.target.value)}
                                        placeholder="Enter title"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="text"
                                        className="w-full px-0 py-0 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 placeholder:text-gray-500"
                                        value={documentDescription}
                                        onChange={(e) => setDocumentDescription(e.target.value)}
                                        placeholder="Enter description"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <button 
                                        className="text-[#428bca] hover:text-[#0b5f7c] hover:underline transition-colors text-sm"
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                              const newDoc = {
                                                title: documentTitle || 'Untitled',
                                                description: documentDescription,
                                                fileName: file.name
                                              };
                                              setDocuments([...documents, newDoc]);
                                              setDocumentTitle('');
                                              setDocumentDescription('');
                                              setShowAddDocument(false);
                                            }
                                          };
                                          input.click();
                                        }}
                                      >
                                        select file
                                      </button>
                                    </td>
                                    
                                    {/* Disabled Delete Button */}
                                    <td className="px-3 py-2 text-center">
                                      <Trash2 className="w-4 h-4 text-gray-300" />
                                    </td>
                                  </tr>
                                )}
                                {!showAddDocument && documents.length === 0 && (
                                  <tr>
                                    <td colSpan={3} className="px-3 py-8 text-center text-gray-500 text-sm">
                                      No documents added. Click "Add Document" to upload one.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-300 px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div>
                  <button className="text-sm text-gray-600 hover:text-gray-800 underline">
                    Clear Defaults
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCreateRequestSheet(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`Draft requests created for ${createRequestSelectedStudentsList.length} student${createRequestSelectedStudentsList.length > 1 ? 's' : ''}`);
                      setShowCreateRequestSheet(false);
                    }}
                    className="px-4 py-2 text-sm text-white bg-[#428bca] rounded hover:bg-[#3276b1]"
                  >
                    Create Draft Requests
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }