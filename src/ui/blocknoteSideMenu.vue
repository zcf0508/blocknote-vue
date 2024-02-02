<script setup lang="ts">
import { useFloating } from '@floating-ui/vue';
import type { BlockNoteEditor } from '@blocknote/core';

const props = defineProps({
  editor: {
    type: Object as PropType<BlockNoteEditor<any, any, any>>,
    required: true,
  },
});

const { editor } = toRefs(props);

const sideMenuRef = ref<HTMLDivElement>();

const show = ref(false);

const reference = ref<{getBoundingClientRect: () => DOMRect} | null>(null);

const { floatingStyles, update } = useFloating(reference, sideMenuRef, {
  open: show,
  placement: 'left',
});

const plusRef = ref<HTMLButtonElement>();
const dragRef = ref<HTMLButtonElement>();

function clickHandler(e: Event) {
  e.preventDefault();
  editor.value.sideMenu.addBlock();
}


const parentElement = editor.value?.domElement.parentElement;
if (parentElement) {
  editor.value.sideMenu.onUpdate((sideMenuState) => {
    if(!sideMenuRef.value) return;

    nextTick(() => {
      plusRef.value?.addEventListener('click', clickHandler);
      if(dragRef.value) {
        dragRef.value.draggable = true;
        dragRef.value?.addEventListener('dragstart', editor.value.sideMenu.blockDragStart);
        dragRef.value?.addEventListener('dragend', editor.value.sideMenu.blockDragEnd);
      }
    });

    reference.value = {
      getBoundingClientRect() {
        return sideMenuState.referencePos;
      },
    };

    show.value = sideMenuState.show;

    
    
    if(!parentElement.contains(sideMenuRef.value)) {
      parentElement.appendChild(sideMenuRef.value);
    }
    
    update();
  });
}

onUnmounted(() => {
  plusRef.value?.removeEventListener('click', clickHandler);

  dragRef.value?.removeEventListener('dragstart', editor.value.sideMenu.blockDragStart);
  dragRef.value?.removeEventListener('dragend', editor.value.sideMenu.blockDragEnd);
});
</script>

<template>
  <div
    v-show="show"
    id="side_menu"
    ref="sideMenuRef"
    class="absolute cursor-pointer px-2 py-[3px]"
    :style="floatingStyles"
  >
    <span ref="plusRef" class="i-radix-icons:plus">
    </span>  
    <span
      ref="dragRef"
      class="i-radix-icons:drag-handle-dots-2"
      draggable
    >
    </span>
  </div>
</template>

<style scoped>

</style>