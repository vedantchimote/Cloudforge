export default function PressPage() {
  const releases = [
    {
      date: 'February 10, 2026',
      title: 'CloudForge Launches New Microservices Architecture',
      excerpt: 'CloudForge announces the launch of its new cloud-native platform built on Spring Boot microservices, offering enhanced scalability and reliability.'
    },
    {
      date: 'January 15, 2026',
      title: 'CloudForge Achieves 99.9% Uptime Milestone',
      excerpt: 'Platform demonstrates exceptional reliability with Kubernetes orchestration and Redis caching, serving thousands of transactions daily.'
    },
    {
      date: 'December 20, 2025',
      title: 'CloudForge Integrates Apache Kafka for Real-Time Events',
      excerpt: 'New event-driven architecture enables real-time order processing and notifications, improving customer experience significantly.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Press Releases</h1>
      <p className="text-xl text-gray-600 mb-12">
        Latest news and announcements from CloudForge
      </p>

      <div className="space-y-8">
        {releases.map((release, index) => (
          <article key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <time className="text-sm text-gray-500">{release.date}</time>
            <h2 className="text-2xl font-semibold text-gray-900 mt-2 mb-3">{release.title}</h2>
            <p className="text-gray-700 mb-4">{release.excerpt}</p>
            <button className="text-[#FF9900] hover:text-[#e88b00] font-medium">
              Read More →
            </button>
          </article>
        ))}
      </div>

      <section className="mt-12 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Media Contact</h2>
        <p className="text-gray-700">
          For press inquiries, please contact: <a href="mailto:press@cloudforge.com" className="text-[#FF9900] hover:underline">press@cloudforge.com</a>
        </p>
      </section>
    </div>
  );
}
