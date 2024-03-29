import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import RadixVueResolver from 'radix-vue/resolver';
import UnoCSS from 'unocss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      /* options */
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      imports: ['vue-demi', '@vueuse/core'],
      dts: true,
    }),
    Components({
      extensions: ['vue'],
      deep: true,
      dts: true,
      resolvers: [
        // @ts-expect-error just work, ignore
        RadixVueResolver(),
      ],
    }),
    UnoCSS(),
    dts({
      rollupTypes: true,
      exclude: ['node_modules/**', 'playground', 'test', './*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'blocknote-vue',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') {
          return 'index.mjs';
        }
        else {
          return 'index.cjs';
        }
      },
    },
    rollupOptions: {
      external: ['vue', 'vue-demi', 'yjs'],
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
});
