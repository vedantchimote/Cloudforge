import { Search, Package, CreditCard, Truck, RefreshCw, User, Mail, Phone } from 'lucide-react';

export default function HelpPage() {
  const topics = [
    { icon: Package, title: 'Orders & Tracking', description: 'Track orders, view history, and manage purchases' },
    { icon: CreditCard, title: 'Payment & Billing', description: 'Payment methods, invoices, and billing questions' },
    { icon: Truck, title: 'Shipping & Delivery', description: 'Shipping options, rates, and delivery information' },
    { icon: RefreshCw, title: 'Returns & Refunds', description: 'Return policy, refund process, and replacements' },
    { icon: User, title: 'Account Settings', description: 'Manage your profile, password, and preferences' },
    { icon: Search, title: 'Product Information', description: 'Product details, availability, and specifications' }
  ];

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'Go to Your Orders in your account dashboard. Click on the order you want to track to view detailed tracking information and estimated delivery date.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Next-day delivery is available for orders placed before 2 PM.'
    },
    {
      question: 'What is your return policy?',
      answer: 'Most items can be returned within 30 days of delivery for a full refund. Items must be unused and in original packaging. We provide free return shipping labels.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a link to reset your password.'
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within 1 hour of placing it. Go to Your Orders and click "Cancel Order". After 1 hour, the order may have already been processed.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How Can We Help You?</h1>
        <p className="text-xl text-gray-600 mb-8">
          Find answers to your questions and get support
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse Help Topics</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <Icon className="text-[#FF9900] mb-3" size={32} />
                <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                <p className="text-gray-700 text-sm">{topic.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-700 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Us</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Mail className="text-[#FF9900] mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-700 text-sm mb-3">
              Get help via email
            </p>
            <a href="mailto:support@cloudforge.com" className="text-[#FF9900] hover:text-[#e88b00] text-sm font-medium">
              support@cloudforge.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Phone className="text-[#FF9900] mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-700 text-sm mb-3">
              Mon-Fri, 9 AM - 6 PM EST
            </p>
            <a href="tel:1-800-CLOUDFORGE" className="text-[#FF9900] hover:text-[#e88b00] text-sm font-medium">
              1-800-CLOUDFORGE
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Mail className="text-[#FF9900] mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-700 text-sm mb-3">
              Chat with our team
            </p>
            <button className="text-[#FF9900] hover:text-[#e88b00] text-sm font-medium">
              Start Chat
            </button>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#FF9900] to-[#e88b00] p-8 rounded-lg text-white text-center">
        <h2 className="text-2xl font-semibold mb-3">Still Need Help?</h2>
        <p className="mb-6">
          Our customer service team is here to assist you with any questions or concerns.
        </p>
        <button className="px-8 py-3 bg-white text-[#FF9900] rounded-md font-semibold hover:bg-gray-100 transition-colors">
          Contact Support
        </button>
      </section>
    </div>
  );
}
