<script setup lang="ts">
import { flip, useFloating } from '@floating-ui/vue';
import type { BlockNoteEditor } from '@blocknote/core';
import { getDefaultSlashMenuItems } from '@blocknote/core';

const props = defineProps({
  editor: {
    type: Object as PropType<BlockNoteEditor<any, any, any>>,
    required: true,
  },
  parentElement: {
    type: Object as PropType<HTMLElement>,
    required: true,
  },
});

const slashMenuRef = ref<HTMLDivElement>();

const reference = ref<{ getBoundingClientRect: () => DOMRect } | null>(null);

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

const filteredItems = ref(getDefaultSlashMenuItems(props.editor));
const selectedIndex = ref(0);

function handleMenuNavigationKeys(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (filteredItems.value.length) {
      selectedIndex.value = (selectedIndex.value - 1 + filteredItems.value!.length) % filteredItems.value!.length;
    }

    return true;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (filteredItems.value.length) {
      selectedIndex.value = (selectedIndex.value + 1) % filteredItems.value!.length;
    }

    return true;
  }

  if (event.key === 'Enter') {
    event.preventDefault();

    if (filteredItems.value.length) {
      const item = filteredItems.value[selectedIndex.value];
      editor.value.suggestionMenus.closeMenu();
      editor.value.suggestionMenus.clearQuery();
      item.onItemClick();
    }

    return true;
  }

  if (event.key === 'Escape') {
    event.preventDefault();

    editor.value.suggestionMenus.closeMenu();

    return true;
  }

  return false;
}

onMounted(() => {
  props.parentElement.addEventListener(
    'keydown',
    handleMenuNavigationKeys,
    true,
  );
});

onUnmounted(() => {
  props.parentElement.removeEventListener(
    'keydown',
    handleMenuNavigationKeys,
    true,
  );
});

if (props.parentElement) {
  editor.value.suggestionMenus.onUpdate('/', (SuggestionMenuState) => {
    if (!slashMenuRef.value) {
      return;
    }

    const blockGroupElement = props.parentElement.querySelector('.bn-block-group');

    reference.value = {
      getBoundingClientRect() {
        if (SuggestionMenuState.referencePos.width === blockGroupElement?.clientWidth) {
          return new DOMRect(
            SuggestionMenuState.referencePos.x,
            SuggestionMenuState.referencePos.y * 2,
            0,
            SuggestionMenuState.referencePos.height,
          );
        }
        else {
          return SuggestionMenuState.referencePos;
        }
      },
    };

    show.value = SuggestionMenuState.show;

    if (!props.parentElement.contains(slashMenuRef.value)) {
      props.parentElement.appendChild(slashMenuRef.value);
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
    <li v-for="(item, index) in filteredItems" :key="item.title" tabindex="0">
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
        @click="item.onItemClick()"
      >
        {{ item.title }}
      </button>
    </li>
  </ul>
</template>

<style scoped>

</style>
