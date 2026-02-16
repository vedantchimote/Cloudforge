export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About CloudForge</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">
            CloudForge is a modern e-commerce platform built with cutting-edge microservices architecture. 
            We're committed to providing a seamless shopping experience powered by cloud-native technologies.
          </p>
          <p className="text-gray-700 mb-4">
            Founded in 2026, CloudForge represents the future of online retail, combining scalability, 
            reliability, and user-centric design to deliver exceptional value to our customers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            To revolutionize online shopping by leveraging modern cloud technologies and microservices 
            architecture, ensuring fast, reliable, and secure transactions for customers worldwide.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Spring Boot Microservices</li>
                <li>• MongoDB & PostgreSQL</li>
                <li>• Apache Kafka</li>
                <li>• Redis Caching</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• React with TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Zustand State Management</li>
                <li>• React Query</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-700 text-sm">
                Continuously improving our platform with the latest technologies.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Reliability</h3>
              <p className="text-gray-700 text-sm">
                99.9% uptime with robust microservices architecture.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-700 text-sm">
                Enterprise-grade security with LDAP authentication.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
