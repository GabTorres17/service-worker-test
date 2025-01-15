// src/layout.js
"use client";

import { useEffect } from "react";

export default function RootLayout({ children }) {
	useEffect(() => {
		if ("serviceWorker" in navigator && "SyncManager" in window) {
			navigator.serviceWorker
				.register("/service-worker.js")
				.then((registration) => {
					console.log("Service Worker registered", registration);
				})
				.catch((error) => {
					console.error("Service Worker registration failed", error);
				});
		}
	}, []);

	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
