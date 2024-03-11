<script setup lang="ts">
import { flip, offset, size, useFloating } from '@floating-ui/vue';
import type { BlockNoteEditor, DefaultSuggestionItem } from '@blocknote/core';
import { filterSuggestionItems, getDefaultSlashMenuItems } from '@blocknote/core';

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

/** avoid menu item click event not working */
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
    offset(10),
    // Flips the menu placement to maximize the space available, and prevents
    // the menu from being cut off by the confines of the screen.
    flip(),
    size({
      apply({ availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          maxHeight: `${availableHeight - 10}px`,
        });
      },
    }),
  ],
});

const { editor } = toRefs(props);

const query = ref<string>();
const items = computed(() => {
  return filterSuggestionItems(
    getDefaultSlashMenuItems(props.editor),
    query.value || '',
  );
});
const selectedIndex = ref(0);

function onItemClick(item: DefaultSuggestionItem, index?: number) {
  if (index !== undefined && index >= 0) {
    selectedIndex.value = index;
  }
  item.onItemClick();
  editor.value.suggestionMenus.clearQuery();
  editor.value.suggestionMenus.closeMenu();
}

function handleMenuNavigationKeys(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (items.value.length) {
      selectedIndex.value = (selectedIndex.value - 1 + items.value!.length) % items.value!.length;
    }

    return true;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (items.value.length) {
      selectedIndex.value = (selectedIndex.value + 1) % items.value!.length;
    }

    return true;
  }

  if (event.key === 'Enter') {
    event.preventDefault();

    if (items.value.length) {
      const item = items.value[selectedIndex.value];
      onItemClick(item);
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

watch(show, (val) => {
  if (val) {
    props.parentElement.addEventListener(
      'keydown',
      handleMenuNavigationKeys,
      true,
    );
  }
});

watch(delayShow, (val) => {
  if (!val) {
    props.parentElement.removeEventListener(
      'keydown',
      handleMenuNavigationKeys,
      true,
    );
  }
});

let lasetReferencePos: DOMRect;

if (props.parentElement) {
  editor.value.suggestionMenus.onUpdate('/', (SuggestionMenuState) => {
    if (!slashMenuRef.value) {
      return;
    }

    const blockGroupElement = props.parentElement.querySelector('.bn-block-group');

    if (lasetReferencePos !== SuggestionMenuState.referencePos) {
      reference.value = {
        getBoundingClientRect() {
          if (SuggestionMenuState.referencePos.width === blockGroupElement?.clientWidth) {
            return new DOMRect(
              SuggestionMenuState.referencePos.x,
              SuggestionMenuState.referencePos.y,
              0,
              SuggestionMenuState.referencePos.height,
            );
          }
          else {
            return SuggestionMenuState.referencePos;
          }
        },
      };
      lasetReferencePos = SuggestionMenuState.referencePos;

      update();
    }

    query.value = SuggestionMenuState.query;

    show.value = SuggestionMenuState.show;

    if (!props.parentElement.contains(slashMenuRef.value)) {
      props.parentElement.appendChild(slashMenuRef.value);
    }
  });
}

function selectHandler() {
  const li = slashMenuRef.value?.querySelectorAll('li')[selectedIndex.value];
  if (li) {
    li.scrollIntoView({ block: 'nearest' });
  }
}

useEventListener('keydown', selectHandler);
</script>

<template>
  <ul
    v-show="delayShow"
    ref="slashMenuRef"
    :style="floatingStyles"
    class="
      w-[200px] max-h-[225px] p-2 overflow-y-auto scroll-smooth
      bg-gray-100
      border border-solid border-gray-200 rounded-md
      flex flex-col gap-1
      list-none
    "
  >
    <li v-for="(item, index) in items" :key="item.title" tabindex="0">
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
        @click="onItemClick(item, index)"
      >
        {{ item.title }}
      </button>
    </li>
  </ul>
</template>

<style scoped>

</style>
