"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import initDraw from "../../draw/draw";
import axios from "axios"
import CollaborationPanel from "./CollaborationPanel";
import AIFeatures from "./AIFeatures";

// Polyfill for crypto.randomUUID - only on client side
if (typeof window !== 'undefined' && typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

import {
  Pencil,
  RectangleHorizontal,
  Circle,
  Diamond,
  ArrowRight,
  Eraser,
  Type,
  MousePointer,
  Minus,
  Hand, 
  Sparkles,
  X,
  Percent,
  Calculator,
  Hash,
  Sigma
} from "lucide-react";

// Define types for drawing instance methods
interface DrawingInstance {
  selectTool: (tool: string) => void;
  setStrokeColor: (color: string) => void;
  setBgColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  deleteSelected: () => void;
  clearAll: () => void;
  undo?: () => void;
  redo?: () => void;
  addImage: (src: string, x: number, y: number, width: number, height: number) => void;
}

interface GeneratedResult {
    expression: string;
    answer: string;
}

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

export default function Drawing({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingInstanceRef = useRef<DrawingInstance | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("pencil");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [strokeColor, setStrokeColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [dictOfVars, setDictOfVars] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GeneratedResult>();
  const [latexExpression, setLatexExpression] = useState<Array<{id: string, content: string}>>([]); 
  const [showChat, setShowChat] = useState(false);
  const latexContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);

  // New enhanced features state
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [layers, setLayers] = useState<Array<{id: string, name: string, visible: boolean, locked: boolean}>>([
    { id: '1', name: 'Background', visible: true, locked: false },
    { id: '2', name: 'Drawing', visible: true, locked: false },
    { id: '3', name: 'Text', visible: true, locked: false }
  ]);
  const [activeLayer, setActiveLayer] = useState('2');
  const [showLayers, setShowLayers] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [collaborators, setCollaborators] = useState<Array<{id: string, name: string, color: string}>>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  
  // Percentage and Math features state
  const [showPercentagePanel, setShowPercentagePanel] = useState(false);
  const [showMathPanel, setShowMathPanel] = useState(false);
  const [showCalculatorPanel, setShowCalculatorPanel] = useState(false);
  const [percentageValue, setPercentageValue] = useState('');
  const [mathExpression, setMathExpression] = useState('');
  const [calculatorExpression, setCalculatorExpression] = useState('');
  const [percentageResult, setPercentageResult] = useState('');
  const [mathResult, setMathResult] = useState('');
  const [calculatorResult, setCalculatorResult] = useState('');

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for mobile viewport
  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse toolbar on very small screens
      setToolbarCollapsed(window.innerWidth < 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // MathJax initialization
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      //@ts-ignore
        window.MathJax.Hub.Config({
            tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
            showMathMenu: false,
            messageStyle: "none"
        });
    };

    return () => {
        if (document.head.contains(script)) {
            document.head.removeChild(script);
        }
    };
  }, []);

  // Process LaTeX whenever it changes
  useEffect(() => {
    //@ts-ignore
    if (latexExpression.length > 0 && window.MathJax) {
        // Give a small delay to ensure DOM is updated
        setTimeout(() => {
          //@ts-ignore
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, latexContainerRef.current]);
        }, 100);
    }
  }, [latexExpression]);

  // Scroll to bottom when new chat messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [latexExpression]);

  // Process result when it changes
  useEffect(() => {
    if (result) {
        renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result]);
  
  // Enhanced resize handler
  useEffect(() => {
    if (!mounted) return;
    
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const topToolbarHeight = 64; // Height of the top toolbar
      setDimensions({
        width: window.innerWidth * dpr,
        height: (window.innerHeight - topToolbarHeight) * dpr,
      });
      
      if (canvasRef.current) {
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight - topToolbarHeight}px`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  // Initialize drawing instance
  useEffect(() => {
    if (!mounted) return;
    
    if (canvasRef.current && dimensions.width > 0 && dimensions.height > 0) {
      const canvas = canvasRef.current;
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Initialize drawing library with type assertion
      drawingInstanceRef.current = initDraw(canvas, roomId) as unknown as DrawingInstance;
    }
  }, [roomId, dimensions, mounted]);

  const renderLatexToCanvas = (expression: string, answer: string) => {
    const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
    const newLatex = {
      id: `latex-${Date.now()}-${mounted ? Math.random().toString(36).substr(2, 9) : 'temp'}`, 
      content: latex
    };
    setLatexExpression(prev => [...prev, newLatex]);
  };

  const removeLatexExpression = (id: string) => {
    setLatexExpression(prev => prev.filter(item => item.id !== id));
  };

  const runRoute = async () => {
    setIsLoading(true);
    const canvas = canvasRef.current;

    try {
      if (canvas) {
        try {
          const response = await axios({
            method: 'post',
            url: 'https://slate-ai-backend-l0eb.onrender.com/calculate',
            data: {
              image: canvas.toDataURL('image/png'),
              dict_of_vars: dictOfVars
            }
          });

          const resp = response.data;
          console.log('Response', resp);
          
          if (resp.data && Array.isArray(resp.data)) {
            // Handle variable assignments
            resp.data.forEach((data: Response) => {
              if (data.assign === true) {
                setDictOfVars(prevDict => ({
                  ...prevDict,
                  [data.expr]: data.result
                }));
              }
            });
            
            // Process each response item
            resp.data.forEach((data: Response, index: number) => {
              setTimeout(() => {
                setResult({
                  expression: data.expr,
                  answer: data.result
                });
              }, 500 * (index + 1)); // Stagger responses
            });
          }
        } catch (error) {
          console.error('Error running calculation:', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Style toolbar handlers
  const handleDeleteSelected = useCallback(() => {
    drawingInstanceRef.current?.deleteSelected?.();
  }, []);

  const handleClearAll = useCallback(() => {
    drawingInstanceRef.current?.clearAll?.();
    // Also clear LaTeX expressions when clearing all
    setLatexExpression([]);
  }, []);

  const handleStrokeColorChange = useCallback((color: string) => {
    setStrokeColor(color);
    drawingInstanceRef.current?.setStrokeColor?.(color);
  }, []);

  const handleBgColorChange = useCallback((color: string) => {
    setBgColor(color);
    drawingInstanceRef.current?.setBgColor?.(color);
    
    // Update canvas background
    if (canvasRef.current) {
      canvasRef.current.style.backgroundColor = color === 'transparent' ? 'transparent' : color;
    }
  }, []);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
    drawingInstanceRef.current?.setStrokeWidth?.(width);
  }, []);

  const handleToolSelect = useCallback((toolType: string) => {
    setSelectedTool(toolType);
    
    // Handle special tools
    if (toolType === 'percentage') {
      setShowPercentagePanel(true);
      setShowMathPanel(false);
      setShowCalculatorPanel(false);
      return;
    }
    
    if (toolType === 'math') {
      setShowMathPanel(true);
      setShowPercentagePanel(false);
      setShowCalculatorPanel(false);
      return;
    }
    
    if (toolType === 'calculator') {
      setShowCalculatorPanel(true);
      setShowPercentagePanel(false);
      setShowMathPanel(false);
      return;
    }
    
    if (toolType === 'number') {
      // For number tool, we'll add a simple number input
      const number = prompt('Enter a number:');
      if (number && drawingInstanceRef.current) {
        // Add number to canvas
        console.log('Adding number to canvas:', number);
      }
      return;
    }
    
    // For regular tools, use the drawing instance
    drawingInstanceRef.current?.selectTool?.(toolType);
  }, []);

  const toggleToolbar = () => {
    setToolbarCollapsed(!toolbarCollapsed);
  };

  // Enhanced functionality functions
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, lastAction]);
      setUndoStack(undoStack.slice(0, -1));
      // For now, we'll just clear and redraw
      // In a full implementation, you'd restore the previous state
      console.log('Undo action:', lastAction);
    }
  }, [undoStack, redoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const lastAction = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, lastAction]);
      setRedoStack(redoStack.slice(0, -1));
      // For now, we'll just clear and redraw
      // In a full implementation, you'd restore the previous state
      console.log('Redo action:', lastAction);
    }
  }, [undoStack, redoStack]);

  const handleExport = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${projectName}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  }, [projectName]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && canvasRef.current && drawingInstanceRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate image dimensions to fit nicely on canvas
          const canvasWidth = canvasRef.current!.width;
          const canvasHeight = canvasRef.current!.height;
          
          // Calculate aspect ratio to maintain image proportions
          const imgAspectRatio = img.width / img.height;
          const canvasAspectRatio = canvasWidth / canvasHeight;
          
          let width, height;
          if (imgAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            width = canvasWidth * 0.8; // 80% of canvas width
            height = width / imgAspectRatio;
          } else {
            // Image is taller than canvas
            height = canvasHeight * 0.8; // 80% of canvas height
            width = height * imgAspectRatio;
          }
          
          // Center the image on the canvas
          const x = (canvasWidth - width) / 2;
          const y = (canvasHeight - height) / 2;
          
          // Add image to the drawing system
          if (drawingInstanceRef.current) {
            drawingInstanceRef.current.addImage(e.target?.result as string, x, y, width, height);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleZoom = useCallback((newZoom: number) => {
    setZoom(Math.max(0.1, Math.min(3, newZoom)));
    if (canvasRef.current) {
      canvasRef.current.style.transform = `scale(${newZoom})`;
    }
  }, []);

  const handleLayerToggle = useCallback((layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  }, [layers]);

  const handleLayerLock = useCallback((layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked }
        : layer
    ));
  }, [layers]);

  const handleAutoSave = useCallback(() => {
    if (autoSave && canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL();
      localStorage.setItem(`slate-autosave-${roomId}`, dataURL);
      setLastSaved(new Date());
    }
  }, [autoSave, roomId]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && mounted) {
      const interval = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoSave, mounted, handleAutoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 's':
            e.preventDefault();
            handleExport();
            break;
          case 'o':
            e.preventDefault();
            document.getElementById('import-input')?.click();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoom(zoom + 0.1);
            break;
          case '-':
            e.preventDefault();
            handleZoom(zoom - 0.1);
            break;
          case '0':
            e.preventDefault();
            handleZoom(1);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleExport, handleZoom, zoom]);

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [handleAutoSave]);

  // AI feature toggle handler
  const handleAIFeatureToggle = (featureId: string) => {
    console.log(`AI Feature toggled: ${featureId}`);
    // Implement AI feature logic here
  };

  // Percentage calculation handler
  const handlePercentageCalculate = () => {
    if (percentageValue) {
      try {
        const value = parseFloat(percentageValue);
        if (!isNaN(value)) {
          const result = `${value}% = ${(value / 100).toFixed(4)}`;
          setPercentageResult(result);
          
          // Add to LaTeX expressions for display
          const newExpression = {
            id: `percentage-${Date.now()}`,
            content: `\\text{${result}}`
          };
          setLatexExpression(prev => [...prev, newExpression]);
        }
      } catch (error) {
        setPercentageResult('Invalid input');
      }
    }
  };

  // Math expression calculation handler
  const handleMathCalculate = () => {
    if (mathExpression) {
      try {
        // Basic math expression evaluation (be careful with eval in production)
        const sanitizedExpression = mathExpression.replace(/[^0-9+\-*/().]/g, '');
        const result = eval(sanitizedExpression);
        setMathResult(result.toString());
        
        // Add to LaTeX expressions for display
        const newExpression = {
          id: `math-${Date.now()}`,
          content: `${mathExpression} = ${result}`
        };
        setLatexExpression(prev => [...prev, newExpression]);
      } catch (error) {
        setMathResult('Invalid expression');
      }
    }
  };

  // Calculator expression handler
  const handleCalculatorCalculate = () => {
    if (calculatorExpression) {
      try {
        // Basic calculator evaluation
        const sanitizedExpression = calculatorExpression.replace(/[^0-9+\-*/().]/g, '');
        const result = eval(sanitizedExpression);
        setCalculatorResult(result.toString());
        
        // Add to LaTeX expressions for display
        const newExpression = {
          id: `calc-${Date.now()}`,
          content: `${calculatorExpression} = ${result}`
        };
        setLatexExpression(prev => [...prev, newExpression]);
      } catch (error) {
        setCalculatorResult('Invalid expression');
      }
    }
  };

  if (!mounted || !dimensions.width || !dimensions.height) return null;

  return (
    <div className="relative">
      {/* Run Button - Smaller Size with Fixed Position at Bottom Right */}
      <button
        onClick={runRoute}
        disabled={isLoading}
        className={`fixed z-60 px-3 py-2 sm:px-4 sm:py-2.5 font-medium rounded-lg shadow-lg transition-all flex items-center gap-1.5 sm:gap-2
          ${isLoading 
            ? 'bg-purple-700/90 cursor-not-allowed ring-2 ring-purple-400/30' 
            : 'bg-purple-600 hover:bg-purple-700 cursor-pointer transform hover:scale-105'}
          ${isLoading && 'animate-pulse'}
          ${isMobile ? 'bottom-2 left-2 text-xs' : 'bottom-4 right-4 text-sm'}
        `}
        style={{
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {isLoading ? (
          <>
            <svg 
              className={`animate-spin ${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`}
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-white/90">{isMobile ? 'Loading' : 'Processing'}</span>
          </>
        ) : (
          <>
            <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white transform transition-all hover:scale-110`} />
            <span className="text-white font-medium tracking-wide">
              {isMobile ? 'Magic' : 'Magic'}
            </span>
          </>
        )}
      </button>
      
      {/* Main Tools Toolbar - Smaller Size and Adjusted for Mobile */}
      <div className={`fixed z-30 transition-all duration-300 shadow-md
        ${isMobile 
          ? toolbarCollapsed 
            ? 'top-20 right-3' 
            : 'top-20 left-1/2 -translate-x-1/2' 
          : 'top-20 left-1/2 -translate-x-1/2'}`}
      >
        {isMobile && toolbarCollapsed ? (
          <button 
            onClick={toggleToolbar}
            className="bg-purple-600 p-2 rounded-full shadow-md"
          >
            <Pencil size={18} color="white" />
          </button>
        ) : (
          <div className="flex gap-1 sm:gap-2 p-2 sm:p-3 bg-neutral-800 rounded-lg relative">
            {isMobile && (
              <button 
                onClick={toggleToolbar}
                className="absolute -top-2 -right-2 bg-purple-600 p-1 rounded-full shadow-md"
              >
                <X size={14} color="white" />
              </button>
            )}
            
            <div className={`flex flex-wrap gap-1 justify-center ${isMobile ? 'max-w-[250px]' : ''}`}>
              {tools.map((tool) => (
                <button
                  key={tool.type}
                  onClick={() => handleToolSelect(tool.type)}
                  className={`
                    ${isMobile ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'} 
                    flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 ease-in-out
                    ${selectedTool === tool.type 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-neutral-700 hover:bg-neutral-600'}
                  `}
                  title={tool.label}
                >
                  {React.cloneElement(tool.icon, {
                    size: isMobile ? 16 : 18,
                    strokeWidth: 1.5,
                    color: "white",
                  })}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Style Toolbar - Reduced Size */}
      <div className={`fixed z-40 bg-neutral-900 rounded-lg p-2 sm:p-3 flex flex-col gap-2 sm:gap-3 shadow-md transition-all duration-300
        ${isMobile 
          ? 'w-36 sm:w-40 top-auto bottom-2 right-2' 
          : 'w-40 sm:w-44 top-3 right-3'}`}
      >
        {/* Stroke Color Section */}
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-xs font-medium mb-1">Stroke</h3>
          <div className="flex gap-1 flex-wrap">
            {strokeColors.map((color) => (
              <div
                key={color}
                onClick={() => handleStrokeColorChange(color)}
                className={`
                  ${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-7 sm:h-7'}
                  rounded-md cursor-pointer transition-all duration-200
                  ${strokeColor === color 
                    ? 'border-2 border-blue-500 ring-1 ring-blue-500/30' 
                    : 'border border-transparent'}
                `}
                style={{ 
                  backgroundColor: color === 'transparent' ? '#ffffff' : color,
                  position: 'relative' 
                }}
              >
                {color === "transparent" && <TransparentPattern />}
              </div>
            ))}
          </div>
        </div>

        {/* Background Color Section */}
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-xs font-medium mb-1">Background</h3>
          <div className="flex gap-1 flex-wrap">
            {bgColors.map((color) => (
              <div
                key={color}
                onClick={() => handleBgColorChange(color)}
                className={`
                  ${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-7 sm:h-7'}
                  rounded-md cursor-pointer transition-all duration-200
                  ${bgColor === color 
                    ? 'border-2 border-blue-500 ring-1 ring-blue-500/30' 
                    : 'border border-transparent'}
                `}
                style={{ 
                  backgroundColor: color === 'transparent' ? '#ffffff' : color,
                  position: 'relative' 
                }}
              >
                {color === "transparent" && <TransparentPattern />}
              </div>
            ))}
          </div>
        </div>

        {/* Stroke Width Section */}
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-xs font-medium mb-1">Stroke Width</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
              className="flex-grow h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full appearance-none"
            />
            <span className="min-w-[20px] text-center bg-neutral-800 text-white text-xs py-0.5 px-1 rounded">
              {strokeWidth}
            </span>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-xs font-medium mb-1">Actions</h3>
          <div className="flex flex-col gap-1">
            <button 
              onClick={handleDeleteSelected} 
              className="bg-purple-600 text-white text-xs py-1.5 rounded hover:bg-purple-700 transition-colors"
            >
              Delete Selected
            </button>
            <button 
              onClick={handleClearAll} 
              className="bg-purple-600 text-white text-xs py-1.5 rounded hover:bg-purple-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="fixed top-16 left-0 touch-none select-none cursor-auto"
        style={{ zIndex: 10 }}
      />
      
      {/* Chat UI for LaTeX Display - Smaller Size */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-in-out ${showChat ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          width: isMobile ? 'calc(100vw - 16px)' : '320px',
          maxWidth: 'calc(100vw - 16px)',
          height: isMobile ? 'calc(100vh - 140px)' : '450px',
          maxHeight: 'calc(100vh - 100px)',
          left: isMobile ? '8px' : '16px',
          bottom: isMobile ? '50px' : '60px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Chat Header */}
        <div className="bg-purple-600 border-b text-white p-1.5 sm:p-2 flex justify-between items-center">
          <div className="font-medium text-xs sm:text-sm">Salte AI</div>
          <button 
            onClick={() => setShowChat(false)} 
            className="text-white hover:bg-red-600 rounded-full p-0.5 transition-colors"
          >
            <X size={isMobile ? 14 : 16} />
          </button>
        </div>
        
        {/* Chat Messages Area */}
        <div 
          ref={latexContainerRef}
          className="flex-grow bg-neutral-900 p-1.5 sm:p-2 overflow-y-auto"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {latexExpression.length === 0 ? (
            <div className="text-center text-gray-400 my-auto text-xs">
              Draw an equation and click the Run button to see results here
            </div>
          ) : (
            <>
              {latexExpression.map((item) => (
                <div key={item.id} className="flex flex-col max-w-full">
                  {/* User "message" */}
                  <div className="self-start bg-gray-100 rounded-md p-1.5 mb-1.5 max-w-3/4">
                    <div className="text-gray-600 text-xs">Equation processed</div>
                  </div>
                  
                  {/* AI response with LaTeX */}
                  <div className="self-end bg-white rounded-lg p-2 text-black relative max-w-[90%] group transition-all duration-200 ease-in-out border border-white/5">
                    {/* Delete button positioned in top-right corner */}
                    <button
                      onClick={() => removeLatexExpression(item.id)}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 hover:bg-red-600 rounded-full shadow-md transition-colors duration-150 ease-out z-10"
                      aria-label="Delete"
                    >
                      <X size={10} className="stroke-[2.5]" />
                    </button>
                    
                    <div className="relative z-10">
                      {/* Improved scrolling container with proper max height and overflow handling */}
                      <div
                        className="latex-content font-serif text-xs leading-tight break-words max-h-[160px] sm:max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </div>
                    
                    {/* Bottom alignment spacer */}
                    <div className="h-1.5 sm:h-2" />
                    
                    {/* Visual enhancements */}
                    <div className="absolute inset-0 rounded-lg border border-white/5 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 rounded-lg pointer-events-none" />
                  </div>       
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
        
        {/* Footer - Just for UI completeness */}
        <div className="bg-purple-600 border-t border-gray-200 p-1.5 text-center text-xs text-white">
          Powered by Slate AI
        </div>
      </div>
      
      {/* Chat toggle button if chat is hidden - Smaller Size */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className={`fixed z-60 ${isMobile ? 'w-9 h-9 top-20 left-3' : 'w-10 h-10 top-20 left-3'} bg-purple-700 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-md transition-all`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "16" : "18"} height={isMobile ? "16" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Enhanced UI Components */}
      
      {/* Top Toolbar with Project Info and Actions */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-white text-sm font-medium border-none outline-none"
              placeholder="Project Name"
            />
            {lastSaved && (
              <span className="text-xs text-gray-400">
                Last saved: {mounted ? lastSaved.toLocaleTimeString() : '--:--'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLayers(!showLayers)}
              className="p-2 text-white hover:bg-white/10 rounded"
              title="Layers"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowExport(!showExport)}
              className="p-2 text-white hover:bg-white/10 rounded"
              title="Export"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              className="p-2 text-white hover:bg-white/10 rounded"
              title="Keyboard Shortcuts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="p-2 text-white hover:bg-white/10 rounded"
              title="Collaboration"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowAIFeatures(!showAIFeatures)}
              className="p-2 text-white hover:bg-white/10 rounded"
              title="AI Features"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 text-white hover:bg-white/10 rounded"
              title="Templates"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Layers Panel */}
      {showLayers && (
        <div className="fixed top-24 left-4 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
          <h3 className="text-white font-medium mb-3">Layers</h3>
          {layers.map((layer) => (
            <div key={layer.id} className="flex items-center gap-2 mb-2">
              <button
                onClick={() => handleLayerToggle(layer.id)}
                className={`w-4 h-4 rounded ${layer.visible ? 'bg-green-500' : 'bg-gray-500'}`}
              />
              <button
                onClick={() => handleLayerLock(layer.id)}
                className={`w-4 h-4 rounded ${layer.locked ? 'bg-red-500' : 'bg-gray-500'}`}
              />
              <span className={`text-sm ${activeLayer === layer.id ? 'text-white' : 'text-gray-400'}`}>
                {layer.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Export Panel */}
      {showExport && (
        <div className="fixed top-24 right-4 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
          <h3 className="text-white font-medium mb-3">Export</h3>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Export as PNG
            </button>
            <input
              id="import-input"
              type="file"
              accept="image/*"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('import-input')?.click()}
              className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Import Image
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Panel */}
      {showKeyboardShortcuts && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[300px]">
          <h3 className="text-white font-medium mb-3">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Undo:</span>
              <span className="text-white">Ctrl+Z</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Redo:</span>
              <span className="text-white">Ctrl+Shift+Z</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Save:</span>
              <span className="text-white">Ctrl+S</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Open:</span>
              <span className="text-white">Ctrl+O</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Zoom In:</span>
              <span className="text-white">Ctrl+=</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Zoom Out:</span>
              <span className="text-white">Ctrl+-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Reset Zoom:</span>
              <span className="text-white">Ctrl+0</span>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(zoom - 0.1)}
            className="w-8 h-8 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            -
          </button>
          <span className="text-white text-sm min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(zoom + 0.1)}
            className="w-8 h-8 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            +
          </button>
        </div>
      </div>

      {/* Undo/Redo Controls */}
      <div className="fixed bottom-4 left-20 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="w-8 h-8 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="w-8 h-8 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Add CSS for better styling and animations */}
      <style jsx global>{`
        /* Enhanced MathJax styling */
        .MathJax_Display {
          margin: 0 !important;
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .latex-content {
          animation: fadeIn 0.25s ease-out;
        }
        
        /* Responsive styling */
        @media (max-width: 768px) {
          .MathJax {
            font-size: 85% !important;
          }
        }
        
        @media (max-width: 480px) {
          .MathJax {
            font-size: 75% !important;
          }
        }
        
        /* Improved input styling for touch devices */
        @media (max-width: 768px) {
          input[type=range] {
            height: 20px;
            -webkit-appearance: none;
            margin: 8px 0;
            background: transparent;
          }
          input[type=range]::-webkit-slider-thumb {
            height: 14px;
            width: 14px;
            border-radius: 50%;
            background: #4f46e5;
            -webkit-appearance: none;
            margin-top: -6px;
          }
          input[type=range]::-webkit-slider-runnable-track {
            height: 3px;
            border-radius: 1.5px;
          }
          input[type=range]:focus {
            outline: none;
          }
        }
        
        /* Safe area insets for notched phones */
        @supports (padding: max(0px)) {
          .chat-container {
            padding-bottom: max(8px, env(safe-area-inset-bottom));
            padding-left: max(8px, env(safe-area-inset-left));
          }
        }
      `}</style>

      {/* Collaboration Panel */}
      <CollaborationPanel
        roomId={roomId}
        isVisible={showCollaboration}
        onToggle={() => setShowCollaboration(!showCollaboration)}
      />

      {/* Templates Panel */}
      {showTemplates && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[300px] max-w-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Templates</h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  // Apply template
                  console.log(`Applying template: ${template.name}`);
                  setShowTemplates(false);
                }}
                className="p-3 text-left bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 transition-colors"
              >
                <h4 className="text-sm font-medium text-white mb-1">{template.name}</h4>
                <p className="text-xs text-gray-400">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Percentage Panel */}
      {showPercentagePanel && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[300px] max-w-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Percentage Calculator
            </h3>
            <button
              onClick={() => setShowPercentagePanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Enter Percentage Value</label>
              <input
                type="number"
                value={percentageValue}
                onChange={(e) => setPercentageValue(e.target.value)}
                placeholder="e.g., 25"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handlePercentageCalculate}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Calculate
            </button>
            {percentageResult && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-green-400 font-mono text-sm">{percentageResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Math Panel */}
      {showMathPanel && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[300px] max-w-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Sigma className="w-4 h-4" />
              Math Expression Calculator
            </h3>
            <button
              onClick={() => setShowMathPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Enter Math Expression</label>
              <input
                type="text"
                value={mathExpression}
                onChange={(e) => setMathExpression(e.target.value)}
                placeholder="e.g., 2 + 3 * 4"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleMathCalculate}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Calculate
            </button>
            {mathResult && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-green-400 font-mono text-sm">{mathResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calculator Panel */}
      {showCalculatorPanel && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[300px] max-w-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Advanced Calculator
            </h3>
            <button
              onClick={() => setShowCalculatorPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Enter Expression</label>
              <input
                type="text"
                value={calculatorExpression}
                onChange={(e) => setCalculatorExpression(e.target.value)}
                placeholder="e.g., (5 + 3) * 2"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleCalculatorCalculate}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Calculate
            </button>
            {calculatorResult && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-green-400 font-mono text-sm">{calculatorResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Features Panel */}
      <AIFeatures
        isVisible={showAIFeatures}
        onToggle={() => setShowAIFeatures(!showAIFeatures)}
        onFeatureToggle={handleAIFeatureToggle}
      />
    </div>
  );
}

// Helper components
const TransparentPattern = () => (
  <svg className="absolute top-0 left-0 w-full h-full">
    <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0,0 L8,8" stroke="#999" strokeWidth="1" />
      <path d="M8,0 L0,8" stroke="#999" strokeWidth="1" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#crosshatch)" />
  </svg>
);

const tools = [
  { type: "pan", label: "Pan", icon: <Hand /> },
  { type: "pencil", label: "Pencil", icon: <Pencil /> },
  { type: "rect", label: "Rectangle", icon: <RectangleHorizontal /> },
  { type: "circle", label: "Circle", icon: <Circle /> },
  { type: "diamond", label: "Diamond", icon: <Diamond /> },
  { type: "arrow", label: "Arrow", icon: <ArrowRight /> },
  { type: "line", label: "Line", icon: <Minus /> },
  { type: "text", label: "Text", icon: <Type /> },
  { type: "percentage", label: "Percentage", icon: <Percent /> },
  { type: "math", label: "Math", icon: <Sigma /> },
  { type: "calculator", label: "Calculator", icon: <Calculator /> },
  { type: "number", label: "Number", icon: <Hash /> },
  { type: "eraser", label: "Eraser", icon: <Eraser /> },
  { type: "select", label: "Select", icon: <MousePointer /> },
];

// Enhanced color palettes
const strokeColors = [
  "#FFFFFF", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471"
];

const bgColors = [
  "transparent", "#FFE6E6", "#E6F7FF", "#E6FFE6", "#FFF2E6", 
  "#F0E6FF", "#E6FFFF", "#FFFFE6", "#FFE6F2", "#E6E6FF"
];

// Templates for quick start
const templates = [
  { name: "Blank Canvas", description: "Start with a clean slate" },
  { name: "Math Worksheet", description: "Perfect for equations and formulas" },
  { name: "Percentage Calculator", description: "Calculate percentages and ratios" },
  { name: "Scientific Calculator", description: "Advanced mathematical operations" },
  { name: "Flowchart", description: "Create diagrams and processes" },
  { name: "Mind Map", description: "Organize ideas and concepts" },
  { name: "Wireframe", description: "Design layouts and interfaces" }
];

