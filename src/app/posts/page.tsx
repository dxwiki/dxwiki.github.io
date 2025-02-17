import { fetchTermsData } from '@/utils/termsData';
import { SearchDetailInput } from '@/components/search/SearchDetailInput';
import { Suspense } from 'react';
import PostList from '@/components/posts/PostList';
import Footer from '@/components/common/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: '포스트 목록',
};

export default async function PostsPage() {
  const terms = await fetchTermsData();

  const itemsPerPage = 12;
  const totalPages = Math.ceil(terms.length / itemsPerPage);

  return (
    <div className="relative">
      <Suspense fallback={<LoadingSpinner />}>
        <div className='animate-intro relative z-20'>
          <SearchDetailInput />
        </div>
        <div className='animate-introSecond mt-5 z-10'>
          <PostList totalPages={totalPages} itemsPerPage={itemsPerPage} />
        </div>
      </Suspense>
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </div>
  );
}