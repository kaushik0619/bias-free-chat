import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, AlertTriangle, CheckCircle } from "lucide-react";

export interface BiasAnalysis {
  hasBias: boolean;
  severity: 'low' | 'medium' | 'high';
  biasTypes: string[];
  confidence: number;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  biasAnalysis?: BiasAnalysis;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  const getBiasColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${!isBot && 'order-last'}`}>
        <Card className={`p-4 shadow-chat ${isBot ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Bias Analysis for Bot Messages */}
          {isBot && message.biasAnalysis && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                {message.biasAnalysis.hasBias ? (
                  <AlertTriangle className="w-4 h-4 text-warning" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="text-xs font-medium">
                  Bias Analysis: {message.biasAnalysis.confidence}% confidence
                </span>
              </div>
              
              {message.biasAnalysis.hasBias && (
                <div className="flex flex-wrap gap-1">
                  <Badge variant={getBiasColor(message.biasAnalysis.severity)} className="text-xs">
                    {message.biasAnalysis.severity} risk
                  </Badge>
                  {message.biasAnalysis.biasTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
        
        <div className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};