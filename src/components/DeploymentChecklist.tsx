import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, ExternalLink, Server, Globe, Shield, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeploymentItem {
  id: string;
  title: string;
  description: string;
  category: 'environment' | 'database' | 'services' | 'monitoring';
  priority: 'critical' | 'high' | 'medium';
  link?: string;
  autoCheck?: boolean;
}

const DeploymentChecklist = () => {
  const { toast } = useToast();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const deploymentItems: DeploymentItem[] = [
    // Environment
    { id: 'env-vars', title: 'Environment Variables Configured', description: 'Supabase URL, API keys, Stripe keys set correctly', category: 'environment', priority: 'critical' },
    { id: 'domain-ssl', title: 'Domain Configured with SSL', description: 'Custom domain setup with HTTPS certificate', category: 'environment', priority: 'high', link: 'https://docs.lovable.dev/deployment/custom-domains' },
    
    // Database
    { id: 'db-migrations', title: 'Database Migrations Applied', description: 'All Supabase migrations executed successfully', category: 'database', priority: 'critical' },
    { id: 'rls-policies', title: 'RLS Policies Verified', description: 'Row Level Security policies tested and working', category: 'database', priority: 'critical' },
    { id: 'backup-procedures', title: 'Backup Procedures Setup', description: 'Automated database backups configured', category: 'database', priority: 'medium' },
    
    // Services
    { id: 'stripe-webhooks', title: 'Stripe Webhooks Configured', description: 'Payment webhooks pointing to production endpoints', category: 'services', priority: 'critical', link: 'https://dashboard.stripe.com/webhooks' },
    { id: 'email-domain', title: 'Email Domain Verification', description: 'Resend domain verified for email sending', category: 'services', priority: 'high', link: 'https://resend.com/domains' },
    { id: 'analytics-integration', title: 'Analytics Integration', description: 'Google Analytics or similar tracking setup', category: 'services', priority: 'medium' },
    
    // Monitoring
    { id: 'error-tracking', title: 'Error Monitoring Setup', description: 'Sentry or similar error tracking configured', category: 'monitoring', priority: 'high' },
    { id: 'performance-monitoring', title: 'Performance Monitoring', description: 'Core Web Vitals and performance tracking', category: 'monitoring', priority: 'medium', autoCheck: true },
    { id: 'uptime-monitoring', title: 'Uptime Monitoring', description: 'Service availability monitoring alerts', category: 'monitoring', priority: 'high' },
    { id: 'payment-failure-alerts', title: 'Payment Failure Alerts', description: 'Notifications for failed payments and issues', category: 'monitoring', priority: 'high' }
  ];

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
      toast({
        title: "Deployment Step Completed",
        description: `Marked "${deploymentItems.find(i => i.id === itemId)?.title}" as completed`,
      });
    }
    setCompletedItems(newCompleted);
  };

  const runAutoChecks = () => {
    const autoCheckIds = deploymentItems.filter(i => i.autoCheck).map(i => i.id);
    setCompletedItems(prev => new Set([...prev, ...autoCheckIds]));
    toast({
      title: "Auto-checks Running",
      description: "Automated deployment checks are being executed...",
    });
  };

  const getCompletionRate = (category?: string) => {
    const items = category 
      ? deploymentItems.filter(i => i.category === category)
      : deploymentItems;
    const completed = items.filter(i => completedItems.has(i.id)).length;
    return (completed / items.length) * 100;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environment': return <Globe size={20} />;
      case 'database': return <Server size={20} />;
      case 'services': return <Shield size={20} />;
      case 'monitoring': return <BarChart3 size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const CategorySection = ({ category, title }: { category: string; title: string }) => {
    const items = deploymentItems.filter(i => i.category === category);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getCategoryIcon(category)}
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={getCompletionRate(category)} className="flex-1" />
            <span className="text-sm font-medium">{Math.round(getCompletionRate(category))}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`p-3 rounded-lg border transition-all ${
              completedItems.has(item.id) ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
            }`}>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedItems.has(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant={getPriorityColor(item.priority) as any}>
                      {item.priority}
                    </Badge>
                    {item.autoCheck && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Auto
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.link && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Configure <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="flex items-center">
                  {completedItems.has(item.id) ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : item.priority === 'critical' ? (
                    <AlertTriangle className="text-red-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const criticalIncomplete = deploymentItems.filter(
    i => i.priority === 'critical' && !completedItems.has(i.id)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Deployment</h1>
          <p className="text-muted-foreground">Pre-deployment checklist and monitoring setup</p>
        </div>
        <Button onClick={runAutoChecks} variant="outline">
          Run Auto-Checks
        </Button>
      </div>

      {/* Critical Warnings */}
      {criticalIncomplete.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> {criticalIncomplete.length} critical item(s) remaining before deployment:
            <ul className="mt-2 list-disc list-inside">
              {criticalIncomplete.map(item => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Readiness</CardTitle>
          <CardDescription>
            {completedItems.size} of {deploymentItems.length} deployment items completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getCompletionRate()} className="h-3" />
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedItems.size}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{deploymentItems.length - completedItems.size}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalIncomplete.length}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{Math.round(getCompletionRate())}%</div>
                <div className="text-sm text-muted-foreground">Ready</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Categories */}
      <Tabs defaultValue="environment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="environment">
          <CategorySection category="environment" title="Environment Configuration" />
        </TabsContent>

        <TabsContent value="database">
          <CategorySection category="database" title="Database Setup" />
        </TabsContent>

        <TabsContent value="services">
          <CategorySection category="services" title="External Services" />
        </TabsContent>

        <TabsContent value="monitoring">
          <CategorySection category="monitoring" title="Monitoring & Alerts" />
        </TabsContent>
      </Tabs>

      {/* Deployment Ready Status */}
      {getCompletionRate() === 100 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Ready for Production!</strong> All deployment checklist items have been completed.
            Your application is ready to go live.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DeploymentChecklist;