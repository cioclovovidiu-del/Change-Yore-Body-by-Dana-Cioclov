import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/landing-v2/index.html",
        },
        {
          // M24: Landing page iframe loads this URL — serve React runtime instead
          source: "/landing-v2/CYB_Chestionar_Unified.html",
          destination: "/questionnaire-runtime",
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
