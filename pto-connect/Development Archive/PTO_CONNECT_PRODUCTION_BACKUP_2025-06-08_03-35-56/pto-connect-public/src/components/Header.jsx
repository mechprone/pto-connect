export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">
          PTO Connect
        </a>
        <nav className="space-x-6">
          <a href="/pricing" className="text-gray-700 hover:text-blue-600">
            Pricing
          </a>
          <a href="/create" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Start Free Trial
          </a>
        </nav>
      </div>
    </header>
  )
}
