import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Paperclip, Clock, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
  };
  recipient: {
    first_name: string;
    last_name: string;
  };
}

interface Conversation {
  booking_id: string;
  property_title: string;
  guest_name: string;
  host_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  booking_status: string;
}

const MessageCenter: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  // Real-time message updates
  useEffect(() => {
    if (selectedConversation) {
      const channel = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `booking_id=eq.${selectedConversation}`
          },
          (payload) => {
            loadMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setCurrentUserId(profile.id);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, is_host')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get bookings where user is either host or guest
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          guest_id,
          host_id,
          created_at,
          properties!inner(title),
          guest_profile:profiles!bookings_guest_id_fkey(first_name, last_name),
          host_profile:profiles!bookings_host_id_fkey(first_name, last_name)
        `)
        .or(`guest_id.eq.${profile.id},host_id.eq.${profile.id}`);

      if (bookingsError) throw bookingsError;

      // Get last message for each booking
      const conversationPromises = bookings?.map(async (booking) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('booking_id', booking.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('booking_id', booking.id)
          .eq('recipient_id', profile.id)
          .eq('is_read', false);

        return {
          booking_id: booking.id,
          property_title: booking.properties.title,
          guest_name: `${booking.guest_profile?.first_name} ${booking.guest_profile?.last_name}`,
          host_name: `${booking.host_profile?.first_name} ${booking.host_profile?.last_name}`,
          last_message: lastMessage?.content || 'No messages yet',
          last_message_time: lastMessage?.created_at || booking.created_at,
          unread_count: unreadCount || 0,
          booking_status: booking.status
        };
      }) || [];

      const conversationsData = await Promise.all(conversationPromises);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations.',
        variant: 'destructive'
      });
    }
  };

  const loadMessages = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name),
          recipient:profiles!messages_recipient_id_fkey(first_name, last_name)
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (bookingId: string) => {
    if (!currentUserId) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('booking_id', bookingId)
        .eq('recipient_id', currentUserId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    setLoading(true);
    try {
      // Find recipient (the other person in the conversation)
      const conversation = conversations.find(c => c.booking_id === selectedConversation);
      if (!conversation) throw new Error('Conversation not found');

      // Get booking details to find recipient
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('guest_id, host_id')
        .eq('id', selectedConversation)
        .single();

      if (bookingError) throw bookingError;

      const recipientId = booking.guest_id === currentUserId ? booking.host_id : booking.guest_id;

      const { error } = await supabase
        .from('messages')
        .insert({
          booking_id: selectedConversation,
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      loadConversations(); // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-slate-50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages
          </h2>
        </div>
        
        <div className="overflow-y-auto h-full">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.booking_id}
                className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                  selectedConversation === conversation.booking_id ? 'bg-white border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.booking_id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-900 truncate">
                    {conversation.property_title}
                  </h3>
                  {conversation.unread_count > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">
                    {conversation.guest_name}
                  </span>
                  <Badge className={`text-xs ${getStatusColor(conversation.booking_status)}`}>
                    {conversation.booking_status}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-500 truncate mb-1">
                  {conversation.last_message}
                </p>
                
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {format(new Date(conversation.last_message_time), 'MMM dd, HH:mm')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {conversations.find(c => c.booking_id === selectedConversation)?.property_title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {conversations.find(c => c.booking_id === selectedConversation)?.guest_name}
                  </p>
                </div>
                <Badge className={`${getStatusColor(conversations.find(c => c.booking_id === selectedConversation)?.booking_status || '')}`}>
                  {conversations.find(c => c.booking_id === selectedConversation)?.booking_status}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      message.sender_id === currentUserId ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                      {message.sender_id === currentUserId && message.is_read && (
                        <CheckCheck className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[40px] max-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center text-slate-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;