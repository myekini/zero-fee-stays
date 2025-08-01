import React from 'react';
import { Navigate } from 'react-router-dom';
import { MessageSquare, Send, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

const Messages: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Communicate with property managers and guests</p>
          </div>

          {/* Messages Interface */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Conversation List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Your messages with property managers will appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Message View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Select a conversation</CardTitle>
                <CardDescription>Choose a conversation to start messaging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Welcome to Messages</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Stay connected with property managers and get quick responses to your questions
                  </p>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Start Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;