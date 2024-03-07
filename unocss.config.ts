import { defineConfig, presetIcons, presetUno } from 'unocss';

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
  shortcuts: {
    'btn-init': 'font-size-inherit p-0 bg-transparent border-0 text-inherit',
  },
});
