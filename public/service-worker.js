// public/service-worker.js

const DB_NAME = "user-role-db";
const STORE_NAME = "pending-updates";

self.addEventListener("install", (event) => {
	console.log("[Service Worker] Installed");
	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
	console.log("[Service Worker] Activated");
	event.waitUntil(self.clients.claim());
});

// Escucha las solicitudes fetch y guarda las actualizaciones offline
self.addEventListener("fetch", (event) => {
	if (event.request.url.includes("/api/users")) {
		event.respondWith(handleOfflineRequest(event.request));
	}
});

// Escucha la sincronización en segundo plano
self.addEventListener("sync", (event) => {
	if (event.tag === "sync-user-updates") {
		console.log("[Service Worker] Syncing user updates...");
		event.waitUntil(syncUserUpdates());
	}
});

// Manejo de solicitudes cuando está offline
async function handleOfflineRequest(request) {
	const clonedRequest = await request.clone();
	const body = await clonedRequest.json();

	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	await store.put(body);

	return new Response(JSON.stringify({ message: "Update saved offline" }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
}

// Función para sincronizar las actualizaciones cuando vuelve a estar en línea
async function syncUserUpdates() {
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);
	const updates = await store.getAll();

	for (const update of updates) {
		try {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(update),
			});

			if (!response.ok) {
				console.error(`[Service Worker] Failed to sync update:`, update);
				continue;
			}

			// Eliminar la actualización de IndexedDB después de sincronizarla
			const deleteTx = db.transaction(STORE_NAME, "readwrite");
			const deleteStore = deleteTx.objectStore(STORE_NAME);
			await deleteStore.delete(update.id);
		} catch (error) {
			console.error("[Service Worker] Sync failed:", error);
		}
	}
}

// Abrir IndexedDB
async function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, {
					keyPath: "id",
					autoIncrement: true,
				});
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
