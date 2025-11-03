import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

// Import our component modules
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavTabs from '@/components/admin/AdminNavTabs';

// Import tab components individually to isolate any issues
const DashboardTab = React.lazy(() => import('@/components/admin/dashboard/DashboardTab'));
const UserManagementTab = React.lazy(() => import('@/components/admin/users/UserManagementTab'));
const ContentManagementTab = React.lazy(() => import('@/components/admin/content/ContentManagementTab'));
const ConsultantManagementTab = React.lazy(() => import('@/components/admin/consultants/ConsultantManagementTab'));
const AboutManagementTab = React.lazy(() => import('@/components/admin/about/AboutManagementTab'));
const PlatformSettingsTab = React.lazy(() => import('@/components/admin/settings/PlatformSettingsTab'));

const AdminPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (activeTab !== defaultTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, defaultTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen overflow-y-auto bg-white dark:bg-black">
      <div className="container mx-auto p-6">
        <AdminHeader />

        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-1">
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <AdminNavTabs activeTab={activeTab} />
              
              <TabsContent value="dashboard" className="space-y-4">
                <React.Suspense fallback={<div>Loading dashboard...</div>}>
                  <DashboardTab />
                </React.Suspense>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <React.Suspense fallback={<div>Loading users...</div>}>
                  <UserManagementTab />
                </React.Suspense>
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <React.Suspense fallback={<div>Loading content...</div>}>
                  <ContentManagementTab />
                </React.Suspense>
              </TabsContent>
              
              <TabsContent value="consultants" className="space-y-4">
                <React.Suspense fallback={<div>Loading consultants...</div>}>
                  <ConsultantManagementTab />
                </React.Suspense>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-4">
                <React.Suspense fallback={<div>Loading about...</div>}>
                  <AboutManagementTab />
                </React.Suspense>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <React.Suspense fallback={<div>Loading settings...</div>}>
                  <PlatformSettingsTab />
                </React.Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;