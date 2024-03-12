<script setup lang="ts">
import 'blocknote-vue/style.css';
import { BlocknoteSideMenu, BlocknoteSlashMenu, BlocknoteTableHandles, useBlocknote } from 'blocknote-vue';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const doc = new Y.Doc();

const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', 'blocknote-demo', doc);

const username = `user${Math.floor(Math.random() * 1000)}`;
const userColor = computed(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`);

const editorRef = ref<HTMLElement>();
const { blocknote } = useBlocknote(editorRef, {
  collaboration: {
    provider,
    fragment: doc.getXmlFragment(),
    user: {
      name: username,
      color: userColor.value,
    },
  },
});
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
