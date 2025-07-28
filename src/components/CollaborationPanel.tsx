"use client";
import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Share2, Copy, Eye, EyeOff } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

interface CollaborationPanelProps {
  roomId: string;
  isVisible: boolean;
  onToggle: () => void;
}

export default function CollaborationPanel({ roomId, isVisible, onToggle }: CollaborationPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

    // Initialize data after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCollaborators([
      { id: '1', name: 'You', color: '#4ECDC4', isOnline: true, lastSeen: now },
      { id: '2', name: 'Alice', color: '#FF6B6B', isOnline: true, lastSeen: now },
      { id: '3', name: 'Bob', color: '#45B7D1', isOnline: false, lastSeen: new Date(now.getTime() - 300000) },
    ]);
    setMessages([
      { id: '1', userId: '2', userName: 'Alice', content: 'Great work on the diagram!', timestamp: new Date(now.getTime() - 60000) },
      { id: '2', userId: '1', userName: 'You', content: 'Thanks! Working on the flow now.', timestamp: new Date(now.getTime() - 30000) },
    ]);
  }, []);

  // Initialize shareLink after mounting to prevent hydration mismatch
  useEffect(() => {
    if (mounted) {
      setShareLink(`https://slate-canvas.com/canvas/${roomId}`);
    }
  }, [mounted, roomId]);

  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    // Generate share link
    setShareLink(`${window.location.origin}/canvas/${roomId}`);
  }, [roomId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && mounted) {
      const message: Message = {
        id: `msg-${Date.now()}-${mounted ? Math.random().toString(36).substr(2, 9) : 'temp'}`,
        userId: '1',
        userName: 'You',
        content: newMessage.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleCopyLink = async () => {
    try {
      // Check if we're in a browser environment and have clipboard support
      if (typeof window !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(shareLink);
          // Show success feedback
        } catch (clipboardErr) {
          // If clipboard API fails, fall back to execCommand
          throw clipboardErr;
        }
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('execCommand copy failed');
          }
          // Show success feedback
        } catch (err) {
          console.error('Fallback copy failed:', err);
          // Last resort: show the link to user
          alert(`Please copy this link manually: ${shareLink}`);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Show user-friendly error message
      alert(`Unable to copy link automatically. Please copy this manually: ${shareLink}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isVisible || !mounted) return null;

  return (
    <div className="fixed top-16 right-4 z-40 bg-black/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Collaboration
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>

        {/* Collaborators List */}
        <div className="mb-4">
          <h4 className="text-sm text-gray-300 mb-2">Online ({collaborators.filter(c => c.isOnline).length})</h4>
          <div className="space-y-2">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${collaborator.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                />
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: collaborator.color }}
                />
                <span className="text-sm text-white">{collaborator.name}</span>
                {!collaborator.isOnline && (
                  <span className="text-xs text-gray-400">
                    {mounted ? Math.floor((Date.now() - collaborator.lastSeen.getTime()) / 60000) : 0}m ago
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
              showChat 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" />
            Chat
          </button>
          <button
            onClick={() => setShowShare(!showShare)}
            className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
              showShare 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-1" />
            Share
          </button>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="mb-4">
            <div className="h-32 overflow-y-auto mb-2 p-2 bg-gray-900 rounded">
              {messages.map((message) => (
                <div key={message.id} className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{message.userName}</span>
                    <span className="text-xs text-gray-500">
                      {mounted ? message.timestamp.toLocaleTimeString() : '--:--'}
                    </span>
                  </div>
                  <p className="text-sm text-white">{message.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-2 py-1 text-sm bg-gray-800 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Share Panel */}
        {showShare && (
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-2 py-1 text-sm bg-gray-800 text-white rounded border border-gray-600"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Share this link with others to collaborate in real-time
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 