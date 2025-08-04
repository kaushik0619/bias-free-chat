import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Zap, BrainCircuit } from "lucide-react";
import { ChatMessage, type Message, type BiasAnalysis } from './ChatMessage';
import { BiasDetectionPanel } from './BiasDetectionPanel';
import { useToast } from '@/hooks/use-toast';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [overallStats, setOverallStats] = useState({
    totalMessages: 0,
    biasedMessages: 0,
    averageConfidence: 0,
  });

  // Mock bias detection function
  const detectBias = (text: string): BiasAnalysis => {
    // Simulate bias detection logic
    const biasKeywords = ['he should', 'she should', 'men are', 'women are', 'guys', 'girls'];
    const foundBias = biasKeywords.some(keyword => text.toLowerCase().includes(keyword));
    
    const biasTypes = [];
    if (text.toLowerCase().includes('he should') || text.toLowerCase().includes('she should')) {
      biasTypes.push('Gender Role Bias');
    }
    if (text.toLowerCase().includes('men are') || text.toLowerCase().includes('women are')) {
      biasTypes.push('Gender Stereotyping');
    }
    if (text.toLowerCase().includes('guys') || text.toLowerCase().includes('girls')) {
      biasTypes.push('Gendered Language');
    }

    return {
      hasBias: foundBias,
      severity: foundBias ? (biasTypes.length > 1 ? 'high' : 'medium') : 'low',
      biasTypes,
      confidence: foundBias ? Math.random() * 30 + 70 : Math.random() * 20 + 80, // 70-100% if bias, 80-100% if no bias
    };
  };

  // Mock AI response generation
  const generateResponse = (userMessage: string): string => {
    const responses = [
      "That's an interesting perspective. In my analysis, both men and women can excel in leadership roles depending on their individual skills and experience.",
      "I understand your point. However, research shows that success in any field depends more on individual capabilities rather than gender.",
      "Thank you for sharing that. Studies indicate that diverse teams, regardless of gender composition, tend to perform better in problem-solving tasks.",
      "I see what you mean. It's important to recognize that people of all genders can contribute valuable perspectives to any discussion or profession.",
      "That's a thought-provoking question. Evidence suggests that attributing characteristics based on gender alone can overlook individual differences and abilities."
    ];
    
    // Sometimes return potentially biased responses for demo
    const biasedResponses = [
      "Well, men are typically better at technical tasks while women excel in nurturing roles.",
      "I think guys are naturally more competitive, which helps in business environments.",
      "Women should focus on family-oriented careers where they can use their natural caring instincts."
    ];
    
    // 20% chance of biased response for demonstration
    if (Math.random() < 0.2) {
      return biasedResponses[Math.floor(Math.random() * biasedResponses.length)];
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateStats = (biasAnalysis: BiasAnalysis) => {
    setOverallStats(prev => {
      const newTotal = prev.totalMessages + 1;
      const newBiased = prev.biasedMessages + (biasAnalysis.hasBias ? 1 : 0);
      const newAvgConfidence = ((prev.averageConfidence * prev.totalMessages) + biasAnalysis.confidence) / newTotal;
      
      return {
        totalMessages: newTotal,
        biasedMessages: newBiased,
        averageConfidence: newAvgConfidence,
      };
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const botResponse = generateResponse(inputValue);
      const biasAnalysis = detectBias(botResponse);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        biasAnalysis,
      };

      setMessages(prev => [...prev, botMessage]);
      updateStats(biasAnalysis);
      setIsLoading(false);

      // Show toast for high bias detection
      if (biasAnalysis.hasBias && biasAnalysis.severity === 'high') {
        toast({
          title: "High Bias Detected!",
          description: `Detected ${biasAnalysis.biasTypes.join(', ')} with ${biasAnalysis.confidence.toFixed(1)}% confidence`,
          variant: "destructive",
        });
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentBotMessage = messages.filter(m => m.sender === 'bot').slice(-1)[0];

  return (
    <div className="h-screen bg-gradient-chat flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-4 shadow-ai">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-ai flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Bias Detection Chatbot</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Detecting and mitigating gender bias using transformers
                  </p>
                </div>
              </div>
              <Badge variant="ai" className="px-3">
                <Zap className="w-3 h-3 mr-1" />
                BERT + GPT
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="flex-1 flex flex-col shadow-chat">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground">
                    Send a message to test the AI bias detection system
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-white animate-spin" />
                </div>
                <Card className="p-4 bg-card">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-typing" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{animationDelay: '0.2s'}} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{animationDelay: '0.4s'}} />
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          
          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything to test bias detection..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                variant="ai"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Bias Detection Panel */}
      <div className="w-80 p-4 pl-0">
        <BiasDetectionPanel 
          currentAnalysis={currentBotMessage?.biasAnalysis}
          overallStats={overallStats}
        />
      </div>
    </div>
  );
};