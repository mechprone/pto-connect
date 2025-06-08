export default function HomePage() {
  return (
    <section className="bg-white min-h-screen text-center px-6 py-20">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
        PTO Connect simplifies everything your PTO does
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-10">
        From budgeting to event planning to communicating with parents — we bring it all into one easy-to-use platform.
      </p>

      <div className="flex justify-center gap-4 mb-16 flex-wrap">
        <a href="/create" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          Start Free Trial
        </a>
        <a href="/pricing" className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300">
          View Pricing
        </a>
      </div>

      <img
        src="/hero-placeholder.svg"
        alt="Illustration of PTO Connect in action"
        className="mx-auto max-w-xl w-full"
      />
    </section>
  )
}
