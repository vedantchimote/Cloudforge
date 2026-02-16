export default function AdvertisePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Advertise Your Products</h1>
      <p className="text-xl text-gray-600 mb-12">
        Boost visibility and drive sales with CloudForge Advertising
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Advertising Solutions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-transparent hover:border-[#FF9900] transition-colors">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Sponsored Products</h3>
            <p className="text-gray-700 mb-4">
              Promote individual products in search results and product pages to increase visibility.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li>• Pay-per-click pricing</li>
              <li>• Appear in search results</li>
              <li>• Target specific keywords</li>
              <li>• Detailed performance metrics</li>
            </ul>
            <button className="w-full px-6 py-2 bg-[#FF9900] text-white rounded-md hover:bg-[#e88b00] transition-colors">
              Learn More
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-transparent hover:border-[#FF9900] transition-colors">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Display Ads</h3>
            <p className="text-gray-700 mb-4">
              Showcase your brand with banner ads on high-traffic pages across CloudForge.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li>• Premium ad placements</li>
              <li>• Brand awareness campaigns</li>
              <li>• Custom creative support</li>
              <li>• Impression-based pricing</li>
            </ul>
            <button className="w-full px-6 py-2 bg-[#FF9900] text-white rounded-md hover:bg-[#e88b00] transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Advertise on CloudForge?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Targeted Reach</h3>
            <p className="text-gray-700 text-sm">
              Reach customers actively searching for products like yours.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">Measurable Results</h3>
            <p className="text-gray-700 text-sm">
              Track impressions, clicks, and conversions in real-time.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy Management</h3>
            <p className="text-gray-700 text-sm">
              Self-service platform with intuitive campaign management.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Getting Started</h2>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Set Your Budget</h3>
                <p className="text-gray-700 text-sm">Choose a daily or campaign budget that works for you.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Your Campaign</h3>
                <p className="text-gray-700 text-sm">Select products, keywords, and targeting options.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Launch and Optimize</h3>
                <p className="text-gray-700 text-sm">Monitor performance and adjust bids to maximize ROI.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#FF9900] to-[#e88b00] p-8 rounded-lg text-white text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Grow Your Business?</h2>
        <p className="mb-6">Start advertising on CloudForge and reach millions of shoppers.</p>
        <button className="px-8 py-3 bg-white text-[#FF9900] rounded-md font-semibold hover:bg-gray-100 transition-colors">
          Create Campaign
        </button>
      </section>
    </div>
  );
}
