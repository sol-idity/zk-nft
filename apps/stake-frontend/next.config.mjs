/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["metadata.tinys.pl", "files.tinys.pl"],
    unoptimized: true,
  },
  output: "export",
};

export default nextConfig;
