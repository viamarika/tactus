import { defineConfig } from "astro/config";
import { default as svelte } from "@astrojs/svelte";
import { default as uno } from "unocss/astro";
import { default as browserslist } from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { presetWind4, presetIcons, presetWebFonts } from "unocss";
import { transformerVariantGroup } from "unocss";
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
		svelte(),

		uno({
			injectReset: true,

			presets: [
				presetWind4({
					dark: "media",
				}),

				presetWebFonts({
					fonts: {
						playful: 'Coming Soon',
						sans: "Inter",
					},
				}),

				presetIcons({
					extraProperties: {
						display: "inline-block",
					},
				}),
			],

			transformers: [transformerVariantGroup()],

			theme: {
				colors: {
					brand: {
						bg: "#FFFFF",
					},
				},
			},
		}),
	],
});
