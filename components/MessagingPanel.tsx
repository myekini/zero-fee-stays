"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  MessageSquare,
  User,
  X,
  ChevronLeft,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface MessagingPanelProps {
  propertyId?: string;
  hostId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Conversation {
  id: string;
  property_title: string;
  property_address: string;
  property_images: string[];
  guest_id: string;
  host_id: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_avatar: string;
  host_first_name: string;
  host_last_name: string;
  host_avatar: string;
  last_message_content: string;
  last_message_at: string;
  guest_unread_count: number;
  host_unread_count: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  sender: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export function MessagingPanel({
  propertyId,
  hostId,
  isOpen,
  onClose,
}: MessagingPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages");

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/messages?conversation_id=${conversationId}`
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Mark messages as read
        await fetch("/api/messages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId,
            mark_all_read: true,
          }),
        });

        // Refresh conversations to update unread counts
        loadConversations();
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConversation?.id,
          property_id: propertyId,
          recipient_id: hostId,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // If this was a new conversation
        if (!selectedConversation && data.conversation_id) {
          await loadConversations();
          const newConv = conversations.find(
            (c) => c.id === data.conversation_id
          );
          if (newConv) setSelectedConversation(newConv);
        }

        // Add message to list
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        scrollToBottom();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getUserInfo = (conversation: Conversation) => {
    // Determine if current user is guest or host
    const isGuest = user?.id === conversation.guest_id;

    return {
      name: isGuest
        ? `${conversation.host_first_name} ${conversation.host_last_name}`
        : `${conversation.guest_first_name} ${conversation.guest_last_name}`,
      avatar: isGuest ? conversation.host_avatar : conversation.guest_avatar,
      role: isGuest ? "Host" : "Guest",
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </h2>
            </div>

            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 text-center text-slate-600">
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const info = getUserInfo(conversation);
                  const unreadCount =
                    user?.id === conversation.guest_id
                      ? conversation.guest_unread_count
                      : conversation.host_unread_count;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 border-b hover:bg-slate-50 transition-colors text-left ${
                        selectedConversation?.id === conversation.id
                          ? "bg-slate-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={info.avatar} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-slate-900 truncate">
                              {info.name}
                            </h3>
                            {unreadCount > 0 && (
                              <Badge className="ml-2 bg-blue-500">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-1 truncate">
                            {conversation.property_title}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {conversation.last_message_content}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Avatar>
                      <AvatarImage
                        src={getUserInfo(selectedConversation).avatar}
                      />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {getUserInfo(selectedConversation).name}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {selectedConversation.property_title}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1]?.sender_id !== message.sender_id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex gap-2 max-w-[70%] ${
                              isOwnMessage ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            {showAvatar ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.sender.avatar_url} />
                                <AvatarFallback>
                                  {message.sender.first_name[0]}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8" />
                            )}
                            <div>
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isOwnMessage
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-100 text-slate-900"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p
                                className={`text-xs text-slate-500 mt-1 ${
                                  isOwnMessage ? "text-right" : "text-left"
                                }`}
                              >
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
