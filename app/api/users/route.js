export async function POST(req) {
	const body = await req.json();
	console.log("Received update:", body);

	return new Response(JSON.stringify({ message: "User updated" }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
}
