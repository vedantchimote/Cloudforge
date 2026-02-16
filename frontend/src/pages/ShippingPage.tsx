export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Rates & Policies</h1>
      <p className="text-xl text-gray-600 mb-12">
        Everything you need to know about CloudForge shipping
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Options</h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900">Standard Shipping</h3>
              <span className="text-[#FF9900] font-semibold">$5.99</span>
            </div>
            <p className="text-gray-700 mb-2">Delivery in 5-7 business days</p>
            <p className="text-sm text-gray-600">Available for all orders</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900">Express Shipping</h3>
              <span className="text-[#FF9900] font-semibold">$12.99</span>
            </div>
            <p className="text-gray-700 mb-2">Delivery in 2-3 business days</p>
            <p className="text-sm text-gray-600">Expedited processing and delivery</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-[#FF9900]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">FREE Shipping</h3>
                <span className="inline-block px-2 py-1 bg-[#FF9900] text-white text-xs rounded mt-1">
                  BEST VALUE
                </span>
              </div>
              <span className="text-[#FF9900] font-semibold">$0.00</span>
            </div>
            <p className="text-gray-700 mb-2">Delivery in 5-7 business days</p>
            <p className="text-sm text-gray-600">On orders over $50</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900">Next-Day Delivery</h3>
              <span className="text-[#FF9900] font-semibold">$24.99</span>
            </div>
            <p className="text-gray-700 mb-2">Delivery next business day</p>
            <p className="text-sm text-gray-600">Order by 2 PM for next-day delivery</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Policies</h2>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Processing Time</h3>
              <p className="text-gray-700 text-sm">
                Orders are typically processed within 1-2 business days. You'll receive a confirmation email 
                with tracking information once your order ships.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Areas</h3>
              <p className="text-gray-700 text-sm">
                We currently ship to all 50 US states. International shipping is not available at this time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Tracking</h3>
              <p className="text-gray-700 text-sm">
                Track your order anytime using the tracking number provided in your shipping confirmation email. 
                You can also view order status in your account dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Restrictions</h3>
              <p className="text-gray-700 text-sm">
                Some items may have shipping restrictions based on size, weight, or destination. 
                These restrictions will be noted on the product page.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Holidays & Weekends</h3>
              <p className="text-gray-700 text-sm">
                Orders placed on weekends or holidays will be processed on the next business day. 
                Delivery times may be extended during peak seasons.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Can I change my shipping address after placing an order?</h3>
            <p className="text-gray-700 text-sm">
              Contact customer service immediately if you need to change your address. We can update it if the order 
              hasn't been shipped yet.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">What if my package is lost or damaged?</h3>
            <p className="text-gray-700 text-sm">
              Contact us within 48 hours of delivery if your package is damaged. For lost packages, we'll work with 
              the carrier to locate it or send a replacement.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Do you offer expedited international shipping?</h3>
            <p className="text-gray-700 text-sm">
              International shipping is not currently available, but we're working on expanding our shipping options.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 p-8 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h2>
        <p className="text-gray-700 mb-4">
          Have questions about shipping? Our customer service team is here to help.
        </p>
        <button className="px-6 py-2 bg-[#FF9900] text-white rounded-md hover:bg-[#e88b00] transition-colors">
          Contact Support
        </button>
      </section>
    </div>
  );
}
