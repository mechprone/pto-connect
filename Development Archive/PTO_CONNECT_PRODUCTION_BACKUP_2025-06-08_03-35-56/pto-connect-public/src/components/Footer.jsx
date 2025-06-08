export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 text-sm py-6 mt-12 border-t">
      <div className="max-w-7xl mx-auto px-6 text-center">
        © {new Date().getFullYear()} PTO Connect. All rights reserved.
      </div>
    </footer>
  )
}
