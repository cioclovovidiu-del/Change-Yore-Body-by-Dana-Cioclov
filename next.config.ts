import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/landing-v2/index.html",
        },
      ],
      afterFiles: [
        {
          source: "/landing-v2",
          destination: "/landing-v2/index.html",
        },
        {
          source: "/landing-v2/",
          destination: "/landing-v2/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
