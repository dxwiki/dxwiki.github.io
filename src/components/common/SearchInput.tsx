'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, CircleHelp, ChevronLeft } from 'lucide-react';
import SearchTip from '@/components/search/SearchTip';
import TooltipButton from '@/components/ui/TooltipButton';

interface SearchInputProps {
  suggestions?: string[];
  tip?: boolean;
  filter?: boolean;
  termsLength?: number;
  goBack?: boolean;
}

const SearchInput = ({ suggestions, tip = true, filter = false, termsLength, goBack = false }: SearchInputProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = termsLength ? `${ termsLength }개의 데이터 용어 검색` : '검색어 입력해주세요';
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [isHovering, setIsHovering] = useState(false);

  const filteredSuggestions = suggestions?.filter((suggestion) =>
    suggestion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth >= 640) {
      const timeoutId = setTimeout(() => {
        setShowTip(isHovering);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isHovering, windowWidth]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest('.suggestions-modal')) {
      setIsModalOpen(false);
    }
  };

  const redirect = (e: React.KeyboardEvent<HTMLInputElement>, term: string) => {
    if (e.key === 'Enter') {
      window.location.href = `/posts?q=${ term
        .trim()
        .split(' ')
        .join('+') }`;
    }
  };

  const handleTipClick = () => {
    if (windowWidth < 640) {
      setShowTip(!showTip);
    }
  };

  return (
    <div className="relative w-full">
      <div className={`w-full ${ goBack ? 'grid grid-cols-[36px_minmax(0,1fr)] p-4 border border-extreme-light rounded-2xl hover:bg-extreme-light' : 'flex items-center' } items-center gap-2`}>
        {goBack && (
          <TooltipButton
            isLink
            href="/"
            tooltip="홈으로"
            className='p-2'
          >
            <ChevronLeft className='size-4' />
          </TooltipButton>
        )}
        <div className="w-full px-3 flex items-center border border-light rounded-full focus-within:border-accent bg-background">
          <Search className="text-main size-4" />
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            placeholder={placeholder}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsModalOpen(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => redirect(e, searchTerm)}
            className="w-full p-2 mr-2 bg-background outline-none text-main rounded-md"
          />
          {tip && (
            <button
              className={`${ showTip ? 'text-primary' : 'text-light' } group flex items-center hover:text-accent`}
              onClick={handleTipClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <CircleHelp className="size-5" />
            </button>
          )}
        </div>
        {filter && (
          <TooltipButton
            onClick={() => setIsFilterActive(!isFilterActive)}
            tooltip="필터"
            className='p-2'
          >
            <Filter className='size-4' />
          </TooltipButton>
        )}
        {filter && (
          <div className={`opacity-0 text-sub ${ isFilterActive ? 'opacity-100' : '' }`}>
            {'필터:'}
          </div>
        )}
      </div>
      {showTip && (
        <div className='w-full absolute top-[40px] right-0 animate-slideDown'>
          <SearchTip />
        </div>
      )}
      {isModalOpen && (
        <div
          className={`absolute top-12 right-0 mt-2 ${ goBack ? 'w-[calc(100%_-44px)]' : 'w-full' } border border-light rounded-md shadow-lg max-h-60 overflow-y-auto suggestions-modal animate-slideDown bg-background opacity-100`}
        >
          {filteredSuggestions && filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchTerm(suggestion);
                  setIsModalOpen(false);
                }}
              >
                {suggestion}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sub bg-background min-h-56">{'검색어 추천'}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
