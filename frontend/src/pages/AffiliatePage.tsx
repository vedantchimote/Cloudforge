export default function AffiliatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Become an Affiliate</h1>
      <p className="text-xl text-gray-600 mb-12">
        Earn commissions by promoting CloudForge products
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Affiliate Program Benefits</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl font-bold text-[#FF9900] mb-2">10%</div>
            <h3 className="font-semibold text-gray-900 mb-2">Commission Rate</h3>
            <p className="text-gray-700 text-sm">
              Earn up to 10% commission on every sale you refer.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl font-bold text-[#FF9900] mb-2">30</div>
            <h3 className="font-semibold text-gray-900 mb-2">Day Cookie</h3>
            <p className="text-gray-700 text-sm">
              Earn credit for purchases made within 30 days of click.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl font-bold text-[#FF9900] mb-2">$0</div>
            <h3 className="font-semibold text-gray-900 mb-2">Joining Fee</h3>
            <p className="text-gray-700 text-sm">
              Free to join with no hidden costs or commitments.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Sign Up</h3>
                <p className="text-gray-700 text-sm">Create your free affiliate account and get approved instantly.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get Your Links</h3>
                <p className="text-gray-700 text-sm">Access unique tracking links for any product on CloudForge.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Promote Products</h3>
                <p className="text-gray-700 text-sm">Share links on your blog, social media, or website.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold text-sm">
                4
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Earn Commissions</h3>
                <p className="text-gray-700 text-sm">Get paid monthly for every qualifying purchase.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Who Can Join?</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Bloggers and content creators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Social media influencers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Website owners and publishers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Email marketers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Anyone with an audience interested in our products</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#FF9900] to-[#e88b00] p-8 rounded-lg text-white text-center">
        <h2 className="text-2xl font-semibold mb-4">Start Earning Today</h2>
        <p className="mb-6">Join our affiliate program and turn your audience into income.</p>
        <button className="px-8 py-3 bg-white text-[#FF9900] rounded-md font-semibold hover:bg-gray-100 transition-colors">
          Join Affiliate Program
        </button>
      </section>
    </div>
  );
}
