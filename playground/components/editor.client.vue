<script setup lang="ts">
import { useBlocknote, BlocknoteSideMenu, BlocknoteSlashMenu, BlocknoteTableHandles } from 'blocknote-vue';
import 'blocknote-vue/style.css';
const editorRef = ref<HTMLElement>();
const { blocknote } = useBlocknote(editorRef);

</script>

<template>
  <div>
    <div ref="editorRef"></div>
    <BlocknoteSideMenu v-if="blocknote" :editor="blocknote"></BlocknoteSideMenu>
    <BlocknoteSlashMenu v-if="blocknote" :editor="blocknote"></BlocknoteSlashMenu>
    <BlocknoteTableHandles v-if="blocknote" :editor="blocknote"></BlocknoteTableHandles>
  </div>
</template>

<style scoped>

</style>