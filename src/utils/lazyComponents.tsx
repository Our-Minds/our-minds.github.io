
import lazyWithRetry from '@/utils/lazyWithRetry';
import { LazyPageWrapper } from '@/components/layout/LazyPageWrapper';

// Lazy load major pages
export const LazyHomePage = lazyWithRetry(() => import('@/pages/HomePage'));
export const LazyChatPage = lazyWithRetry(() => import('@/pages/ChatPage'));
export const LazyProfilePage = lazyWithRetry(() => import('@/pages/ProfilePage'));
export const LazyConsultPage = lazyWithRetry(() => import('@/pages/ConsultPage'));
export const LazyBookSessionPage = lazyWithRetry(() => import('@/pages/BookSessionPage'));
export const LazyAdminPanel = lazyWithRetry(() => import('@/pages/AdminPanel'));
export const LazyAboutPage = lazyWithRetry(() => import('@/pages/AboutPage'));
export const LazyStoryPage = lazyWithRetry(() => import('@/pages/StoryPage'));
export const LazyPublicProfilePage = lazyWithRetry(() => import('@/pages/PublicProfilePage'));

// Wrapper components with Suspense
export const HomePage = () => (
  <LazyPageWrapper>
    <LazyHomePage />
  </LazyPageWrapper>
);

export const ChatPage = () => (
  <LazyPageWrapper>
    <LazyChatPage />
  </LazyPageWrapper>
);

export const ProfilePage = () => (
  <LazyPageWrapper>
    <LazyProfilePage />
  </LazyPageWrapper>
);

export const ConsultPage = () => (
  <LazyPageWrapper>
    <LazyConsultPage />
  </LazyPageWrapper>
);

export const BookSessionPage = () => (
  <LazyPageWrapper>
    <LazyBookSessionPage />
  </LazyPageWrapper>
);

export const AdminPanel = () => (
  <LazyPageWrapper>
    <LazyAdminPanel />
  </LazyPageWrapper>
);

export const AboutPage = () => (
  <LazyPageWrapper>
    <LazyAboutPage />
  </LazyPageWrapper>
);

export const StoryPage = () => (
  <LazyPageWrapper>
    <LazyStoryPage />
  </LazyPageWrapper>
);

export const PublicProfilePage = () => (
  <LazyPageWrapper>
    <LazyPublicProfilePage />
  </LazyPageWrapper>
);
