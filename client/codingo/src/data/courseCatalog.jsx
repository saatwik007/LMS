function infoBlock(heading, content) {
  return { heading, content };
}

export const courseCatalog = {
  python: {
    id: "python",
    title: "Python",
    domain: "Coding",
    level: "Beginner",
    tagline: "The Language of Simplicity & Power",
    accentColor: "#3b82f6",
    accentLight: "#60a5fa",
    gradient: "from-blue-900 via-blue-800 to-cyan-900",
    cardGradient: "from-blue-500 to-cyan-400",
    icon: "python",
    enrolled: "1.9M+ learners",
    marketHotness: "Very High",
    salary: "$95k - $165k",
    hotnessScore: 94,
    summary: "Python is used from automation to AI and data systems, with beginner-friendly syntax and a huge package ecosystem.",
    info: [
      infoBlock("Origin & History", "Created by Guido van Rossum and first released in 1991, Python prioritized readability and quick development."),
      infoBlock("Core Strengths & Uses", "Python is dominant in AI, automation, data science, and backend APIs thanks to strong frameworks and libraries."),
      infoBlock("Career Outlook", "Python skills map to high-demand roles in data, ML, backend engineering, and cloud automation.")
    ]
  },
  java: {
    id: "java",
    title: "Java",
    domain: "Coding",
    level: "Intermediate",
    tagline: "Write Once, Run Anywhere",
    accentColor: "#ef4444",
    accentLight: "#f87171",
    gradient: "from-red-900 via-orange-900 to-gray-900",
    cardGradient: "from-red-500 to-orange-400",
    icon: "java",
    enrolled: "1.5M+ learners",
    marketHotness: "High",
    salary: "$105k - $180k",
    hotnessScore: 90,
    summary: "Java remains a backbone for enterprise systems, Android apps, and large distributed backends.",
    info: [
      infoBlock("Origin & History", "Launched by Sun Microsystems in 1995, Java popularized portable runtime execution through the JVM."),
      infoBlock("Core Strengths & Uses", "Java powers enterprise APIs, banking platforms, Android services, and mission-critical systems."),
      infoBlock("Career Outlook", "Strong demand for Java engineers in backend, fintech, telecom, and cloud-native modernization.")
    ]
  },
  javascript: {
    id: "javascript",
    title: "JavaScript",
    domain: "Coding",
    level: "Beginner",
    tagline: "The Language of the Web",
    accentColor: "#eab308",
    accentLight: "#facc15",
    gradient: "from-yellow-900 via-amber-900 to-gray-900",
    cardGradient: "from-yellow-400 to-amber-500",
    icon: "javascript",
    enrolled: "2.3M+ learners",
    marketHotness: "Very High",
    salary: "$95k - $170k",
    hotnessScore: 96,
    summary: "JavaScript powers modern frontend, full-stack web apps, and real-time product experiences.",
    info: [
      infoBlock("Origin & History", "Designed in 1995, JavaScript became the default scripting language of the browser."),
      infoBlock("Core Strengths & Uses", "With React and Node.js, JavaScript spans frontend, backend, and edge applications."),
      infoBlock("Career Outlook", "JavaScript is one of the strongest entry points for web and full-stack engineering roles.")
    ]
  },
  cpp: {
    id: "cpp",
    title: "C++",
    domain: "Coding",
    level: "Advanced",
    tagline: "Power. Performance. Precision.",
    accentColor: "#3b82f6",
    accentLight: "#93c5fd",
    gradient: "from-blue-900 via-indigo-900 to-gray-900",
    cardGradient: "from-blue-600 to-indigo-500",
    icon: "cpp",
    enrolled: "900k+ learners",
    marketHotness: "High",
    salary: "$120k - $220k",
    hotnessScore: 88,
    summary: "C++ is used where performance and system-level control are critical, from engines to infrastructure.",
    info: [
      infoBlock("Origin & History", "Developed by Bjarne Stroustrup, C++ evolved from C and became a core systems language."),
      infoBlock("Core Strengths & Uses", "C++ drives game engines, low-latency systems, compilers, robotics, and performance-heavy applications."),
      infoBlock("Career Outlook", "Advanced C++ engineers are highly paid in trading, gaming, systems, and embedded industries.")
    ]
  },
  claude: {
    id: "claude",
    title: "Claude API Engineering",
    domain: "AI",
    level: "Intermediate",
    tagline: "Build Reliable AI Assistants",
    accentColor: "#8b5cf6",
    accentLight: "#c4b5fd",
    gradient: "from-violet-900 via-purple-900 to-slate-900",
    cardGradient: "from-violet-500 to-purple-400",
    icon: "claude",
    enrolled: "420k+ learners",
    marketHotness: "Exploding",
    salary: "$125k - $210k",
    hotnessScore: 97,
    summary: "Learn prompt orchestration, tool-calling design, and production workflows for Claude-based apps.",
    info: [
      infoBlock("Origin & Context", "LLM-powered app engineering is now core to product and automation roadmaps."),
      infoBlock("Core Strengths & Uses", "This track covers prompt strategy, agent flows, evaluation, safety, and integration."),
      infoBlock("Career Outlook", "AI application engineers are rapidly becoming top-priority hires in startups and enterprises.")
    ]
  },
  aws: {
    id: "aws",
    title: "AWS Cloud Essentials",
    domain: "Cloud",
    level: "Beginner",
    tagline: "Deploy and Scale in the Cloud",
    accentColor: "#f59e0b",
    accentLight: "#fcd34d",
    gradient: "from-amber-900 via-orange-900 to-zinc-900",
    cardGradient: "from-amber-500 to-orange-400",
    icon: "aws",
    enrolled: "1.1M+ learners",
    marketHotness: "Very High",
    salary: "$110k - $185k",
    hotnessScore: 92,
    summary: "Master foundational AWS services including compute, storage, IAM, and deployment patterns.",
    info: [
      infoBlock("Origin & History", "AWS pioneered modern cloud infrastructure and remains a major enterprise platform."),
      infoBlock("Core Strengths & Uses", "Used for hosting, serverless apps, analytics pipelines, and resilient architectures."),
      infoBlock("Career Outlook", "Cloud engineers with AWS skills are highly in-demand across backend and DevOps roles.")
    ]
  },
  azure: {
    id: "azure",
    title: "Azure Fundamentals",
    domain: "Cloud",
    level: "Beginner",
    tagline: "Cloud for Enterprise Workloads",
    accentColor: "#0ea5e9",
    accentLight: "#7dd3fc",
    gradient: "from-cyan-900 via-sky-900 to-slate-900",
    cardGradient: "from-cyan-500 to-sky-400",
    icon: "azure",
    enrolled: "800k+ learners",
    marketHotness: "Very High",
    salary: "$108k - $182k",
    hotnessScore: 90,
    summary: "Understand Azure services for apps, data, identity, and secure cloud operations.",
    info: [
      infoBlock("Origin & Context", "Azure is heavily adopted in enterprise and Microsoft-centric ecosystems."),
      infoBlock("Core Strengths & Uses", "Ideal for .NET apps, hybrid cloud, analytics, and business-critical workloads."),
      infoBlock("Career Outlook", "Azure certifications map directly to cloud architect and platform engineering tracks.")
    ]
  },
  gcp: {
    id: "gcp",
    title: "GCP Foundations",
    domain: "Cloud",
    level: "Beginner",
    tagline: "Data and Cloud-native by Design",
    accentColor: "#2563eb",
    accentLight: "#93c5fd",
    gradient: "from-blue-900 via-sky-900 to-slate-900",
    cardGradient: "from-blue-500 to-sky-400",
    icon: "gcp",
    enrolled: "620k+ learners",
    marketHotness: "High",
    salary: "$112k - $188k",
    hotnessScore: 87,
    summary: "Build cloud-native systems with GCP services for compute, data, and analytics.",
    info: [
      infoBlock("Origin & Context", "GCP grew from Google's internal infrastructure and data platform heritage."),
      infoBlock("Core Strengths & Uses", "Known for Kubernetes, BigQuery, and high-scale analytics workflows."),
      infoBlock("Career Outlook", "GCP expertise is valuable for data engineering, ML infrastructure, and platform roles.")
    ]
  },
  ml: {
    id: "ml",
    title: "Machine Learning Basics",
    domain: "ML",
    level: "Intermediate",
    tagline: "Predict, Classify, Optimize",
    accentColor: "#0f766e",
    accentLight: "#5eead4",
    gradient: "from-teal-900 via-emerald-900 to-slate-900",
    cardGradient: "from-teal-500 to-emerald-400",
    icon: "ml",
    enrolled: "950k+ learners",
    marketHotness: "Very High",
    salary: "$120k - $205k",
    hotnessScore: 93,
    summary: "Learn ML workflows from data preparation to model evaluation and deployment basics.",
    info: [
      infoBlock("Origin & Context", "ML adoption accelerated across product recommendation, forecasting, and optimization."),
      infoBlock("Core Strengths & Uses", "Covers supervised learning, feature engineering, and model validation."),
      infoBlock("Career Outlook", "ML fluency unlocks roles in applied AI, analytics, and intelligent product teams.")
    ]
  },
  dl: {
    id: "dl",
    title: "Deep Learning with PyTorch",
    domain: "ML",
    level: "Advanced",
    tagline: "Neural Networks in Production",
    accentColor: "#4338ca",
    accentLight: "#a5b4fc",
    gradient: "from-indigo-900 via-violet-900 to-slate-900",
    cardGradient: "from-indigo-500 to-violet-400",
    icon: "dl",
    enrolled: "540k+ learners",
    marketHotness: "Exploding",
    salary: "$135k - $230k",
    hotnessScore: 95,
    summary: "Train, tune, and deploy deep learning models with practical PyTorch workflows.",
    info: [
      infoBlock("Origin & Context", "Deep learning powers modern computer vision, NLP, and multimodal systems."),
      infoBlock("Core Strengths & Uses", "Focuses on neural architecture, optimization, and model serving."),
      infoBlock("Career Outlook", "Deep learning engineers are in high demand across AI-first product teams.")
    ]
  },
  nlp: {
    id: "nlp",
    title: "NLP and LLM Apps",
    domain: "AI",
    level: "Intermediate",
    tagline: "Language Intelligence at Scale",
    accentColor: "#db2777",
    accentLight: "#f9a8d4",
    gradient: "from-pink-900 via-fuchsia-900 to-slate-900",
    cardGradient: "from-pink-500 to-fuchsia-400",
    icon: "nlp",
    enrolled: "690k+ learners",
    marketHotness: "Exploding",
    salary: "$130k - $220k",
    hotnessScore: 96,
    summary: "Build text and LLM applications using embeddings, retrieval, and evaluation pipelines.",
    info: [
      infoBlock("Origin & Context", "NLP evolved from classic text mining to transformer and LLM workflows."),
      infoBlock("Core Strengths & Uses", "Includes vector search, retrieval pipelines, and response quality evaluation."),
      infoBlock("Career Outlook", "NLP/LLM engineering is now a top-tier specialization in AI product development.")
    ]
  },
  data: {
    id: "data",
    title: "Data Analysis with Pandas",
    domain: "Data",
    level: "Beginner",
    tagline: "Clean, Explore, Explain",
    accentColor: "#0f766e",
    accentLight: "#5eead4",
    gradient: "from-teal-900 via-cyan-900 to-slate-900",
    cardGradient: "from-teal-500 to-cyan-400",
    icon: "data",
    enrolled: "1.2M+ learners",
    marketHotness: "Very High",
    salary: "$90k - $155k",
    hotnessScore: 91,
    summary: "Learn practical data wrangling, exploration, and storytelling with Python and Pandas.",
    info: [
      infoBlock("Origin & Context", "Data-driven decision making is now central to product and business operations."),
      infoBlock("Core Strengths & Uses", "Covers cleaning, joins, aggregations, visuals, and reporting."),
      infoBlock("Career Outlook", "Data analysis skills support roles in analytics, product, and BI engineering.")
    ]
  },
  sql: {
    id: "sql",
    title: "SQL for Analytics",
    domain: "Data",
    level: "Beginner",
    tagline: "Query the Business",
    accentColor: "#1d4ed8",
    accentLight: "#93c5fd",
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
    cardGradient: "from-blue-500 to-indigo-400",
    icon: "sql",
    enrolled: "1.6M+ learners",
    marketHotness: "Very High",
    salary: "$92k - $160k",
    hotnessScore: 93,
    summary: "Master SQL querying, joins, windows, and dashboards for analytics workflows.",
    info: [
      infoBlock("Origin & Context", "SQL remains the universal language for relational data and BI platforms."),
      infoBlock("Core Strengths & Uses", "Teaches analytical querying for product metrics and business insights."),
      infoBlock("Career Outlook", "SQL is foundational for analysts, engineers, and product teams.")
    ]
  },
  spark: {
    id: "spark",
    title: "Big Data with Spark",
    domain: "Data",
    level: "Advanced",
    tagline: "Distributed Data at Scale",
    accentColor: "#b45309",
    accentLight: "#fdba74",
    gradient: "from-orange-900 via-amber-900 to-slate-900",
    cardGradient: "from-orange-500 to-amber-400",
    icon: "spark",
    enrolled: "430k+ learners",
    marketHotness: "High",
    salary: "$125k - $210k",
    hotnessScore: 86,
    summary: "Process large datasets with Spark for ETL, analytics, and scalable data pipelines.",
    info: [
      infoBlock("Origin & Context", "Spark emerged to accelerate distributed processing beyond classic MapReduce."),
      infoBlock("Core Strengths & Uses", "Covers distributed transformations and production ETL architecture."),
      infoBlock("Career Outlook", "Spark skills are sought in data platform and lakehouse engineering teams.")
    ]
  },
  docker: {
    id: "docker",
    title: "Docker and Containers",
    domain: "DevOps",
    level: "Intermediate",
    tagline: "Ship Anywhere Consistently",
    accentColor: "#0284c7",
    accentLight: "#7dd3fc",
    gradient: "from-sky-900 via-cyan-900 to-slate-900",
    cardGradient: "from-sky-500 to-cyan-400",
    icon: "docker",
    enrolled: "980k+ learners",
    marketHotness: "Very High",
    salary: "$110k - $190k",
    hotnessScore: 92,
    summary: "Containerize applications and streamline delivery from development to production.",
    info: [
      infoBlock("Origin & Context", "Containers transformed software delivery with consistent runtime packaging."),
      infoBlock("Core Strengths & Uses", "Learn image creation, networking, volumes, and container best practices."),
      infoBlock("Career Outlook", "Docker knowledge is core for backend, DevOps, and platform engineering roles.")
    ]
  },
  k8s: {
    id: "k8s",
    title: "Kubernetes in Practice",
    domain: "DevOps",
    level: "Advanced",
    tagline: "Operate Cloud-native Systems",
    accentColor: "#4338ca",
    accentLight: "#a5b4fc",
    gradient: "from-indigo-900 via-blue-900 to-slate-900",
    cardGradient: "from-indigo-500 to-blue-400",
    icon: "k8s",
    enrolled: "610k+ learners",
    marketHotness: "Very High",
    salary: "$130k - $220k",
    hotnessScore: 94,
    summary: "Run scalable and resilient workloads with Kubernetes orchestration patterns.",
    info: [
      infoBlock("Origin & Context", "Kubernetes became the standard orchestration layer for containerized systems."),
      infoBlock("Core Strengths & Uses", "Covers deployments, services, autoscaling, and production operations."),
      infoBlock("Career Outlook", "Kubernetes expertise is highly paid across SRE and platform engineering tracks.")
    ]
  },
  security: {
    id: "security",
    title: "App Security Essentials",
    domain: "Security",
    level: "Intermediate",
    tagline: "Build Secure by Default",
    accentColor: "#b91c1c",
    accentLight: "#fca5a5",
    gradient: "from-red-900 via-rose-900 to-slate-900",
    cardGradient: "from-red-500 to-rose-400",
    icon: "security",
    enrolled: "570k+ learners",
    marketHotness: "Very High",
    salary: "$125k - $215k",
    hotnessScore: 93,
    summary: "Learn practical secure coding, auth hardening, and threat-aware architecture.",
    info: [
      infoBlock("Origin & Context", "Security is now a first-class requirement in modern software delivery."),
      infoBlock("Core Strengths & Uses", "Covers OWASP risks, authentication hardening, and secure review workflows."),
      infoBlock("Career Outlook", "Security-aware engineers are increasingly preferred in every product team.")
    ]
  },
  dsa: {
    id: "dsa",
    title: "DSA Interview Prep",
    domain: "Coding",
    level: "Intermediate",
    tagline: "Think in Algorithms",
    accentColor: "#374151",
    accentLight: "#9ca3af",
    gradient: "from-gray-900 via-slate-900 to-zinc-900",
    cardGradient: "from-gray-600 to-slate-500",
    icon: "dsa",
    enrolled: "1.4M+ learners",
    marketHotness: "High",
    salary: "$100k - $185k",
    hotnessScore: 89,
    summary: "Sharpen problem-solving with core data structures and algorithm patterns.",
    info: [
      infoBlock("Origin & Context", "DSA remains central in technical screening and engineering fundamentals."),
      infoBlock("Core Strengths & Uses", "Covers arrays, trees, graphs, dynamic programming, and complexity analysis."),
      infoBlock("Career Outlook", "Strong DSA skills improve interview outcomes and engineering confidence.")
    ]
  }
};

export const courseList = Object.values(courseCatalog);
