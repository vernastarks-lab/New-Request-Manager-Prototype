import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import svgPaths from "./svg-z8bvjdxay9";

function Frame46({ studentName }: { studentName?: string }) {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Open_Sans:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.07px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Score Breakdown{studentName ? ` - ${studentName}` : ''}
      </p>
    </div>
  );
}

function Delete({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="relative shrink-0 size-[14px] cursor-pointer hover:opacity-80" data-name="delete">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="delete">
          <path d={svgPaths.p3228650} id="Line" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="4" />
          <path d={svgPaths.p2672ecf0} id="Line_2" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </button>
  );
}

function Frame47({ onClose, studentName }: { onClose?: () => void; studentName?: string }) {
  return (
    <div className="bg-[#07587a] h-[47px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[322px] h-[47px] items-center px-[11px] py-[13px] relative w-full">
          <Frame46 studentName={studentName} />
          <Delete onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ isExpanded, onClick }: { isExpanded?: boolean; onClick?: () => void }) {
  return (
    <div 
      className="absolute left-0 size-[14px] top-[3px] cursor-pointer hover:opacity-70 transition-transform" 
      data-name="chevron/right"
      onClick={onClick}
      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="chevron/right">
          <path d={svgPaths.p798be00} fill="var(--fill-0, #2A2A2A)" id="chevron right" />
        </g>
      </svg>
    </div>
  );
}

function Frame51({ isExpanded, onToggle }: { isExpanded?: boolean; onToggle?: () => void }) {
  return (
    <div className="h-[20px] relative shrink-0 w-[172px]">
      <ChevronRight isExpanded={isExpanded} onClick={onToggle} />
      <p className="absolute font-['Open_Sans:Regular',_sans-serif] font-normal leading-[20px] left-[16px] text-[14px] text-black text-nowrap top-0 tracking-[-0.07px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Travel Time
      </p>
    </div>
  );
}

function Frame52({ percentage }: { percentage: number }) {
  return (
    <div className="font-['Open_Sans:Regular',_sans-serif] font-normal h-[20px] leading-[20px] relative shrink-0 text-[14px] text-black text-nowrap tracking-[-0.07px] w-[155px] whitespace-pre">
      <p className="absolute left-0 top-0" style={{ fontVariationSettings: "'wdth' 100" }}>
        3 matches of 3
      </p>
      <p className="absolute left-[124px] top-0" style={{ fontVariationSettings: "'wdth' 100" }}>
        {percentage}
      </p>
    </div>
  );
}

function Frame50({ isExpanded, onToggle, percentage }: { isExpanded?: boolean; onToggle?: () => void; percentage: number }) {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#ececec] border-[0px_1px] border-solid bottom-0 left-[-1px] pointer-events-none right-[-1px] top-0" />
      <div className="flex flex-col size-full">
        <div className="flex flex-row items-center h-[34px]">
          <div className="box-border content-stretch flex gap-[137px] h-[34px] items-center px-[7px] py-[6px] relative w-full">
            <Frame51 isExpanded={isExpanded} onToggle={onToggle} />
            <Frame52 percentage={percentage} />
          </div>
        </div>
        {isExpanded && (
          <div className="px-[7px] py-[8px] border-t border-[#ececec]">
            <div className="flex flex-col gap-2 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-black">Travel mode</span>
                <span className="text-black">Car</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black">Location (Route)</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black">Location (Time in Minutes)</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRight1({ isExpanded, onClick }: { isExpanded?: boolean; onClick?: () => void }) {
  return (
    <div 
      className="absolute left-0 size-[14px] top-[3px] cursor-pointer hover:opacity-70 transition-transform" 
      data-name="chevron/right"
      onClick={onClick}
      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="chevron/right">
          <path d={svgPaths.p798be00} fill="var(--fill-0, #2A2A2A)" id="chevron right" />
        </g>
      </svg>
    </div>
  );
}

function Frame54({ isExpanded, onToggle }: { isExpanded?: boolean; onToggle?: () => void }) {
  return (
    <div className="h-[20px] relative shrink-0 w-[172px]">
      <ChevronRight1 isExpanded={isExpanded} onClick={onToggle} />
      <p className="absolute font-['Open_Sans:Regular',_sans-serif] font-normal leading-[20px] left-[16px] text-[14px] text-black text-nowrap top-0 tracking-[-0.07px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Student Match Specialism (Agency)
      </p>
    </div>
  );
}

function Frame55({ percentage }: { percentage: number }) {
  return (
    <div className="font-['Open_Sans:Regular',_sans-serif] font-normal h-[20px] leading-[20px] relative shrink-0 text-[14px] text-black text-nowrap tracking-[-0.07px] w-[155px] whitespace-pre">
      <p className="absolute left-0 top-0" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 matches of 1
      </p>
      <p className="absolute left-[124px] top-0" style={{ fontVariationSettings: "'wdth' 100" }}>
        {percentage}
      </p>
    </div>
  );
}

function Frame56({ isExpanded, onToggle, percentage }: { isExpanded?: boolean; onToggle?: () => void; percentage: number }) {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#ececec] border-[0px_1px] border-solid bottom-0 left-[-1px] pointer-events-none right-[-1px] top-0" />
      <div className="flex flex-col size-full">
        <div className="flex flex-row items-center h-[34px]">
          <div className="box-border content-stretch flex gap-[137px] h-[34px] items-center px-[7px] py-[6px] relative w-full">
            <Frame54 isExpanded={isExpanded} onToggle={onToggle} />
            <Frame55 percentage={percentage} />
          </div>
        </div>
        {isExpanded && (
          <div className="px-[7px] py-[8px] border-t border-[#ececec]">
            <div className="flex flex-col gap-2 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-black">Specialism</span>
                <span className="text-black">Emergency Care</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRight2({ isExpanded, onClick }: { isExpanded?: boolean; onClick?: () => void }) {
  return (
    <div 
      className="absolute left-0 size-[14px] top-[3px] cursor-pointer hover:opacity-70 transition-transform" 
      data-name="chevron/right"
      onClick={onClick}
      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="chevron/right">
          <path d={svgPaths.p798be00} fill="var(--fill-0, #2A2A2A)" id="chevron right" />
        </g>
      </svg>
    </div>
  );
}

function Frame57({ isExpanded, onToggle }: { isExpanded?: boolean; onToggle?: () => void }) {
  return (
    <div className="h-[20px] relative shrink-0 w-[172px]">
      <ChevronRight2 isExpanded={isExpanded} onClick={onToggle} />
      <p className="absolute font-['Open_Sans:Regular',_sans-serif] font-normal leading-[20px] left-[16px] text-[14px] text-black text-nowrap top-0 tracking-[-0.07px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Placement History (Match on Agency)
      </p>
    </div>
  );
}

function Frame58({ percentage, agencyName }: { percentage: number; agencyName: string }) {
  return (
    <div className="font-['Open_Sans:Regular',_sans-serif] font-normal h-[20px] leading-[20px] relative shrink-0 text-[14px] text-black text-nowrap tracking-[-0.07px] w-[155px] whitespace-pre">
      <p className="absolute left-0 top-0" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 matches of 1
      </p>
      <p className="absolute left-[124px] top-0" style={{ fontVariationSettings: "'wdth' 100" }}>
        {percentage}
      </p>
    </div>
  );
}

function Frame59({ isExpanded, onToggle, percentage, agencyName }: { isExpanded?: boolean; onToggle?: () => void; percentage: number; agencyName: string }) {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#ececec] border-[0px_1px] border-solid bottom-0 left-[-1px] pointer-events-none right-[-1px] top-0" />
      <div className="flex flex-col size-full">
        <div className="flex flex-row items-center h-[34px]">
          <div className="box-border content-stretch flex gap-[137px] h-[34px] items-center px-[7px] py-[6px] relative w-full">
            <Frame57 isExpanded={isExpanded} onToggle={onToggle} />
            <Frame58 percentage={percentage} agencyName={agencyName} />
          </div>
        </div>
        {isExpanded && (
          <div className="px-[7px] py-[8px] border-t border-[#ececec]">
            <div className="flex flex-col gap-2 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-black">Agency</span>
                <span className="text-black">{agencyName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MainButton({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-[#337ab7] box-border content-stretch flex gap-[4px] items-center justify-center px-[13px] py-[7px] relative rounded-[4px] shrink-0 cursor-pointer hover:bg-[#2a6496]" data-name="Main button">
      <div aria-hidden="true" className="absolute border border-[#006a94] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Open_Sans:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.07px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Close
      </p>
    </button>
  );
}

function ButtonButtonMain({ onClick }: { onClick?: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Button/.button main">
      <MainButton onClick={onClick} />
    </div>
  );
}

function Button({ onClick }: { onClick?: () => void }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Button">
      <ButtonButtonMain onClick={onClick} />
    </div>
  );
}

function Frame53({ onClose }: { onClose?: () => void }) {
  return (
    <div className="bg-[#d9d9d9] h-[52px] relative rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full">
      <div className="flex flex-col items-end justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] h-[52px] items-end justify-center px-[8px] py-[9px] relative w-full">
          <Button onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

interface RuleRow {
  ruleType: 'Criteria (all)' | 'Criteria (any)' | 'Score';
  ruleName: string;
  result: 'Pass' | 'Fail' | number;
  groupId?: string; // For grouping "Criteria (any)" rules
}

function RuleTable({ rules }: { rules: RuleRow[] }) {
  // Calculate the ranking score from rules
  const scoreRule = rules.find(rule => rule.ruleType === 'Score');
  const rankingScore = scoreRule && typeof scoreRule.result === 'number' ? scoreRule.result : 0;

  return (
    <div className="bg-white relative shrink-0 w-full px-[8px] py-[8px]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f5f5f5] border-b border-[#ececec]">
            <th className="px-[7px] py-[8px] text-left font-['Open_Sans:Regular',_sans-serif] font-normal text-[14px] text-black tracking-[-0.07px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Rule Type
            </th>
            <th className="px-[7px] py-[8px] text-left font-['Open_Sans:Regular',_sans-serif] font-normal text-[14px] text-black tracking-[-0.07px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Rule Name
            </th>
            <th className="px-[7px] py-[8px] text-left font-['Open_Sans:Regular',_sans-serif] font-normal text-[14px] text-black tracking-[-0.07px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Result
            </th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => {
            const isFirstInGroup = index === 0 || rules[index - 1].groupId !== rule.groupId;
            const isLastInGroup = index === rules.length - 1 || rules[index + 1].groupId !== rule.groupId;
            const isInGroup = rule.groupId !== undefined;

            return (
              <tr 
                key={index} 
                className={`border-b border-[#ececec] ${
                  isInGroup && rule.ruleType === 'Criteria (any)' 
                    ? `border-l-2 border-r-2 ${isFirstInGroup ? 'border-t-2' : ''} ${isLastInGroup ? 'border-b-2' : ''} border-l-[#428bca] border-r-[#428bca] border-t-[#428bca] ${isLastInGroup ? 'border-b-[#428bca]' : ''}`
                    : ''
                }`}
              >
                <td className="px-[7px] py-[8px] font-['Open_Sans:Regular',_sans-serif] font-normal text-[14px] text-black tracking-[-0.07px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {rule.ruleType}
                </td>
                <td className="px-[7px] py-[8px] font-['Open_Sans:Regular',_sans-serif] font-normal text-[14px] text-black tracking-[-0.07px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {rule.ruleName}
                </td>
                <td className="px-[7px] py-[8px] font-['Open_Sans:Regular',_sans-serif] font-normal text-[14px] tracking-[-0.07px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {rule.result === 'Pass' ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Pass
                    </span>
                  ) : rule.result === 'Fail' ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <X className="w-4 h-4" />
                      Fail
                    </span>
                  ) : (
                    <span className="text-black">{rule.result}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 px-[7px] font-['Open_Sans:Regular',_sans-serif] text-[14px] tracking-[-0.07px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="font-bold text-black">Result: </span>
        <span className="text-green-600">Criteria Met</span>
        <span className="text-black"> ({rankingScore})</span>
      </div>
    </div>
  );
}

export default function MatchBreakdown({ onClose, ranking = 95, agencyName = '', studentName = '' }: { onClose?: () => void; ranking?: number; agencyName?: string; studentName?: string }) {
  // Define the rules data
  const rules: RuleRow[] = [
    {
      ruleType: 'Criteria (all)',
      ruleName: 'Match on specialism = Emergency Care',
      result: 'Pass'
    },
    {
      ruleType: 'Criteria (any)',
      ruleName: 'Location (Route) < 10km',
      result: 'Pass',
      groupId: 'travel-time'
    },
    {
      ruleType: 'Criteria (any)',
      ruleName: 'Location (Time in Minutes) < 30',
      result: 'Pass',
      groupId: 'travel-time'
    },
    {
      ruleType: 'Score',
      ruleName: 'Placement History had at least one placement with this experience',
      result: ranking
    }
  ];

  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Match Breakdown">
      <Frame47 onClose={onClose} studentName={studentName} />
      <RuleTable rules={rules} />
      <Frame53 onClose={onClose} />
    </div>
  );
}