import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.tsx"],
            refresh: true,
        }),
        tailwindcss(),
    ],
    // server: {
    //     host: "0.0.0.0",
    //     hmr: {
    //         host: "10.0.2.2",
    //     },
    // },
});
