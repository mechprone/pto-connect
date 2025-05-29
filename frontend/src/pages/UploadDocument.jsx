import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function UploadDocument() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file || !title) {
      setError('Title and file are required.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

    const fileExt = file.name.split('.').pop()
    const filePath = `documents/${orgId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    const { error: insertError } = await supabase
      .from('documents')
      .insert([{ title, file_path: filePath, org_id: orgId, uploaded_by: user.id }])

    if (insertError) {
      setError(insertError.message)
    } else {
      setMessage('Document uploaded successfully.')
      setError('')
      setTitle('')
      setFile(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Document</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border p-2"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}