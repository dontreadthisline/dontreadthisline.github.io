import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// site 占位，部署前改成你的真实域名（GitHub Pages 就是 https://<user>.github.io）
export default defineConfig({
  site: 'https://dontreadthisline.github.io',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: 'github-light' },
    },
  },
});
