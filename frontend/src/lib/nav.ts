export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "grid",
    description: "Overview of your workspaces and active projects",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: "folder",
    description: "Manage projects, sprints, and tasks",
  },
  {
    label: "API Vault",
    href: "/api-vault",
    icon: "warehouse",
    description: "Discover and test free APIs via Apivault",
  },
  {
    label: "API Playground",
    href: "/api-playground",
    icon: "code",
    description: "Explore and experiment with integrated APIs",
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: "plug",
    description: "Connect external services and webhooks",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "bar-chart-2",
    description: "Productivity and usage metrics",
  },
];

export const apiVaultCategories = [
  { label: "Development", href: "/api-vault/development", count: 125 },
  { label: "Calendar", href: "/api-vault/calendar", count: 42 },
  { label: "Weather", href: "/api-vault/weather", count: 38 },
  { label: "Business", href: "/api-vault/business", count: 33 },
  { label: "Documents & Productivity", href: "/api-vault/productivity", count: 28 },
  { label: "Finance", href: "/api-vault/finance", count: 25 },
  { label: "News", href: "/api-vault/news", count: 22 },
  { label: "Email", href: "/api-vault/email", count: 20 },
  { label: "Cryptocurrency", href: "/api-vault/cryptocurrency", count: 18 },
  { label: "Events", href: "/api-vault/events", count: 16 },
  { label: "Text Analysis", href: "/api-vault/text-analysis", count: 14 },
  { label: "Cloud Storage", href: "/api-vault/cloud-storage", count: 12 },
];

export interface ApiIntegration {
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  auth: string;
  category: string;
  endpoints: { method: string; path: string; description: string }[];
  cors: boolean;
  https: boolean;
  trending?: boolean;
  note?: string;
}

export const integratedApis: ApiIntegration[] = [
  {
    name: "JSONPlaceholder",
    slug: "jsonplaceholder",
    description: "Free fake REST API for prototyping and testing task/project data flows",
    baseUrl: "https://jsonplaceholder.typicode.com",
    auth: "None",
    category: "Development",
    endpoints: [
      { method: "GET", path: "/posts", description: "List mock posts" },
      { method: "GET", path: "/posts/1", description: "Get a single post" },
      { method: "GET", path: "/comments", description: "List mock comments" },
      { method: "GET", path: "/users", description: "List mock users" },
      { method: "GET", path: "/todos", description: "List mock todos (great for task prototyping)" },
      { method: "POST", path: "/posts", description: "Create a mock post" },
    ],
    cors: true,
    https: true,
    trending: true,
  },
  {
    name: "ZenQuotes",
    slug: "zenquotes",
    description: "Inspirational quotes API for productivity motivation and daily standups",
    baseUrl: "https://zenquotes.io/api/random",
    auth: "API Key (free tier)",
    category: "Development",
    endpoints: [
      { method: "GET", path: "/api/random", description: "Get a random inspirational quote" },
    ],
    cors: true,
    https: true,
  },
  {
    name: "Bored API",
    slug: "bored",
    description: "Suggest random activities for team breaks and wellness prompts",
    baseUrl: "https://www.boredapi.com/api/activity",
    auth: "None",
    category: "Entertainment",
    endpoints: [
      { method: "GET", path: "/api/activity", description: "Get a random activity suggestion" },
      { method: "GET", path: "/api/activity?participants=2", description: "Activity for a group" },
      { method: "GET", path: "/api/activity?price=0.0", description: "Free activities only" },
    ],
    cors: true,
    https: true,
  },
  {
    name: "wttr.in",
    slug: "wttr",
    description: "Weather API with no key required — weather widgets and context for remote teams",
    baseUrl: "https://wttr.in",
    auth: "None",
    category: "Weather",
    endpoints: [
      { method: "GET", path: "//London?format=j1", description: "Weather for a location (JSON)" },
      { method: "GET", path: "/?format=3", description: "Compact weather for multiple locations" },
    ],
    cors: true,
    https: true,
  },
  {
    name: "Reddit JSON",
    slug: "reddit",
    description: "Read-only Reddit API for team announcements, standup highlights, and community feed",
    baseUrl: "https://www.reddit.com",
    auth: "None (public read)",
    category: "Development",
    endpoints: [
      { method: "GET", path: "/r/programming/.json", description: "Latest posts from a subreddit" },
      { method: "GET", path: "/r/productivity/.json", description: "Productivity subreddit feed" },
      { method: "GET", path: "/r/smallbusiness/.json", description: "Small business feed" },
    ],
    cors: false,
    https: true,
    note: "Use via backend proxy (CORS-restricted)",
  },
  {
    name: "Currency Exchange",
    slug: "currency",
    description: "Free real-time currency exchange rates for multi-organization billing contexts",
    baseUrl: "https://api.exchangerate-api.com/v4/latest/USD",
    auth: "None",
    category: "Finance",
    endpoints: [
      { method: "GET", path: "/v4/latest/USD", description: "Latest rates against USD" },
      { method: "GET", path: "/v4/latest/EUR", description: "Latest rates against EUR" },
    ],
    cors: true,
    https: true,
  },
];
