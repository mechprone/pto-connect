import React from 'react';
import { useEffect, useRef, useState } from 'react'
import EmailEditor from 'react-email-editor'
import { supabase } from '@/utils/supabaseClient'
import axios from 'axios'

const API_BASE_URL = 'https://api.ptoconnect.com';

export default function EmailComposer() {
  const editorRef = useRef(null)
  const [status, setStatus] = useState('Loading...')
  const [draftId, setDraftId] = useState(null)
  const [orgId, setOrgId] = useState(null)
  const [token, setToken] = useState(null)

  // Load current session and existing draft
  useEffect(() => {
    async function init() {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setStatus('Error: Not authenticated.')
        return
      }

      const orgId = session.user.user_metadata?.org_id || session.user.app_metadata?.org_id
      setOrgId(orgId)
      setToken(session.access_token)

      try {
        const res = await axios.get(`${API_BASE_URL}/api/communications/email-drafts`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })

        const existing = res.data.find(d => d.org_id === orgId)
        if (existing) {
          setDraftId(existing.id)
          setStatus('Loaded existing draft')
          editorRef.current?.editor.loadDesign(JSON.parse(existing.design_json))
        } else {
          setStatus('No draft found')
        }
      } catch (err) {
        console.error(err)
        setStatus('Error loading draft')
      }
    }

    init()
  }, [])

  // Save draft manually
  const handleSave = () => {
    if (!token || !orgId) return

    editorRef.current?.editor.saveDesign(async (design) => {
      const payload = {
        org_id: orgId,
        design_json: JSON.stringify(design),
        last_saved_at: new Date().toISOString()
      }

      try {
        if (draftId) {
          await axios.put(`${API_BASE_URL}/api/communications/email-drafts/${draftId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setStatus('Draft updated')
        } else {
          const res = await axios.post(`${API_BASE_URL}/api/communications/email-drafts`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setDraftId(res.data.id)
          setStatus('Draft saved')
        }
      } catch (err) {
        console.error(err)
        setStatus('Save failed')
      }
    })
  }

  const handleExport = () => {
    editorRef.current?.editor.exportHtml((data) => {
      console.log('Exported HTML:', data.html)
      setStatus('Exported to console')
    })
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Email Designer</h1>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Save Draft
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Export HTML
          </button>
        </div>
      </div>

      <div className="border rounded shadow overflow-hidden h-[700px]">
        <EmailEditor ref={editorRef} />
      </div>
    </div>
  )
}
