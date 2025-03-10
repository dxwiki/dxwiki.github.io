'use client';

import { References } from '@/types';
import React, { useMemo } from 'react';

interface ReferencesSectionProps {
  references: References;
}

// 그리드 아이템 타입 정의
interface GridItem {
  id: string;
  title: string;
  type: string;
  details: string;
  external_link?: string;
  colSpan: number;
  rowIndex?: number;
  titleLength: number;
}

// 입력 아이템 타입 정의
interface ReferenceItem {
  title?: string;
  type: string;
  details?: string;
  external_link?: string;
}

// 그리드 레이아웃 생성 함수
const createGridLayout = (items: ReferenceItem[], maxCols: number) => {
  if (items.length === 0) return [];
  if (items.length === 1) return [{
    ...items[0],
    id: '0-0',
    colSpan: maxCols,
    titleLength: items[0].title?.length || 0,
    title: items[0].title || '',
    details: items[0].details || '',
  }];

  // 텍스트 길이에 따라 colSpan 결정 및 기본 속성 설정
  const gridItems: GridItem[] = items.map((item, index) => {
    const titleLength = item.title?.length || 0;

    // 텍스트 길이에 따라 colSpan 결정
    let colSpan = 1;
    if (titleLength > 14) colSpan = 2;
    if (titleLength > 30) colSpan = Math.min(3, maxCols);
    if (titleLength > 45) colSpan = maxCols;

    return {
      ...item,
      id: `${ index }`,
      colSpan,
      titleLength,
      title: item.title || '',
      details: item.details || '',
    };
  });

  // 모든 아이템을 colSpan이 큰 순서대로 정렬
  gridItems.sort((a, b) => b.colSpan - a.colSpan || b.titleLength - a.titleLength);

  // 각 행에 배치된 아이템의 colSpan 합계를 추적
  const rows: number[] = [0];
  const rowItems: { [key: number]: GridItem[] } = { 0: [] };

  // 각 아이템에 행 번호 할당
  gridItems.forEach((item) => {
    // 현재 아이템이 들어갈 수 있는 행 찾기
    let rowIndex = rows.findIndex((sum) => sum + item.colSpan <= maxCols);

    // 적합한 행이 없으면 새 행 추가
    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push(0);
      rowItems[rowIndex] = [];
    }

    // 해당 행에 아이템 추가
    rows[rowIndex] += item.colSpan;
    item.rowIndex = rowIndex;
    rowItems[rowIndex].push(item);
  });

  // 각 행의 아이템을 제목 길이에 따라 정렬하고 남은 공간 채우기
  Object.keys(rowItems).forEach((rowIndexStr) => {
    const rowIndex = parseInt(rowIndexStr);
    const itemsInRow = rowItems[rowIndex];

    // 각 행의 아이템을 제목 길이에 따라 정렬 (가장 긴 제목이 마지막에 오도록)
    itemsInRow.sort((a, b) => a.titleLength - b.titleLength);

    // 행의 남은 공간 채우기
    const rowSpace = maxCols - rows[rowIndex];
    if (itemsInRow.length > 0 && rowSpace > 0) {
      // 해당 행의 마지막 아이템의 colSpan을 남은 공간만큼 증가
      const lastItem = itemsInRow[itemsInRow.length - 1];
      lastItem.colSpan += rowSpace;
      rows[rowIndex] += rowSpace;
    }
  });

  // 행 번호 순서대로 아이템 정렬
  const sortedItems: GridItem[] = [];
  Object.keys(rowItems)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((rowIndex) => {
      sortedItems.push(...rowItems[rowIndex]);
    });

  return sortedItems;
};

const ReferencesGrid = ({ references }: ReferencesSectionProps) => {
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = React.useState(false);
  const tooltipRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 모든 참고자료를 하나의 배열로 통합
  const allReferences = useMemo(() => [
    ...(references.tutorials?.map((item) => ({
      type: '튜토리얼',
      details: item.platform,
      ...item,
    })) || []),
    ...(references.books?.map((item) => ({
      type: '참고서적',
      details: [
        item.authors && '저자: ' + item.authors.join(', '),
        item.publisher && '(' + item.publisher,
        item.year && !item.publisher
          ? `(${ item.year })`
          : item.year && item.publisher
            ? `, ${ item.year })`
            : ')',
        item.isbn && `\nISBN: ${ item.isbn }`,
      ].filter(Boolean).join(' '),
      ...item,
    })) || []),
    ...(references.academic?.map((item) => ({
      type: '연구논문',
      details: [
        item.authors && '저자: ' + item.authors.join(', '),
        item.year && `(${ item.year })`,
        item.doi && `\nDOI: ${ item.doi }`,
      ].filter(Boolean).join(' '),
      ...item,
    })) || []),
    ...(references.opensource?.map((item) => ({
      type: '오픈소스',
      details: [
        item.description,
        item.license && `License: ${ item.license }`,
      ].filter(Boolean).join('\n'),
      title: item.name,
      ...item,
    })) || []),
  ], [references]);

  // 그리드 아이템 생성 - 화면 크기에 따라 최대 열 수 조정
  const gridItems = useMemo(() =>
    createGridLayout(allReferences, isLargeScreen ? 4 : 3),
  [allReferences, isLargeScreen]
  );

  if (allReferences.length === 0) return null;

  return (
    <section className="group-section break-all">
      {/* <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-section-title transition-opacity">{'#'}</span>
        {'참고 자료'}
      </h2> */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-px bg-light border border-light auto-rows-auto">
        {gridItems.map((item) => {
          const tooltipId = `${ item.type }-${ item.id }`;

          return (
            <div
              key={tooltipId}
              className="group relative bg-background hover:bg-gray5"
              style={{
                gridColumn: `span ${ item.colSpan } / span ${ item.colSpan }`,
              }}
              onMouseEnter={() => setActiveTooltip(tooltipId)}
              onMouseLeave={() => setActiveTooltip(null)}
              ref={(el) => {
                if (el) tooltipRefs.current[tooltipId] = el;
              }}
            >
              <a
                href={item.external_link || '#'}
                target={item.external_link ? '_blank' : undefined}
                rel={item.external_link ? 'noopener noreferrer' : undefined}
                onClick={!item.external_link ? (e) => e.preventDefault() : undefined}
                className={`
                  block size-full p-2.5 hover:outline hover:outline-1 hover:outline-primary text-center
                  transition-colors duration-200
                  ${ item.external_link ? '' : 'cursor-default' }
                `}
              >
                <span className="group-hover:text-primary group-hover:underline underline-offset-4 hover:decoration-primary text-sm font-medium break-words">{item.title}</span>
              </a>

              {activeTooltip === tooltipId && item.details && (
                <div
                  className="animate-slideDown absolute top-full mt-2 left-0 border border-primary
                  bg-gray5 text-main text-xs p-2 rounded shadow-lg
                  z-50 before:content-[''] before:absolute before:top-[-4px] before:left-[15px]
                  before:size-0 before:border-x-4 before:border-x-transparent before:border-b-4
                  before:border-b-primary"
                  style={{
                    width: tooltipRefs.current[tooltipId]?.offsetWidth || 'auto',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                  }}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-gray2">{item.type}</span>
                    <p className="whitespace-pre-line text-[13px] break-words">{item.details}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ReferencesGrid;