import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import typescript from "@rollup/plugin-typescript";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            formats: ["es", "umd"],
            entry: "src/index.ts",
            name: "index",
            fileName: format => `index.${format}.js`
        },
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM"
                }
            },
            plugins: [
                typescript({
                    tsconfig: "./tsconfig.app.json",
                    declaration: true,
                    declarationDir: "dist",
                    rootDir: "src"
                })
            ]
        }
    }
});
