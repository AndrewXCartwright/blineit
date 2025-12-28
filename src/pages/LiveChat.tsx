import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLiveChat } from '@/hooks/useSupport';
import { format } from 'date-fns';
import { ArrowLeft, Send, Bot, User, Headphones, Star } from 'lucide-react';

export default function LiveChat() {
  const { messages, isTyping, chatStatus, sendMessage, connectToAgent, endChat } = useLiveChat();
  const [input, setInput] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleEndChat = () => {
    endChat();
    if (chatStatus === 'agent') setShowRating(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          {chatStatus !== 'bot' && (
            <Button variant="outline" size="sm" onClick={handleEndChat}>End Chat</Button>
          )}
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            {chatStatus === 'bot' ? (
              <><Bot className="h-5 w-5 text-primary" /><span className="font-semibold">BLIT Assistant</span></>
            ) : chatStatus === 'waiting' ? (
              <><Headphones className="h-5 w-5 text-yellow-500" /><span className="font-semibold">Connecting to agent...</span></>
            ) : (
              <><Headphones className="h-5 w-5 text-green-500" /><span className="font-semibold">Sarah from Support</span></>
            )}
          </div>

          <div className="h-96 overflow-y-auto space-y-4 mb-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender_type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">{format(new Date(msg.created_at), 'h:mm a')}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg"><p className="text-sm">Typing...</p></div>
              </div>
            )}
          </div>

          {chatStatus === 'bot' && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => sendMessage('How do I withdraw money?')}>Withdrawal Help</Button>
              <Button variant="outline" size="sm" onClick={() => sendMessage('Check my balance')}>Check Balance</Button>
              <Button variant="outline" size="sm" onClick={connectToAgent}>Talk to Agent</Button>
            </div>
          )}

          <div className="flex gap-2">
            <Input 
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {showRating && (
          <Card className="p-6 text-center">
            <h3 className="font-semibold mb-3">How was your experience?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)}>
                  <Star className={`h-8 w-8 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <Button onClick={() => setShowRating(false)}>Submit Feedback</Button>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
