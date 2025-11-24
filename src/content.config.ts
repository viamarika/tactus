import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const Project = z.object({
	title: z.string(),
	description: z.string(),
	link: z.string().optional(),
	repository: z.string(),
	role: z.string(),
	type: z.string(),
	technologies: z.string().array(),
	text: z.string().array(),
});

export type Project = z.infer<typeof Project>;

const projects = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/data/projects" }),
	schema: Project,
});

export const collections = { projects };
