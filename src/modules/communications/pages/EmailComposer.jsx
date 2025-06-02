import { useRef, useState } from 'react'
import EmailEditor from 'react-email-editor'
import { supabase } from '@/utils/supabaseClient'

export default function EmailComposer() {
  const editorRef = useRef(null)
  const [subject, setSubject] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleExport = (callback) => {
    editorRef.current?.editor.exportHtml((data) => {
      const { design, html } = data
      if (callback) {
        callback({ design, html })
      } else {
        console.log('HTML Output:', html)
      }
    })
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    const orgId = user?.user_metadata?.org_id

    if (!user) {
      setStatusMessage('You must be logged in.')
      setIsSaving(false)
      return
    }

    handleExport(async ({ design, html }) => {
      const { error } = await supabase.from('email_drafts').insert({
        user_id: user.id,
        org_id: orgId,
        subject,
        html,
        design,
        status: 'draft'
      })

      if (error) {
        console.error(error)
        setStatusMessage('Error saving draft.')
      } else {
        setStatusMessage('Draft saved!')
      }

      setTimeout(() => setStatusMessage(''), 3000)
      setIsSaving(false)
    })
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Email Designer</h1>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleExport()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Export HTML
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Email subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      {statusMessage && (
        <div className="mb-4 text-sm text-blue-600">{statusMessage}</div>
      )}

      <div className="border rounded shadow overflow-hidden h-[700px]">
        <EmailEditor ref={editorRef} />
      </div>
    </div>
  )
}
