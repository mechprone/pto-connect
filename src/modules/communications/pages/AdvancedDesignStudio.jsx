import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Type, Image, Square, Minus, 
  Save, Eye, Sparkles, 
  ZoomIn, ZoomOut,
  Search,
  Mail, MessageSquare, Share2
} from 'lucide-react';

// Builder Modes
const BuilderModes = {
  EMAIL: 'email',
  SMS: 'sms',
  FLYER: 'flyer',
  SOCIAL: 'social',
  ANNOUNCEMENT: 'announcement'
};

const AdvancedDesignStudio = () => {
  const [canvas, setCanvas] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('templates');
  const [showStellaPopup, setShowStellaPopup] = useState(false);
  const [builderMode, setBuilderMode] = useState(BuilderModes.EMAIL);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const canvasRef = useRef(null);

  // Console logging for debugging
  useEffect(() => {
    console.log('AdvancedDesignStudio mounted successfully');
  }, []);

  // Close Stella popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStellaPopup && !event.target.closest('.stella-popup-container')) {
        setShowStellaPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStellaPopup]);

  // Working templates with absolute URLs
  const templates = [
    {
      id: 'welcome-newsletter',
      name: 'Welcome Back Newsletter',
      category: 'Newsletter',
      thumbnail: 'https://picsum.photos/300/200?random=1',
      description: 'Professional welcome back newsletter',
      elements: [
        {
          type: 'header',
          content: 'Welcome Back to School!',
          style: { fontSize: '32px', fontWeight: 'bold', color: '#1e40af', textAlign: 'center' }
        },
        {
          type: 'text',
          content: 'We are excited to start another amazing school year together!',
          style: { fontSize: '18px', color: '#374151', textAlign: 'center' }
        }
      ]
    },
    {
      id: 'fall-festival',
      name: 'Fall Festival Invitation',
      category: 'Events',
      thumbnail: 'https://picsum.photos/300/200?random=2',
      description: 'Festive fall event invitation',
      elements: [
        {
          type: 'header',
          content: 'Fall Festival 2024',
          style: { fontSize: '28px', fontWeight: 'bold', color: '#d97706', textAlign: 'center' }
        },
        {
          type: 'text',
          content: 'Join us for food, fun, and community spirit!',
          style: { fontSize: '16px', color: '#374151', textAlign: 'center' }
        }
      ]
    },
    {
      id: 'event-announcement',
      name: 'Event Announcement',
      category: 'Events',
      thumbnail: 'https://picsum.photos/300/200?random=3',
      description: 'Eye-catching event announcement',
      elements: [
        {
          type: 'header',
          content: 'Special Event',
          style: { fontSize: '24px', fontWeight: 'bold', color: '#dc2626', textAlign: 'center' }
        },
        {
          type: 'text',
          content: 'Join us for an unforgettable experience!',
          style: { fontSize: '16px', color: '#374151', textAlign: 'center' }
        }
      ]
    }
  ];

  // Simple drag elements
  const dragElements = [
    { type: 'text', icon: Type, label: 'Text', defaultContent: 'Add your text here' },
    { type: 'header', icon: Type, label: 'Header', defaultContent: 'Header Text' },
    { type: 'image', icon: Image, label: 'Image', defaultSrc: 'https://picsum.photos/300/200?random=99' },
    { type: 'button', icon: Square, label: 'Button', defaultContent: 'Click Here' },
    { type: 'divider', icon: Minus, label: 'Divider', defaultContent: '' }
  ];

  // Use Template function
  const useTemplate = (template) => {
    try {
      console.log('Using template:', template.name);
      const newElements = template.elements.map((element, index) => ({
        ...element,
        id: `element_${Date.now()}_${index}`,
        x: 20, // Start closer to left edge
        y: 20 + (index * 80) // Tighter vertical spacing
      }));
      setCanvas(newElements);
      setSelectedElement(null);
      console.log('Template applied successfully', newElements);
    } catch (error) {
      console.error('Template error:', error);
    }
  };

  // Drag Element Component
  const DragElement = ({ element }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'element',
      item: { 
        elementType: element.type,
        defaultContent: element.defaultContent || '',
        defaultSrc: element.defaultSrc || ''
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }), [element]);

    const Icon = element.icon;

    return (
      <div
        ref={drag}
        className={`p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
          isDragging ? 'opacity-50 bg-blue-100' : ''
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <Icon className="w-6 h-6 text-gray-600" />
          <span className="text-sm text-gray-700">{element.label}</span>
          {isDragging && (
            <span className="text-xs text-blue-600 font-medium">Dragging...</span>
          )}
        </div>
      </div>
    );
  };

  // Canvas Drop Zone
  const DropZone = () => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'element',
      drop: (item, monitor) => {
        try {
          console.log('🎯 DROP EVENT TRIGGERED!', item);
          const offset = monitor.getClientOffset();
          const canvasRect = canvasRef.current?.getBoundingClientRect();
          
          console.log('📍 Drop details:', {
            offset,
            canvasRect,
            hasCanvasRef: !!canvasRef.current,
            itemType: item.elementType
          });
          
          if (!offset || !canvasRect) {
            console.log('❌ Missing offset or canvas rect');
            return;
          }
          
          const newElement = {
            id: `element_${Date.now()}_${Math.random()}`,
            type: item.elementType,
            content: item.defaultContent || 'New Content',
            src: item.defaultSrc || '',
            x: Math.max(10, offset.x - canvasRect.left - 50),
            y: Math.max(10, offset.y - canvasRect.top - 20),
            style: {
              fontSize: '16px',
              color: '#374151',
              padding: '10px'
            }
          };
          
          console.log('✅ Creating element:', newElement);
          setCanvas(prev => {
            const updated = [...prev, newElement];
            console.log('🎨 Canvas updated, total elements:', updated.length);
            return updated;
          });
          setSelectedElement(newElement);
        } catch (error) {
          console.error('❌ Drop error:', error);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }), []);

    return (
      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        className={`relative bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[600px] transition-colors ${
          isOver ? 'border-blue-500 bg-blue-50' : ''
        } ${canDrop ? 'border-green-400' : ''}`}
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        {/* Debug overlays */}
        {isOver && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs z-50">
            🎯 DROP ZONE ACTIVE
          </div>
        )}
        {canDrop && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs z-50">
            ✅ CAN DROP
          </div>
        )}
        
        {canvas.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => setSelectedElement(element)}
            onUpdate={(updated) => {
              setCanvas(prev => prev.map(el => el.id === element.id ? updated : el));
              setSelectedElement(updated);
            }}
          />
        ))}
        
        {canvas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Drag elements here to start designing</p>
              <p className="text-sm">Choose from templates or build from scratch</p>
              <div className="mt-4 text-xs bg-gray-100 p-2 rounded">
                Canvas: {canvas.length} elements | Can Drop: {canDrop ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Canvas Element Component
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
      const baseStyle = {
        ...element.style,
        cursor: 'pointer',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px'
      };

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
            <div style={baseStyle}>{element.content}</div>
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
            <h2 style={{ ...baseStyle, fontSize: '24px', fontWeight: 'bold' }}>
              {element.content}
            </h2>
          );
          
        case 'image':
          return (
            <img
              src={element.src}
              alt="Design element"
              style={{ ...baseStyle, maxWidth: '300px', height: 'auto' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Image';
              }}
            />
          );
          
        case 'button':
          return (
            <button
              style={{
                ...baseStyle,
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none'
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
                ...baseStyle,
                border: 'none',
                height: '2px',
                backgroundColor: '#e5e7eb',
                width: '100%'
              }}
            />
          );
          
        default:
          return <div style={baseStyle}>Unknown element: {element.type}</div>;
      }
    };

    return (
      <div
        className="absolute"
        style={{
          left: element.x,
          top: element.y,
          minWidth: '50px',
          minHeight: '30px'
        }}
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
      >
        {renderElement()}
        {isSelected && (
          <div className="absolute -top-1 -left-1 text-xs bg-blue-600 text-white px-1 rounded">
            {element.type}
          </div>
        )}
      </div>
    );
  };

  // Mode configuration
  const getModeConfig = (mode) => {
    const configs = {
      email: { label: '📧 Email', icon: Mail },
      sms: { label: '📱 SMS', icon: MessageSquare },
      flyer: { label: '📄 Flyer', icon: Square },
      social: { label: '📱 Social Post', icon: Share2 },
      announcement: { label: '📢 Announcement', icon: Type }
    };
    return configs[mode] || configs.email;
  };

  // Filter templates
  const getFilteredTemplates = () => {
    let filtered = templates;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const templateCategories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'newsletter', name: 'Newsletter', count: 1 },
    { id: 'events', name: 'Events', count: 2 }
  ];

  const updateElementStyle = (styleUpdates) => {
    if (!selectedElement) return;
    
    const updated = {
      ...selectedElement,
      style: { ...selectedElement.style, ...styleUpdates }
    };
    
    setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
    setSelectedElement(updated);
  };

  // Error handling for the component
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('AdvancedDesignStudio error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication Designer Error</h2>
          <p className="text-gray-600 mb-4">There was an issue loading the design studio.</p>
          <button 
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-100 flex">
        {/* Debug info in corner */}
        <div className="fixed bottom-4 right-4 bg-black text-green-400 p-2 rounded text-xs z-50">
          Elements: {canvas.length} | Mode: {builderMode}
        </div>

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
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'templates' && (
              <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {templateCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>

                {/* Templates */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Professional Templates</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {getFilteredTemplates().map(template => (
                      <div
                        key={template.id}
                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        onClick={() => useTemplate(template)}
                      >
                        <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={template.thumbnail} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Template';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <button className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all">
                              Use Template
                            </button>
                          </div>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'elements' && (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Drag Elements</h3>
                <div className="text-xs bg-yellow-100 p-2 rounded mb-4">
                  🐛 Debug: React DnD Elements ({dragElements.length} available)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dragElements.map(element => {
                    try {
                      return <DragElement key={element.type} element={element} />;
                    } catch (error) {
                      console.error('Error rendering drag element:', element.type, error);
                      return (
                        <div key={element.type} className="p-3 border border-red-200 rounded-lg bg-red-50">
                          <div className="flex flex-col items-center space-y-2">
                            <span className="text-sm text-red-600">Error: {element.label}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'brand' && (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Brand Assets</h3>
                <div>
                  <h4 className="font-medium text-sm mb-2">Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['#1f2937', '#374151', '#6b7280', '#d97706', '#059669', '#dc2626', '#7c3aed'].map(color => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => selectedElement && updateElementStyle({ color })}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Communication Designer</h1>
                <p className="text-sm text-gray-500">Create professional communications for your PTO</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                  <button
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Action Buttons */}
                <button 
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => console.log('Save draft')}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </button>
                <button 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => console.log('Preview', builderMode)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                
                {/* Stella AI Assistant */}
                <div className="relative stella-popup-container">
                  <button 
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={() => setShowStellaPopup(!showStellaPopup)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Stella
                  </button>
                  
                  {showStellaPopup && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Stella's Content Assistant</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Hi! I'm Stella. I can help create content for your designs.
                        </p>
                        
                        <div className="space-y-2">
                          <button className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                            Let Stella Write Email Subject
                          </button>
                          <button className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                            Let Stella Write Email Content
                          </button>
                          <button className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                            Let Stella Create Social Post
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => setShowStellaPopup(false)}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
                        >
                          <span className="text-gray-400">×</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Communication Type Tabs */}
            <div className="px-6">
              <div className="flex border-b border-gray-200">
                {Object.values(BuilderModes).map(mode => {
                  const config = getModeConfig(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => setBuilderMode(mode)}
                      className={`flex-1 py-4 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                        builderMode === mode 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex justify-center">
              <DropZone />
            </div>
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-80 bg-white border-l border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Properties</h2>
          </div>
          <div className="p-4">
            {selectedElement ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                  <textarea
                    value={selectedElement.content || ''}
                    onChange={(e) => {
                      const updated = { ...selectedElement, content: e.target.value };
                      setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
                      setSelectedElement(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={parseInt(selectedElement.style?.fontSize) || 16}
                    onChange={(e) => updateElementStyle({ fontSize: `${e.target.value}px` })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={selectedElement.style?.color || '#374151'}
                    onChange={(e) => updateElementStyle({ color: e.target.value })}
                    className="w-full h-10 rounded border"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select an element to edit its properties</p>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default AdvancedDesignStudio; 