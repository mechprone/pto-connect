import React from 'react';
import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import axios from 'axios'

export default function UploadDocument() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return setError('Title and file are required.')

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return setError('User not authenticated.')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', file)

    try {
      await axios.post('/api/documents', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setMessage('Document uploaded successfully.')
      setTitle('')
      setFile(null)
    } catch (err) {
      setError('Upload failed. Check console.')
      console.error(err)
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
