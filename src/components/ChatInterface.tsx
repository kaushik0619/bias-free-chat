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

  // Enhanced bias detection function
  const detectBias = (text: string): BiasAnalysis => {
    const lowerText = text.toLowerCase();
    const biasTypes = [];
    
    // Gender role bias patterns
    if (lowerText.includes('he should') || lowerText.includes('she should') || 
        lowerText.includes('men should') || lowerText.includes('women should') ||
        lowerText.includes('boys should') || lowerText.includes('girls should')) {
      biasTypes.push('Gender Role Bias');
    }
    
    // Gender stereotyping patterns
    if (lowerText.includes('men are') || lowerText.includes('women are') ||
        lowerText.includes('boys are') || lowerText.includes('girls are') ||
        lowerText.includes('men typically') || lowerText.includes('women typically') ||
        lowerText.includes('naturally more') || lowerText.includes('better at') ||
        lowerText.includes('excel in') || lowerText.includes('naturally competitive')) {
      biasTypes.push('Gender Stereotyping');
    }
    
    // Gendered language patterns
    if (lowerText.includes('guys') || lowerText.includes('girls') ||
        lowerText.match(/\b(he|him|his)\b/) || lowerText.match(/\b(she|her|hers)\b/) ||
        lowerText.includes('mankind') || lowerText.includes('manpower')) {
      biasTypes.push('Gendered Language');
    }

    const foundBias = biasTypes.length > 0;
    
    return {
      hasBias: foundBias,
      severity: foundBias ? (biasTypes.length > 1 ? 'high' : 'medium') : 'low',
      biasTypes,
      confidence: foundBias ? Math.random() * 20 + 80 : Math.random() * 10 + 90, // 80-100% if bias, 90-100% if no bias
    };
  };

  // Mock AI response generation with bias mitigation
  const generateResponse = (userMessage: string): string => {
    const responses = [
      "That's an interesting perspective. In my analysis, both men and women can excel in leadership roles depending on their individual skills and experience.",
      "I understand your point. However, research shows that success in any field depends more on individual capabilities rather than gender.",
      "Thank you for sharing that. Studies indicate that diverse teams, regardless of gender composition, tend to perform better in problem-solving tasks.",
      "I see what you mean. It's important to recognize that people of all genders can contribute valuable perspectives to any discussion or profession.",
      "That's a thought-provoking question. Evidence suggests that attributing characteristics based on gender alone can overlook individual differences and abilities."
    ];
    
    // Sometimes return potentially biased responses for demo (will be mitigated)
    const biasedResponses = [
      "Well, men are typically better at technical tasks while women excel in nurturing roles.",
      "I think guys are naturally more competitive, which helps in business environments.",
      "Women should focus on family-oriented careers where they can use their natural caring instincts."
    ];
    
    // 50% chance of biased response for demonstration
    if (Math.random() < 0.5) {
      return biasedResponses[Math.floor(Math.random() * biasedResponses.length)];
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Bias mitigation function
  const mitigateResponse = (response: string, biasAnalysis: BiasAnalysis): string => {
    if (!biasAnalysis.hasBias) return response;

    // Mitigation templates based on bias types
    const mitigationTemplates = {
      'Gender Role Bias': [
        "I understand your perspective. It's important to recognize that career choices and abilities are individual traits that aren't determined by gender. People of all genders can excel in any field based on their personal interests, skills, and dedication.",
        "That's an interesting topic. Research shows that success in any profession depends primarily on individual capabilities, training, and passion rather than gender. Everyone should be encouraged to pursue their interests regardless of traditional expectations."
      ],
      'Gender Stereotyping': [
        "I appreciate your input. However, studies consistently show that individual differences within any group are much larger than differences between groups. Each person has unique strengths and qualities that shouldn't be generalized based on gender.",
        "Thank you for sharing that perspective. Modern research emphasizes that personal characteristics and abilities vary greatly among individuals, regardless of gender. It's most accurate to evaluate people based on their individual merits and contributions."
      ],
      'Gendered Language': [
        "I understand what you're saying. Using inclusive language helps ensure everyone feels welcome in discussions. People of all genders can contribute valuable insights to any conversation or field.",
        "That's a fair point. Research shows that inclusive communication leads to better outcomes for everyone involved. Individual perspectives and experiences matter more than gender-based assumptions."
      ]
    };

    // Find the most appropriate mitigation based on detected bias types
    for (const biasType of biasAnalysis.biasTypes) {
      if (mitigationTemplates[biasType as keyof typeof mitigationTemplates]) {
        const templates = mitigationTemplates[biasType as keyof typeof mitigationTemplates];
        return templates[Math.floor(Math.random() * templates.length)];
      }
    }

    // Default mitigation if no specific type matches
    return "I understand your perspective. It's important to consider that individual differences and personal qualities are more significant than group generalizations. Everyone deserves to be evaluated based on their unique merits and contributions.";
  };

  // Bias reframing function - rewrites the original biased text
  const reframeResponse = (response: string): string => {
    let reframed = response;

    // Reframe gender role bias
    reframed = reframed.replace(/men are typically better at/gi, 'individuals with experience in');
    reframed = reframed.replace(/women excel in/gi, 'many people excel in');
    reframed = reframed.replace(/men should/gi, 'people should');
    reframed = reframed.replace(/women should/gi, 'people should');
    reframed = reframed.replace(/he should/gi, 'they should');
    reframed = reframed.replace(/she should/gi, 'they should');

    // Reframe gender stereotyping
    reframed = reframed.replace(/men are naturally/gi, 'some individuals are naturally');
    reframed = reframed.replace(/women are naturally/gi, 'some individuals are naturally');
    reframed = reframed.replace(/guys are naturally/gi, 'some people are naturally');
    reframed = reframed.replace(/girls are naturally/gi, 'some people are naturally');

    // Reframe gendered language
    reframed = reframed.replace(/\bguys\b/gi, 'people');
    reframed = reframed.replace(/\bgirls\b/gi, 'individuals');
    reframed = reframed.replace(/while women/gi, 'while others');
    reframed = reframed.replace(/while men/gi, 'while others');

    // Handle specific common phrases
    reframed = reframed.replace(/technical tasks while women excel in nurturing roles/gi, 'technical tasks, while others excel in nurturing roles - though individual skills and interests vary greatly');
    reframed = reframed.replace(/more competitive, which helps in business/gi, 'more competitive by nature, which can help in business - though competitiveness varies among all individuals');
    reframed = reframed.replace(/focus on family-oriented careers where they can use their natural caring instincts/gi, 'consider careers that align with their individual interests and strengths, whether that\'s family-oriented roles or any other field');

    return reframed;
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
      const initialResponse = generateResponse(inputValue);
      const biasAnalysis = detectBias(initialResponse);
      
      // Always show the original response with bias analysis
      const originalBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: initialResponse,
        sender: 'bot',
        timestamp: new Date(),
        biasAnalysis,
      };

      setMessages(prev => [...prev, originalBotMessage]);
      updateStats(biasAnalysis);

      // If bias is detected, show mitigation and reframing after brief delays
      if (biasAnalysis.hasBias) {
        setTimeout(() => {
          const mitigatedResponse = mitigateResponse(initialResponse, biasAnalysis);
          
          const mitigatedMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `🔄 **Bias Detected - Providing Mitigated Response:**\n\n${mitigatedResponse}`,
            sender: 'bot',
            timestamp: new Date(),
            biasAnalysis: { hasBias: false, severity: 'low', biasTypes: [], confidence: 95 },
          };

          setMessages(prev => [...prev, mitigatedMessage]);
          
          // Show reframed version after another brief delay
          setTimeout(() => {
            const reframedResponse = reframeResponse(initialResponse);
            
            const reframedMessage: Message = {
              id: (Date.now() + 3).toString(),
              content: `✏️ **Reframed Original Text (Bias Removed):**\n\n"${reframedResponse}"`,
              sender: 'bot',
              timestamp: new Date(),
              biasAnalysis: { hasBias: false, severity: 'low', biasTypes: [], confidence: 98 },
            };

            setMessages(prev => [...prev, reframedMessage]);
          }, 1000); // Additional delay for reframed version
          
          // Show toast for bias detection and mitigation
          toast({
            title: biasAnalysis.severity === 'high' ? "High Bias Detected & Mitigated!" : "Bias Detected & Mitigated",
            description: `Detected ${biasAnalysis.biasTypes.join(', ')} with ${biasAnalysis.confidence.toFixed(1)}% confidence. Showing mitigated and reframed responses.`,
            variant: biasAnalysis.severity === 'high' ? "destructive" : "default",
          });
        }, 1500); // Brief delay before showing mitigation
      }
      
      setIsLoading(false);
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