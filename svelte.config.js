// import adapter from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-vercel';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        // adapter: adapter({
        //     out: 'build'
        // })
        adapter: adapter()
    }
};

export default config;
