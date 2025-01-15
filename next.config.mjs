import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack: (config) => {
		config.module.rules.push({
			test: /\.js$/,
			include: path.resolve(process.cwd(), "public/service-worker.js"),
			use: { loader: "file-loader", options: { name: "[name].[hash].js" } },
		});
		return config;
	},
};

export default nextConfig;
