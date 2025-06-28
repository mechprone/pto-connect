import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Select, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common';
import { Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';
import { eventsAPI } from '@/utils/api';

const EventIssues = ({ eventId, onIssueUpdated }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    loadIssues();
  }, [eventId]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEventIssues(eventId);
      setIssues(response.data);
    } catch (err) {
      setError('Failed to load issues');
      console.error('Error loading issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
  };

  const handleIssueUpdated = () => {
    setShowAddIssue(false);
    loadIssues();
    if (onIssueUpdated) onIssueUpdated();
  };

  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      await api.delete(`/issues/${issueId}`);
      loadIssues();
      if (onIssueUpdated) onIssueUpdated();
    } catch (err) {
      console.error('Error deleting issue:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'blocker': return '🚫';
      case 'bug': return '🐛';
      case 'feature_request': return '💡';
      case 'improvement': return '⚡';
      case 'question': return '❓';
      default: return '⚠️';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || issue.status === filters.status;
    const matchesPriority = filters.priority === 'all' || issue.priority === filters.priority;
    const matchesType = filters.type === 'all' || issue.type === filters.type;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    // Sort by priority first, then by creation date
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadIssues} variant="outline" className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Issues ({issues.length})</h2>
        <Button onClick={() => setShowAddIssue(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="blocked">Blocked</option>
          </Select>
          <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
            <option value="all">All Types</option>
            <option value="blocker">Blocker</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
            <option value="improvement">Improvement</option>
            <option value="question">Question</option>
          </Select>
        </div>
      </Card>

      {/* Issues List */}
      <div className="space-y-3">
        {sortedIssues.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No issues found matching your criteria.</p>
            <Button onClick={() => setShowAddIssue(true)} variant="outline">
              Report First Issue
            </Button>
          </Card>
        ) : (
          sortedIssues.map((issue) => (
            <Card key={issue.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleIssueClick(issue)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getTypeIcon(issue.type)}</span>
                    <h3 className="font-semibold text-lg">{issue.title}</h3>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {issue.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    {issue.reported_by && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {issue.reported_by}
                      </div>
                    )}
                    {issue.created_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(issue.created_at).toLocaleDateString()}
                      </div>
                    )}
                    {issue.resolved_at && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolved {new Date(issue.resolved_at).toLocaleDateString()}
                      </div>
                    )}
                    {issue.comments_count > 0 && (
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {issue.comments_count} comments
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIssueClick(issue);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteIssue(issue.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <Dialog open={true} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span className="text-lg">{getTypeIcon(selectedIssue.type)}</span>
                <span>Issue Details</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedIssue.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getPriorityColor(selectedIssue.priority)}>
                    {selectedIssue.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {selectedIssue.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedIssue.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedIssue.reported_by && (
                  <div>
                    <h4 className="font-medium mb-1">Reported By</h4>
                    <p className="text-gray-600">{selectedIssue.reported_by}</p>
                  </div>
                )}
                {selectedIssue.assigned_to && (
                  <div>
                    <h4 className="font-medium mb-1">Assigned To</h4>
                    <p className="text-gray-600">{selectedIssue.assigned_to}</p>
                  </div>
                )}
                {selectedIssue.created_at && (
                  <div>
                    <h4 className="font-medium mb-1">Created</h4>
                    <p className="text-gray-600">
                      {new Date(selectedIssue.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedIssue.resolved_at && (
                  <div>
                    <h4 className="font-medium mb-1">Resolved</h4>
                    <p className="text-gray-600">
                      {new Date(selectedIssue.resolved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedIssue.resolution_notes && (
                <div>
                  <h4 className="font-medium mb-2">Resolution Notes</h4>
                  <p className="text-gray-600">{selectedIssue.resolution_notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Issue Modal - Placeholder for now */}
      {showAddIssue && (
        <Dialog open={true} onOpenChange={() => setShowAddIssue(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report New Issue</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Issue reporting feature coming soon</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EventIssues; 