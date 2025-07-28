"use client";
import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Zap, Brain, Wand2, Target } from 'lucide-react';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
}

interface AIFeaturesProps {
  isVisible: boolean;
  onToggle: () => void;
  onFeatureToggle: (featureId: string) => void;
}

export default function AIFeatures({ isVisible, onToggle, onFeatureToggle }: AIFeaturesProps) {
  const [mounted, setMounted] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize data after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setSuggestions([
      "Try adding a flowchart structure",
      "Consider using different colors for emphasis",
      "Add labels to your shapes for clarity"
    ]);
  }, []);

  const aiFeatures: AIFeature[] = [
    {
      id: 'smart-suggestions',
      name: 'Smart Suggestions',
      description: 'Get intelligent recommendations for your drawings',
      icon: <Lightbulb className="w-4 h-4" />,
      isActive: true
    },
    {
      id: 'auto-complete',
      name: 'Auto Complete',
      description: 'AI helps complete your shapes and lines',
      icon: <Zap className="w-4 h-4" />,
      isActive: false
    },
    {
      id: 'style-transfer',
      name: 'Style Transfer',
      description: 'Apply different artistic styles to your drawings',
      icon: <Wand2 className="w-4 h-4" />,
      isActive: false
    },
    {
      id: 'object-detection',
      name: 'Object Detection',
      description: 'Automatically detect and label objects',
      icon: <Target className="w-4 h-4" />,
      isActive: false
    },
    {
      id: 'smart-layout',
      name: 'Smart Layout',
      description: 'AI suggests optimal positioning for elements',
      icon: <Brain className="w-4 h-4" />,
      isActive: false
    }
  ];

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible, suggestions.length]);

  const handleFeatureToggle = (featureId: string) => {
    onFeatureToggle(featureId);
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => setIsProcessing(false), 2000);
  };

  if (!isVisible || !mounted) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 bg-black/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 min-w-[400px]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Features
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* AI Suggestion */}
        <div className="mb-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">AI Suggestion</span>
          </div>
          <p className="text-sm text-white">{suggestions[currentSuggestion]}</p>
        </div>

        {/* AI Features List */}
        <div className="space-y-2">
          {aiFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                feature.isActive
                  ? 'bg-purple-900/30 border-purple-500/50'
                  : 'bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50'
              }`}
              onClick={() => handleFeatureToggle(feature.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${
                    feature.isActive ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{feature.name}</h4>
                    <p className="text-xs text-gray-400">{feature.description}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  feature.isActive ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>
              {isProcessing && feature.isActive && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                  <span className="text-xs text-gray-400">Processing...</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Stats */}
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">AI Insights</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Shapes drawn:</span>
              <span className="text-white">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time saved:</span>
              <span className="text-white">12 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Suggestions:</span>
              <span className="text-white">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Accuracy:</span>
              <span className="text-white">94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 