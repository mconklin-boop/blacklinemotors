/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Inventory and commercial leasing pages were retired when Blackline moved
    // to a source-first rent-to-own model. Send old links to the program page.
    return [
      { source: "/vehicles", destination: "/rent-to-own", permanent: false },
      { source: "/vehicle/:slug*", destination: "/rent-to-own", permanent: false },
      { source: "/lease", destination: "/rent-to-own", permanent: false },
      { source: "/financing", destination: "/rent-to-own", permanent: false },
      { source: "/partnerships", destination: "/contact", permanent: false },
      { source: "/es", destination: "/es/rent-to-own", permanent: false },
      { source: "/rto", destination: "/rent-to-own", permanent: false },
    ];
  },
};

export default nextConfig;
