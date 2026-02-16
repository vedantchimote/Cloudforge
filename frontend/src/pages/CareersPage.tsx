export default function CareersPage() {
  const openings = [
    {
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build scalable microservices with Spring Boot and Kafka.'
    },
    {
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create beautiful user experiences with React and TypeScript.'
    },
    {
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Remote',
      type: 'Full-time',
      description: 'Manage Kubernetes clusters and CI/CD pipelines.'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Hybrid',
      type: 'Full-time',
      description: 'Drive product strategy and roadmap for our e-commerce platform.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Careers at CloudForge</h1>
      <p className="text-xl text-gray-600 mb-12">
        Join our team and help build the future of e-commerce
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Work With Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-gray-900 mb-2">Cutting-Edge Tech</h3>
            <p className="text-gray-700 text-sm">
              Work with modern technologies like Spring Boot, React, Kubernetes, and Kafka.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Remote First</h3>
            <p className="text-gray-700 text-sm">
              Work from anywhere with flexible hours and a global team.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">Growth Opportunities</h3>
            <p className="text-gray-700 text-sm">
              Continuous learning with conference budgets and mentorship programs.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Open Positions</h2>
        <div className="space-y-4">
          {openings.map((job, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{job.department}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">{job.location}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{job.type}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{job.description}</p>
              <button className="px-6 py-2 bg-[#FF9900] text-white rounded-md hover:bg-[#e88b00] transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Don't See Your Role?</h2>
        <p className="text-gray-700 mb-4">
          We're always looking for talented individuals. Send us your resume at careers@cloudforge.com
        </p>
      </section>
    </div>
  );
}
