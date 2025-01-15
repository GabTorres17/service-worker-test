// src/components/UpdateUserButton.js
"use client";

export default function UpdateUserButton() {
	const handleUpdate = async () => {
		const updateData = {
			id: 1,
			role: "Buyer",
		};

		try {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updateData),
			});

			if (!response.ok) {
				throw new Error("Failed to update");
			}

			console.log("User updated");
		} catch (error) {
			console.log("Offline. Update stored.");
			const registration = await navigator.serviceWorker.ready;
			await registration.sync.register("sync-user-updates");
			console.log("Offline. Update will be synced when online.");
		}
	};

	return <button onClick={handleUpdate}>Change to Buyer</button>;
}
