import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { useIsMobile } from '@/hooks/use-mobile';
export function SessionsTab() {
  const {
    isConsultant
  } = useAuth();
  const isMobile = useIsMobile();
  const {
    isLoading,
    error,
    upcomingSessions,
    pastSessions,
    cancelledSessions,
    fetchSessions,
    updateSessionStatus,
    formatSessionDate,
    formatSessionTime,
    getSessionDuration
  } = useSessionManagement();
  useEffect(() => {
    fetchSessions();
  }, []);
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'outline';
      case 'completed':
        return 'default';
      case 'pending_payment_confirmation':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending_payment_confirmation':
        return 'Pending Payment';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  const renderSessionCards = (sessionList: any[]) => (
    <div className="grid grid-cols-1 gap-4 w-full max-w-full">
      {sessionList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No sessions found
        </div>
      ) : (
        sessionList.map(session => (
          <Card key={session.id} className="w-full max-w-full overflow-hidden">
            <CardContent className="p-4 w-full max-w-full">
              <div className="flex items-start justify-between mb-3 min-w-0">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {session.user?.profile_image ? (
                      <img 
                        src={session.user.profile_image} 
                        alt={session.user?.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-mental-green-100 text-mental-green-800">
                        {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{session.user?.name || 'Unknown User'}</p>
                    <Badge variant={getStatusBadgeVariant(session.status)} className="mt-1">
                      {getStatusDisplay(session.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm w-full max-w-full">
                <div className="flex items-center text-muted-foreground min-w-0">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{formatSessionDate(session.start_time)}</span>
                </div>
                <div className="flex items-center text-muted-foreground min-w-0">
                  <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{formatSessionTime(session.start_time)} • {getSessionDuration(session.start_time, session.end_time)}</span>
                </div>
              </div>

              {isConsultant && (session.status === 'scheduled' || session.status === 'pending_payment_confirmation') && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => updateSessionStatus(session.id, 'completed')}
                  >
                    Complete
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => updateSessionStatus(session.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderSessionTable = (sessionList: any[]) => <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{isConsultant ? 'Client' : 'Consultant'}</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          {isConsultant && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessionList.length === 0 && <TableRow>
            <TableCell colSpan={isConsultant ? 6 : 5} className="text-center py-4">
              No sessions found
            </TableCell>
          </TableRow>}
        {sessionList.map(session => <TableRow key={session.id}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                  {session.user?.profile_image ? <img src={session.user.profile_image} alt={session.user?.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center bg-mental-green-100 text-mental-green-800">
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>}
                </div>
                <span className="font-medium">{session.user?.name || 'Unknown User'}</span>
              </div>
            </TableCell>
            <TableCell>{formatSessionDate(session.start_time)}</TableCell>
            <TableCell>{formatSessionTime(session.start_time)}</TableCell>
            <TableCell>{getSessionDuration(session.start_time, session.end_time)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(session.status)}>
                {getStatusDisplay(session.status)}
              </Badge>
            </TableCell>
            {isConsultant && <TableCell>
                <div className="flex space-x-2">
                  {(session.status === 'scheduled' || session.status === 'pending_payment_confirmation') && <>
                      <Button size="sm" variant="outline" onClick={() => updateSessionStatus(session.id, 'completed')}>
                        Complete
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => updateSessionStatus(session.id, 'cancelled')}>
                        Cancel
                      </Button>
                    </>}
                </div>
              </TableCell>}
          </TableRow>)}
      </TableBody>
    </Table>;
  if (error) {
    return <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error loading sessions</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={fetchSessions} variant="outline" size="sm" className="mt-4">
                <Clock className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="space-y-6 max-w-full">
      <Card className="max-w-full overflow-hidden">
        <CardHeader className="max-w-full">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">Your Sessions</CardTitle>
              
            </div>
            <Button variant="outline" size="sm" className="flex items-center flex-shrink-0" onClick={fetchSessions} disabled={isLoading}>
              <Clock className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="w-full max-w-full overflow-hidden">
          <Tabs defaultValue="upcoming" className="w-full max-w-full overflow-hidden">
            <TabsList className="mb-4 w-full max-w-full flex flex-wrap overflow-hidden">
              <TabsTrigger value="upcoming">
                Upcoming
                {upcomingSessions.length > 0 && <Badge variant="secondary" className="ml-2">
                    {upcomingSessions.length}
                  </Badge>}
              </TabsTrigger>
              <TabsTrigger value="past">
                Past
                {pastSessions.length > 0 && <Badge variant="secondary" className="ml-2">
                    {pastSessions.length}
                  </Badge>}
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                {cancelledSessions.length > 0 && <Badge variant="secondary" className="ml-2">
                    {cancelledSessions.length}
                  </Badge>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="pt-2">
              {isLoading ? <div className="flex items-center justify-center p-4">
                  <p>Loading upcoming sessions...</p>
                </div> : isMobile ? renderSessionCards(upcomingSessions) : renderSessionTable(upcomingSessions)}
            </TabsContent>
            
            <TabsContent value="past" className="pt-2">
              {isLoading ? <div className="flex items-center justify-center p-4">
                  <p>Loading past sessions...</p>
                </div> : isMobile ? renderSessionCards(pastSessions) : renderSessionTable(pastSessions)}
            </TabsContent>
            
            <TabsContent value="cancelled" className="pt-2">
              {isLoading ? <div className="flex items-center justify-center p-4">
                  <p>Loading cancelled sessions...</p>
                </div> : isMobile ? renderSessionCards(cancelledSessions) : renderSessionTable(cancelledSessions)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}
export default SessionsTab;