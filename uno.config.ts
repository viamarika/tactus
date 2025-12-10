import { defineConfig } from "unocss";
import { presetWind4, presetIcons, presetWebFonts } from "unocss";
import { transformerVariantGroup, transformerDirectives } from "unocss";

export default defineConfig({
	presets: [
		presetWind4({
			dark: "media",
		}),

		presetWebFonts({
			fonts: {
				form: "Roboto",
			},
		}),

		presetIcons({
			extraProperties: {
				display: "inline-block",
			},

			collections: {
				tactus: {},
			},
		}),
	],

	transformers: [transformerVariantGroup(), transformerDirectives()],

	theme: {
		colors: {
			brand: {
				ipod: "#EC5298",
				hover: "#0098E6",
				text: "oklch(0.3 0 0)",
			},
		},
	},
});
