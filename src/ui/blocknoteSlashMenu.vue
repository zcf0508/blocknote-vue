<script setup lang="ts">
import { flip, useFloating } from '@floating-ui/vue';
import type { BaseSlashMenuItem, BlockNoteEditor } from '@blocknote/core';

const props = defineProps({
  editor: {
    type: Object as PropType<BlockNoteEditor<any, any, any>>,
    required: true,
  },
});

const slashMenuRef = ref<HTMLDivElement>();

const reference = ref<{getBoundingClientRect: () => DOMRect} | null>(null);

const show = ref(false);

const delayShow = ref(false);

watch(show, () => {
  setTimeout(() => {
    delayShow.value = show.value;
  }, 100);
});

const { floatingStyles, update } = useFloating(reference, slashMenuRef, {
  open: show,
  placement: 'right-start',
  middleware: [
    flip(),
  ],
});

const { editor } = toRefs(props);

const filteredItems = ref<BaseSlashMenuItem<any, any, any>[]>([]);
const selectedIndex = ref(0);

const parentElement = editor.value?.domElement.parentElement;
if (parentElement) {
  editor.value.slashMenu.onUpdate((slashMenuState) => {
    if(!slashMenuRef.value) return;

    filteredItems.value = slashMenuState.filteredItems;
    selectedIndex.value = slashMenuState.keyboardHoveredItemIndex;

    const blockGroupElement = parentElement.querySelector('.bn-block-group');
    
    reference.value = {
      getBoundingClientRect() {
        if (slashMenuState.referencePos.width == blockGroupElement?.clientWidth) {
          return new DOMRect(
            slashMenuState.referencePos.x,
            slashMenuState.referencePos.y * 2,
            0,
            slashMenuState.referencePos.height,
          );
        } else {
          return slashMenuState.referencePos;
        }
      },
    };

    show.value = slashMenuState.show;

    if(!parentElement.contains(slashMenuRef.value)) {
      parentElement.appendChild(slashMenuRef.value);
    }

    update();
  });
}

function selectHandler(e: KeyboardEvent) {
  const li = slashMenuRef.value?.querySelectorAll('li')[selectedIndex.value];
  if (li) {
    li.scrollIntoView({ block: 'nearest' });
  }
}

onMounted(() => {
  window.addEventListener('keydown', selectHandler);
});

onUnmounted(() => {
  window.removeEventListener('keydown', selectHandler);
});

</script>


<template>
  <ul
    v-show="delayShow"
    ref="slashMenuRef"
    :style="floatingStyles"
    class="
      w-[200px] h-[225px] p-2 overflow-y-auto scroll-smooth
      bg-gray-100 
      border border-solid border-gray-200 rounded-md 
      flex flex-col gap-1
      list-none
    "
  >
    <li v-for="(item, index) in filteredItems" :key="item.name" tabindex="0">
      <button
        class="
          w-full p-2 
          bg-transparent hover:bg-gray-200! 
          border-none rounded-md 
          text-left transition-all
          cursor-pointer
        "
        :class="{
          'bg-gray-200!': selectedIndex === index,
        }"
        @click="() => editor.slashMenu.itemCallback(item)"
      >
        {{ item.name }}
      </button>
    </li>
  </ul>
</template>

<style scoped>

</style>
