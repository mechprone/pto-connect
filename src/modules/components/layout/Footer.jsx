import React from 'react';
export default function Footer() {
  return (
    <footer className="text-xs text-gray-500 text-center py-4 border-t bg-white">
      PTO Connect © {new Date().getFullYear()} — Need help? Visit our support page.
    </footer>
  )
}