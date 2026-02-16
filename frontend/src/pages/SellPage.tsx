export default function SellPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Sell on CloudForge</h1>
      <p className="text-xl text-gray-600 mb-12">
        Reach millions of customers and grow your business
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Sell With Us?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">Large Customer Base</h3>
            <p className="text-gray-700 text-sm">
              Access millions of active shoppers looking for products like yours.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy Fulfillment</h3>
            <p className="text-gray-700 text-sm">
              Integrated shipping and logistics to streamline your operations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Competitive Fees</h3>
            <p className="text-gray-700 text-sm">
              Low commission rates with transparent pricing and no hidden costs.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-700 text-sm">
              Track sales, inventory, and customer insights in real-time.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Create Your Account</h3>
              <p className="text-gray-700 text-sm">Sign up and complete your seller profile with business details.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">List Your Products</h3>
              <p className="text-gray-700 text-sm">Add products with descriptions, images, and pricing.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Start Selling</h3>
              <p className="text-gray-700 text-sm">Receive orders and manage them through your seller dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#FF9900] to-[#e88b00] p-8 rounded-lg text-white">
        <h2 className="text-2xl font-semibold mb-4">Ready to Start Selling?</h2>
        <p className="mb-6">Join thousands of successful sellers on CloudForge today.</p>
        <button className="px-8 py-3 bg-white text-[#FF9900] rounded-md font-semibold hover:bg-gray-100 transition-colors">
          Register as Seller
        </button>
      </section>
    </div>
  );
}
