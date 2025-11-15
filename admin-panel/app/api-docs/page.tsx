'use client';

export default function APIDocsPage() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  const endpoints = [
    {
      category: 'Courses',
      routes: [
        { method: 'GET', path: '/api/courses', description: 'Get all courses' },
        { method: 'GET', path: '/api/courses/:id', description: 'Get single course' },
        { method: 'POST', path: '/api/courses', description: 'Create course' },
        { method: 'PUT', path: '/api/courses/:id', description: 'Update course' },
        { method: 'DELETE', path: '/api/courses/:id', description: 'Delete course' },
      ],
    },
    {
      category: 'Lessons',
      routes: [
        { method: 'GET', path: '/api/lessons?courseId=xxx', description: 'Get lessons (with pagination)' },
        { method: 'GET', path: '/api/lessons/:id', description: 'Get single lesson' },
        { method: 'POST', path: '/api/lessons', description: 'Create lesson' },
        { method: 'PUT', path: '/api/lessons/:id', description: 'Update lesson' },
        { method: 'DELETE', path: '/api/lessons/:id', description: 'Delete lesson' },
      ],
    },
    {
      category: 'Challenges',
      routes: [
        { method: 'GET', path: '/api/challenges', description: 'Get all challenges' },
        { method: 'GET', path: '/api/challenges/:id', description: 'Get single challenge' },
        { method: 'POST', path: '/api/challenges', description: 'Create challenge' },
        { method: 'PUT', path: '/api/challenges/:id', description: 'Update challenge' },
        { method: 'DELETE', path: '/api/challenges/:id', description: 'Delete challenge' },
      ],
    },
    {
      category: 'Prompts',
      routes: [
        { method: 'GET', path: '/api/prompts', description: 'Get all prompts' },
        { method: 'GET', path: '/api/prompts?tool=ChatGPT', description: 'Get prompts by tool' },
        { method: 'GET', path: '/api/prompts?category=Business', description: 'Get prompts by category' },
        { method: 'GET', path: '/api/prompts/:id', description: 'Get single prompt' },
        { method: 'POST', path: '/api/prompts', description: 'Create prompt' },
        { method: 'PUT', path: '/api/prompts/:id', description: 'Update prompt' },
        { method: 'DELETE', path: '/api/prompts/:id', description: 'Delete prompt' },
      ],
    },
    {
      category: 'AI Mastery Paths',
      routes: [
        { method: 'GET', path: '/api/aiCourses', description: 'Get all AI courses' },
        { method: 'GET', path: '/api/aiCourses/:id', description: 'Get single AI course' },
        { method: 'POST', path: '/api/aiCourses', description: 'Create AI course' },
        { method: 'PUT', path: '/api/aiCourses/:id', description: 'Update AI course' },
        { method: 'DELETE', path: '/api/aiCourses/:id', description: 'Delete AI course' },
      ],
    },
    {
      category: 'Users',
      routes: [
        { method: 'GET', path: '/api/users', description: 'Get all users' },
        { method: 'GET', path: '/api/users/:id', description: 'Get single user' },
        { method: 'POST', path: '/api/users', description: 'Create user' },
        { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
      ],
    },
    {
      category: 'Certificates',
      routes: [
        { method: 'GET', path: '/api/certificates?userId=xxx', description: 'Get user certificates' },
        { method: 'POST', path: '/api/certificates', description: 'Issue certificate' },
      ],
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
          <p className="text-gray-600 mb-2">
            <strong>Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{baseUrl}</code>
          </p>
          <p className="text-gray-600">
            All APIs return JSON format: <code className="bg-gray-100 px-2 py-1 rounded">{"{ success: true, data: {...} }"}</code>
          </p>
        </div>

        {endpoints.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
            <div className="space-y-3">
              {category.routes.map((route, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <span
                    className={`px-3 py-1 rounded font-semibold text-sm ${getMethodColor(route.method)}`}
                  >
                    {route.method}
                  </span>
                  <code className="flex-1 text-sm font-mono text-gray-800">
                    {baseUrl}{route.path}
                  </code>
                  <span className="text-sm text-gray-600">{route.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📮 Testing with Postman</h3>
          <p className="text-blue-800 mb-2">
            1. Open Postman
          </p>
          <p className="text-blue-800 mb-2">
            2. Set method (GET, POST, PUT, DELETE)
          </p>
          <p className="text-blue-800 mb-2">
            3. Enter URL: <code className="bg-white px-2 py-1 rounded">{baseUrl}/api/courses</code>
          </p>
          <p className="text-blue-800">
            4. For POST/PUT: Add JSON body in Body → raw → JSON
          </p>
        </div>
      </div>
    </div>
  );
}

