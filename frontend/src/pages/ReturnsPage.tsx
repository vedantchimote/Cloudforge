export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Replacements</h1>
      <p className="text-xl text-gray-600 mb-12">
        Easy returns and hassle-free replacements
      </p>

      <section className="mb-12">
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">30-Day Return Policy</h3>
          <p className="text-gray-700">
            Most items can be returned within 30 days of delivery for a full refund. Items must be in original 
            condition with all packaging and accessories.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">How to Return an Item</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Start Your Return</h3>
              <p className="text-gray-700 text-sm mb-2">
                Go to Your Orders and select the item you want to return. Click "Return or Replace Items" 
                and select your reason for return.
              </p>
              <button className="text-[#FF9900] hover:text-[#e88b00] text-sm font-medium">
                Go to Your Orders →
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Print Return Label</h3>
              <p className="text-gray-700 text-sm">
                We'll email you a prepaid return shipping label. Print it and attach it to your package. 
                No need to pay for return shipping!
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Ship Your Return</h3>
              <p className="text-gray-700 text-sm">
                Drop off your package at any authorized shipping location. You'll receive a tracking number 
                to monitor your return.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#FF9900] text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Get Your Refund</h3>
              <p className="text-gray-700 text-sm">
                Once we receive and process your return, we'll issue a refund to your original payment method 
                within 5-7 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Return Policy Details</h2>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Eligible Items</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Items must be unused and in original condition</li>
                <li>• Original packaging and accessories must be included</li>
                <li>• Return within 30 days of delivery</li>
                <li>• Proof of purchase required</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Non-Returnable Items</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Opened software or digital products</li>
                <li>• Personal care items (for hygiene reasons)</li>
                <li>• Custom or personalized items</li>
                <li>• Gift cards</li>
                <li>• Final sale items</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Refund Processing</h3>
              <p className="text-gray-700 text-sm">
                Refunds are processed within 5-7 business days after we receive your return. The refund will 
                be issued to your original payment method. Please allow additional time for your bank to 
                process the refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Replacements</h2>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <p className="text-gray-700 mb-4">
            If you received a defective or damaged item, we'll send you a replacement at no additional cost.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Defective Items</h3>
              <p className="text-gray-700 text-sm">
                Contact us within 30 days with photos of the defect. We'll send a replacement immediately 
                and provide a prepaid label to return the defective item.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Wrong Item Received</h3>
              <p className="text-gray-700 text-sm">
                If you received the wrong item, contact us right away. We'll send the correct item and 
                arrange pickup of the wrong item at no cost to you.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Damaged in Shipping</h3>
              <p className="text-gray-700 text-sm">
                Report shipping damage within 48 hours of delivery with photos. We'll send a replacement 
                and file a claim with the carrier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Do I have to pay for return shipping?</h3>
            <p className="text-gray-700 text-sm">
              No! We provide free prepaid return labels for all eligible returns.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Can I exchange an item for a different size or color?</h3>
            <p className="text-gray-700 text-sm">
              We don't offer direct exchanges. Please return the original item for a refund and place a new 
              order for the item you want.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">What if I lost my receipt?</h3>
            <p className="text-gray-700 text-sm">
              No problem! We can look up your order using your email address or order number.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Can I return a gift?</h3>
            <p className="text-gray-700 text-sm">
              Yes! Gift recipients can return items for store credit. The original purchaser can return for 
              a refund to their payment method.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 p-8 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Need Help with a Return?</h2>
        <p className="text-gray-700 mb-4">
          Our customer service team is ready to assist you with any return or replacement questions.
        </p>
        <button className="px-6 py-2 bg-[#FF9900] text-white rounded-md hover:bg-[#e88b00] transition-colors">
          Contact Support
        </button>
      </section>
    </div>
  );
}
