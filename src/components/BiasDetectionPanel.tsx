import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Shield, BarChart3 } from "lucide-react";
import type { BiasAnalysis } from './ChatMessage';

interface BiasDetectionPanelProps {
  currentAnalysis?: BiasAnalysis;
  overallStats: {
    totalMessages: number;
    biasedMessages: number;
    averageConfidence: number;
  };
}

export const BiasDetectionPanel: React.FC<BiasDetectionPanelProps> = ({ 
  currentAnalysis, 
  overallStats 
}) => {
  const biasPercentage = overallStats.totalMessages > 0 
    ? (overallStats.biasedMessages / overallStats.totalMessages) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Current Analysis */}
      <Card className="shadow-bias">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Real-time Bias Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAnalysis ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bias Detected:</span>
                <Badge 
                  variant={currentAnalysis.hasBias ? "destructive" : "secondary"}
                  className="animate-pulse-ai"
                >
                  {currentAnalysis.hasBias ? "Yes" : "No"}
                </Badge>
              </div>
              
              {currentAnalysis.hasBias && (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Severity:</span>
                      <span className="font-medium capitalize">{currentAnalysis.severity}</span>
                    </div>
                    <Progress 
                      value={currentAnalysis.severity === 'high' ? 100 : currentAnalysis.severity === 'medium' ? 60 : 30}
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Bias Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentAnalysis.biasTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Confidence:</span>
                <span className="font-medium">{currentAnalysis.confidence}%</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Send a message to see bias analysis...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Session Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{overallStats.totalMessages}</div>
              <div className="text-xs text-muted-foreground">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{overallStats.biasedMessages}</div>
              <div className="text-xs text-muted-foreground">Biased Messages</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Bias Rate:</span>
              <span className="font-medium">{biasPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={biasPercentage} className="h-2" />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Avg. Confidence:</span>
            <span className="font-medium">{overallStats.averageConfidence.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      {biasPercentage > 30 && (
        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            High bias rate detected. Consider reviewing conversation patterns.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};