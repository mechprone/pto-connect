import { useRef } from 'react'
import EmailEditor from 'react-email-editor'

export default function EmailComposer() {
  const editorRef = useRef(null)

  const handleExport = () => {
    editorRef.current?.editor.exportHtml((data) => {
      console.log('HTML Output:', data.html)
      // Later: send this to backend API or preview modal
    })
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Email Designer</h1>
        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Export HTML
        </button>
      </div>

      <div className="border rounded shadow overflow-hidden h-[700px]">
        <EmailEditor ref={editorRef} />
      </div>
    </div>
  )
}
