import React from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { DataProvider, useData } from './context/DataContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { FoundersPage } from './pages/FoundersPage.tsx';
import { FounderDetailPage } from './pages/FounderDetailPage.tsx';
import { BrandsPage } from './pages/BrandsPage.tsx';
import { BrandDetailPage } from './pages/BrandDetailPage.tsx';
import { PodcastsPage } from './pages/PodcastsPage.tsx';
import { PodcastDetailPage } from './pages/PodcastDetailPage.tsx';
import { ArticlePage } from './pages/ArticlePage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { AboutPage, ContactPage, AdvertisePage, EditorialPolicyPage, LegalPage } from './pages/StaticPages.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';

function AppContent() {
  const { currentPath } = useData();

  // Admin Route Check
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return <AdminDashboard />;
  }

  // Parse path and sub-paths
  const renderCurrentView = () => {
    // 1. Article Page /news/:slug
    if (currentPath.startsWith('/news/')) {
      const slug = currentPath.replace('/news/', '').split('?')[0].split('#')[0];
      return <ArticlePage slug={slug} />;
    }

    // 2. Founder Detail /founders/:slug
    if (currentPath.startsWith('/founders/') && currentPath !== '/founders') {
      const slug = currentPath.replace('/founders/', '').split('?')[0].split('#')[0];
      return <FounderDetailPage slug={slug} />;
    }

    // 3. Brand Detail /brands/:slug
    if (currentPath.startsWith('/brands/') && currentPath !== '/brands') {
      const slug = currentPath.replace('/brands/', '').split('?')[0].split('#')[0];
      return <BrandDetailPage slug={slug} />;
    }

    // 4. Podcast Detail /podcasts/:slug
    if (currentPath.startsWith('/podcasts/') && currentPath !== '/podcasts') {
      const slug = currentPath.replace('/podcasts/', '').split('?')[0].split('#')[0];
      return <PodcastDetailPage slug={slug} />;
    }

    // Static / Category Routes
    switch (currentPath) {
      case '/startups':
        return (
          <CategoryPage
            categorySlug="startups"
            title="Startups & Hard Tech"
            subtitle="Deep tech prototypes, factory floor manufacturing, and venture capital realities."
          />
        );
      case '/founders':
        return <FoundersPage />;
      case '/podcasts':
        return <PodcastsPage />;
      case '/brands':
        return <BrandsPage />;
      case '/culture':
        return (
          <CategoryPage
            categorySlug="culture"
            title="Internet Culture & Memetics"
            subtitle="Startup memes, founder humor, and unfiltered commentary from the builder trenches."
          />
        );
      case '/solana':
        return (
          <CategoryPage
            categorySlug="solana"
            title="Solana Builder Desk"
            subtitle="High-throughput state compression, developer stories, and internet-native media rails."
          />
        );
      case '/search':
        return <SearchPage />;
      case '/about':
        return <AboutPage />;
      case '/contact':
        return <ContactPage />;
      case '/advertise':
        return <AdvertisePage />;
      case '/editorial-policy':
        return <EditorialPolicyPage />;
      case '/privacy':
        return <LegalPage type="privacy" />;
      case '/terms':
        return <LegalPage type="terms" />;
      case '/':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080908] text-white flex flex-col font-sans selection:bg-[#C6FF53] selection:text-black">
      <Header />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
