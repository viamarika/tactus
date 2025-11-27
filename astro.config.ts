import { defineConfig } from "astro/config";
import { default as svelte } from "@astrojs/svelte";
import { default as uno } from "unocss/astro";
import { default as browserslist } from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { FontaineTransform } from "fontaine";

export default defineConfig({
	vite: {
		plugins: [
			FontaineTransform.vite({
				fallbacks: {},
			}),
		],

		css: {
			transformer: "lightningcss",
			lightningcss: {
				targets: browserslistToTargets(browserslist()),
			},
		},
	},

	integrations: [
		uno({
			injectReset: true,
		}),

		svelte(),
	],
});
