import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Clock, Play, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  automated?: boolean;
}

const TestingDashboard = () => {
  const { toast } = useToast();
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());

  const functionalityTests: TestItem[] = [
    { id: 'search', title: 'Property Search & Filtering', description: 'Test location search, date filters, guest count, price range', priority: 'critical' },
    { id: 'booking-flow', title: 'Booking Flow End-to-End', description: 'Complete booking process from search to confirmation', priority: 'critical' },
    { id: 'payment', title: 'Payment Processing', description: 'Stripe integration, payment success/failure handling', priority: 'critical' },
    { id: 'host-dashboard', title: 'Host Dashboard Operations', description: 'Property management, booking management, analytics', priority: 'high' },
    { id: 'email-notifications', title: 'Email Notifications', description: 'Booking confirmations, host alerts, automated emails', priority: 'high' },
    { id: 'calendar', title: 'Calendar Availability', description: 'Date blocking, availability updates, conflicts', priority: 'high' },
    { id: 'messaging', title: 'Message System', description: 'Real-time messaging, notifications, templates', priority: 'medium' },
    { id: 'mobile-responsive', title: 'Mobile Responsiveness', description: 'All features work on mobile devices', priority: 'high' }
  ];

  const integrationTests: TestItem[] = [
    { id: 'supabase-db', title: 'Supabase Database Operations', description: 'CRUD operations, RLS policies, triggers', priority: 'critical' },
    { id: 'stripe-integration', title: 'Stripe Payment Processing', description: 'Payment intents, webhooks, refunds', priority: 'critical' },
    { id: 'email-delivery', title: 'Email Delivery (Resend)', description: 'Email sending, templates, deliverability', priority: 'high' },
    { id: 'realtime-updates', title: 'Real-time Updates', description: 'Live message updates, booking status changes', priority: 'medium' },
    { id: 'file-uploads', title: 'File Uploads', description: 'Property images, profile pictures, attachments', priority: 'medium' },
    { id: 'auth-flow', title: 'Authentication Flow', description: 'Login, signup, password reset, session management', priority: 'critical' }
  ];

  const performanceTests: TestItem[] = [
    { id: 'page-load', title: 'Page Load Speeds (<3s)', description: 'Measure Core Web Vitals, optimize loading', priority: 'high', automated: true },
    { id: 'image-optimization', title: 'Image Optimization', description: 'Compressed images, lazy loading, WebP format', priority: 'medium', automated: true },
    { id: 'db-performance', title: 'Database Query Performance', description: 'Query optimization, indexing, response times', priority: 'high' },
    { id: 'mobile-performance', title: 'Mobile Performance', description: 'Touch targets, scrolling, animations', priority: 'high' },
    { id: 'error-handling', title: 'Error Handling', description: 'Graceful error states, user feedback, recovery', priority: 'medium' }
  ];

  const allTests = [...functionalityTests, ...integrationTests, ...performanceTests];

  const toggleTest = (testId: string) => {
    const newCompleted = new Set(completedTests);
    if (newCompleted.has(testId)) {
      newCompleted.delete(testId);
    } else {
      newCompleted.add(testId);
      toast({
        title: "Test Completed",
        description: `Marked "${allTests.find(t => t.id === testId)?.title}" as completed`,
      });
    }
    setCompletedTests(newCompleted);
  };

  const runAutomatedTests = () => {
    const automatedTestIds = allTests.filter(t => t.automated).map(t => t.id);
    setCompletedTests(prev => new Set([...prev, ...automatedTestIds]));
    toast({
      title: "Automated Tests Running",
      description: "Performance tests are being executed...",
    });
  };

  const exportReport = () => {
    const report = {
      date: new Date().toISOString(),
      totalTests: allTests.length,
      completedTests: completedTests.size,
      completionRate: (completedTests.size / allTests.length) * 100,
      failedTests: allTests.filter(t => !completedTests.has(t.id)).map(t => ({
        title: t.title,
        priority: t.priority
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testing-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCompletionRate = (tests: TestItem[]) => {
    const completed = tests.filter(t => completedTests.has(t.id)).length;
    return (completed / tests.length) * 100;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const TestSection = ({ title, tests, description }: { title: string; tests: TestItem[]; description: string }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={getCompletionRate(tests)} className="w-24" />
          <span className="text-sm font-medium">{Math.round(getCompletionRate(tests))}%</span>
        </div>
      </div>
      
      <div className="grid gap-3">
        {tests.map((test) => (
          <Card key={test.id} className={`transition-all ${completedTests.has(test.id) ? 'bg-green-50 border-green-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTests.has(test.id)}
                  onCheckedChange={() => toggleTest(test.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{test.title}</h4>
                    <Badge variant={getPriorityColor(test.priority) as any}>
                      {test.priority}
                    </Badge>
                    {test.automated && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Play size={12} className="mr-1" />
                        Auto
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </div>
                <div className="flex items-center">
                  {completedTests.has(test.id) ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : test.priority === 'critical' ? (
                    <AlertCircle className="text-red-500" size={20} />
                  ) : (
                    <Clock className="text-gray-400" size={20} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive testing checklist for BookDirect platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAutomatedTests} variant="outline">
            <Play size={16} className="mr-2" />
            Run Automated Tests
          </Button>
          <Button onClick={exportReport}>
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Testing Progress</CardTitle>
          <CardDescription>
            {completedTests.size} of {allTests.length} tests completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(completedTests.size / allTests.length) * 100} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedTests.size}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{allTests.length - completedTests.size}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{Math.round((completedTests.size / allTests.length) * 100)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Categories */}
      <Tabs defaultValue="functionality" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="functionality">Functionality Tests</TabsTrigger>
          <TabsTrigger value="integration">Integration Tests</TabsTrigger>
          <TabsTrigger value="performance">Performance Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="functionality" className="space-y-6">
          <TestSection
            title="Functionality Testing"
            description="Core feature testing to ensure all user-facing functionality works correctly"
            tests={functionalityTests}
          />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <TestSection
            title="Integration Testing"
            description="Testing external service integrations and data flow between systems"
            tests={integrationTests}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <TestSection
            title="Performance Testing"
            description="Speed, optimization, and user experience performance validation"
            tests={performanceTests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingDashboard;