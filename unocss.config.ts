import { defineConfig, presetUno, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block',
      },
    }),
  ],
});
