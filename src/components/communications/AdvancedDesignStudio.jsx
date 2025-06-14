import React, { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Type, Image, Square, Circle, Minus, Link, 
  Palette, Download, Save, Eye, Sparkles, 
  Layers, ZoomIn, ZoomOut, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic
} from 'lucide-react';

const AdvancedDesignStudio = () => {
  const [canvas, setCanvas] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('templates');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const canvasRef = useRef(null);

  // Design Templates
  const emailTemplates = [
    {
      id: 1,
      name: 'Fall Festival Announcement',
      category: 'Events',
      thumbnail: '/templates/fall-festival.jpg',
      elements: [
        { type: 'header', content: 'Fall Festival 2024', style: { fontSize: '32px', color: '#d97706', fontWeight: 'bold' } },
        { type: 'image', src: '/images/fall-leaves.jpg', style: { width: '100%', height: '200px' } },
        { type: 'text', content: 'Join us for a day of fun, food, and community!', style: { fontSize: '18px', color: '#374151' } }
      ]
    },
    {
      id: 2,
      name: 'Fundraiser Progress',
      category: 'Fundraising',
      thumbnail: '/templates/fundraiser.jpg',
      elements: [
        { type: 'header', content: 'Fundraiser Update', style: { fontSize: '28px', color: '#059669', fontWeight: 'bold' } },
        { type: 'progress-bar', value: 75, goal: 5000, style: { backgroundColor: '#d1fae5' } },
        { type: 'text', content: 'We\'re 75% to our goal! Thank you for your support.', style: { fontSize: '16px' } }
      ]
    },
    {
      id: 3,
      name: 'Volunteer Call',
      category: 'Volunteers',
      thumbnail: '/templates/volunteer.jpg',
      elements: [
        { type: 'header', content: 'Volunteers Needed!', style: { fontSize: '30px', color: '#dc2626', fontWeight: 'bold' } },
        { type: 'button', content: 'Sign Up Now', style: { backgroundColor: '#dc2626', color: 'white', padding: '12px 24px' } },
        { type: 'text', content: 'Help make our events successful by volunteering your time.', style: { fontSize: '16px' } }
      ]
    }
  ];

  // Draggable Elements
  const designElements = [
    { type: 'text', icon: Type, label: 'Text', defaultContent: 'Add your text here' },
    { type: 'header', icon: Type, label: 'Header', defaultContent: 'Header Text' },
    { type: 'image', icon: Image, label: 'Image', defaultSrc: '/placeholder-image.jpg' },
    { type: 'button', icon: Square, label: 'Button', defaultContent: 'Click Here' },
    { type: 'divider', icon: Minus, label: 'Divider' },
    { type: 'shape', icon: Circle, label: 'Shape' },
    { type: 'link', icon: Link, label: 'Link', defaultContent: 'Link Text' }
  ];

  // Brand Assets
  const brandAssets = {
    colors: ['#1f2937', '#374151', '#6b7280', '#d97706', '#059669', '#dc2626', '#7c3aed'],
    fonts: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'],
    logos: [
      { id: 1, name: 'School Logo', src: '/logos/school-logo.png' },
      { id: 2, name: 'PTO Logo', src: '/logos/pto-logo.png' }
    ]
  };

  // Drag and Drop Handlers
  const DraggableElement = ({ element }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'design-element',
      item: { type: element.type, element },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const Icon = element.icon;

    return (
      <div
        ref={drag}
        className={`p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <Icon className="w-6 h-6 text-gray-600" />
          <span className="text-sm text-gray-700">{element.label}</span>
        </div>
      </div>
    );
  };

  const CanvasDropZone = () => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'design-element',
      drop: (item, monitor) => {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        const newElement = {
          id: Date.now(),
          type: item.type,
          x: offset.x - canvasRect.left,
          y: offset.y - canvasRect.top,
          content: item.element.defaultContent || '',
          src: item.element.defaultSrc || '',
          style: {
            fontSize: '16px',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '8px',
            borderRadius: '4px'
          }
        };
        
        setCanvas(prev => [...prev, newElement]);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        className={`relative bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[600px] ${
          isOver ? 'border-blue-500 bg-blue-50' : ''
        }`}
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
      >
        {canvas.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => setSelectedElement(element)}
            onUpdate={(updatedElement) => {
              setCanvas(prev => prev.map(el => el.id === element.id ? updatedElement : el));
              setSelectedElement(updatedElement);
            }}
          />
        ))}
        
        {canvas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Drag elements here to start designing</p>
              <p className="text-sm">Choose from templates or build from scratch</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CanvasElement = ({ element, isSelected, onSelect, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleDoubleClick = () => {
      if (element.type === 'text' || element.type === 'header' || element.type === 'button') {
        setIsEditing(true);
      }
    };

    const handleContentChange = (newContent) => {
      onUpdate({ ...element, content: newContent });
      setIsEditing(false);
    };

    const renderElement = () => {
      switch (element.type) {
        case 'text':
          return isEditing ? (
            <input
              type="text"
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none"
              autoFocus
            />
          ) : (
            <p style={element.style}>{element.content}</p>
          );
          
        case 'header':
          return isEditing ? (
            <input
              type="text"
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none text-2xl font-bold"
              autoFocus
            />
          ) : (
            <h2 style={{ ...element.style, fontSize: '24px', fontWeight: 'bold' }}>
              {element.content}
            </h2>
          );
          
        case 'image':
          return (
            <img
              src={element.src}
              alt="Design element"
              style={element.style}
              className="max-w-full h-auto"
            />
          );
          
        case 'button':
          return (
            <button
              style={{
                ...element.style,
                backgroundColor: element.style.backgroundColor || '#3b82f6',
                color: element.style.color || 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={element.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="bg-transparent border-none outline-none text-white"
                  autoFocus
                />
              ) : (
                element.content
              )}
            </button>
          );
          
        case 'divider':
          return (
            <hr
              style={{
                ...element.style,
                border: 'none',
                height: '2px',
                backgroundColor: element.style.backgroundColor || '#e5e7eb',
                margin: '16px 0'
              }}
            />
          );
          
        default:
          return <div>Unknown element</div>;
      }
    };

    return (
      <div
        className={`absolute cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          minWidth: '100px',
          minHeight: '30px'
        }}
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
      >
        {renderElement()}
        
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-move"></div>
        )}
      </div>
    );
  };

  // Stella AI Assistant Component
  const StellaAssistant = () => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateContent = async (type) => {
      setIsGenerating(true);
      // Simulate AI generation
      setTimeout(() => {
        const generatedContent = {
          'email-subject': 'Join Us for an Amazing Fall Festival!',
          'email-body': 'Dear PTO Community,\n\nWe\'re excited to invite you to our annual Fall Festival! Join us for a day filled with fun activities, delicious food, and community spirit.\n\nDate: Saturday, October 15th\nTime: 10 AM - 4 PM\nLocation: School Playground\n\nWe hope to see you there!',
          'social-post': '🍂 Fall Festival Alert! 🍂\n\nJoin us for food, fun, and community spirit! October 15th, 10 AM - 4 PM at the school playground. Bring the whole family! #PTOFallFestival #CommunityFun',
          'flyer-text': 'FALL FESTIVAL 2024\n\nFood • Games • Fun\nOctober 15th | 10 AM - 4 PM\nSchool Playground\n\nBring the whole family!'
        };
        
        // Add generated content to canvas
        const newElement = {
          id: Date.now(),
          type: 'text',
          x: 50,
          y: 50,
          content: generatedContent[type] || 'Generated content',
          style: {
            fontSize: '16px',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '8px'
          }
        };
        
        setCanvas(prev => [...prev, newElement]);
        setIsGenerating(false);
      }, 2000);
    };

    return (
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Stella's Content Assistant</h3>
        </div>
        
        <div className="text-xs text-purple-700 mb-3">
          Hi! I'm Stella. I can help create content for your designs, or you can create everything manually. Your choice!
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => generateContent('email-subject')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Write Email Subject
          </button>
          <button
            onClick={() => generateContent('email-body')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Write Email Content
          </button>
          <button
            onClick={() => generateContent('social-post')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Create Social Post
          </button>
          <button
            onClick={() => generateContent('flyer-text')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Write Flyer Content
          </button>
        </div>
        
        {isGenerating && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Stella is writing content...</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Properties Panel
  const PropertiesPanel = () => {
    if (!selectedElement) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select an element to edit properties</p>
        </div>
      );
    }

    const updateElementStyle = (styleUpdates) => {
      const updatedElement = {
        ...selectedElement,
        style: { ...selectedElement.style, ...styleUpdates }
      };
      setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updatedElement : el));
      setSelectedElement(updatedElement);
    };

    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Element Properties</h3>
        
        {/* Text Properties */}
        {(selectedElement.type === 'text' || selectedElement.type === 'header' || selectedElement.type === 'button') && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="range"
                min="12"
                max="48"
                value={parseInt(selectedElement.style.fontSize) || 16}
                onChange={(e) => updateElementStyle({ fontSize: `${e.target.value}px` })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={selectedElement.style.color || '#374151'}
                onChange={(e) => updateElementStyle({ color: e.target.value })}
                className="w-full h-10 rounded border"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => updateElementStyle({ fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`p-2 rounded border ${selectedElement.style.fontWeight === 'bold' ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'}`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateElementStyle({ fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`p-2 rounded border ${selectedElement.style.fontStyle === 'italic' ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'}`}
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
          <input
            type="color"
            value={selectedElement.style.backgroundColor || '#ffffff'}
            onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
            className="w-full h-10 rounded border"
          />
        </div>
        
        {/* Padding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
          <input
            type="range"
            min="0"
            max="32"
            value={parseInt(selectedElement.style.padding) || 8}
            onChange={(e) => updateElementStyle({ padding: `${e.target.value}px` })}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-100 flex">
        {/* Left Panel - Tools & Templates */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'templates' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'elements' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Elements
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'brand' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Brand
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Email Templates</h3>
                <div className="grid grid-cols-1 gap-3">
                  {emailTemplates.map(template => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      onClick={() => setCanvas(template.elements.map((el, idx) => ({ ...el, id: Date.now() + idx, x: 50, y: 50 + idx * 100 })))}
                    >
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'elements' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Design Elements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {designElements.map(element => (
                    <DraggableElement key={element.type} element={element} />
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'brand' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Brand Assets</h3>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {brandAssets.colors.map(color => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                        style={{ backgroundColor: color }}
                        onClick={() => selectedElement && updateElementStyle({ color })}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Fonts</h4>
                  <div className="space-y-1">
                    {brandAssets.fonts.map(font => (
                      <button
                        key={font}
                        className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded"
                        style={{ fontFamily: font }}
                        onClick={() => selectedElement && updateElementStyle({ fontFamily: font })}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Stella AI Assistant */}
          <div className="border-t border-gray-200 p-4">
            <StellaAssistant />
          </div>
        </div>
        
        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Design Studio</h1>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Undo className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Redo className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              
              <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto">
            <CanvasDropZone />
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-80 bg-white border-l border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Properties</h2>
          </div>
          <PropertiesPanel />
        </div>
      </div>
    </DndProvider>
  );
};

export default AdvancedDesignStudio;