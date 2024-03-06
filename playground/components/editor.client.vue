<script setup lang="ts">
import { BlocknoteSideMenu, BlocknoteSlashMenu, BlocknoteTableHandles, useBlocknote } from 'blocknote-vue';
import 'blocknote-vue/style.css';

const editorRef = ref<HTMLElement>();
const { blocknote } = useBlocknote(editorRef);
</script>

<template>
  <div>
    <div ref="editorRef"></div>
    <BlocknoteSideMenu
      v-if="blocknote && editorRef"
      :editor="blocknote"
      :parent-element="editorRef"
    ></BlocknoteSideMenu>
    <BlocknoteSlashMenu
      v-if="blocknote && editorRef"
      :editor="blocknote"
      :parent-element="editorRef"
    ></BlocknoteSlashMenu>
    <BlocknoteTableHandles
      v-if="blocknote && editorRef"
      :editor="blocknote"
      :parent-element="editorRef"
    ></BlocknoteTableHandles>
  </div>
</template>

<style scoped>

</style>
