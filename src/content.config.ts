import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

const Song = z.object({
	id: z.number(),
	type: z.string(),
	title: z.string(),
	path: z.string()
});

export type Song = z.infer<typeof Song>;

const songs = defineCollection({
	loader: file("src/data/songs.json"),
	schema: Song,
});

export const collections = { songs  };
