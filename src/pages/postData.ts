import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const results = await request.json();

	const res: Response = await fetch("https://api.jsonbin.io/v3/b", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"X-Collection-Name": import.meta.env.COLLECTION_NAME,
			"X-Master-Key": import.meta.env.BIN_KEY,
		},
		body: JSON.stringify(results),
	});

	const data = await res.json();

	return new Response(JSON.stringify(data), {
		status: res.status,
		headers: { "Content-Type": "application/json" },
	});
};
