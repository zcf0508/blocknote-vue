<script setup lang="ts">
import { useFloating } from '@floating-ui/vue';
import type { Block, BlockNoteEditor } from '@blocknote/core';
import { checkBlockHasDefaultProp, checkBlockTypeHasDefaultProp } from '@blocknote/core';

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

const { editor } = toRefs(props);

const sideMenuRef = ref<HTMLDivElement>();

const show = ref(false);

const reference = ref<{ getBoundingClientRect: () => DOMRect } | null>(null);

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

let lasetReferencePos: DOMRect;

const currentBlock = ref<Block<any, any, any>>();

if (props.parentElement) {
  editor.value.sideMenu.onUpdate((sideMenuState) => {
    if (!sideMenuRef.value) {
      return;
    }

    if (plusRef.value) {
      plusRef.value.addEventListener('click', clickHandler);
    }
    if (dragRef.value) {
      dragRef.value.draggable = true;
      dragRef.value.addEventListener('dragstart', editor.value.sideMenu.blockDragStart);
      dragRef.value.addEventListener('dragend', editor.value.sideMenu.blockDragEnd);
    }

    if (lasetReferencePos !== sideMenuState.referencePos) {
      reference.value = {
        getBoundingClientRect() {
          return sideMenuState.referencePos;
        },
      };

      lasetReferencePos = sideMenuState.referencePos;

      update();
    }

    currentBlock.value = sideMenuState.block;
    show.value = sideMenuState.show;

    if (!props.parentElement.contains(sideMenuRef.value)) {
      props.parentElement.appendChild(sideMenuRef.value);
    }
  });
}

onUnmounted(() => {
  plusRef.value?.removeEventListener('click', clickHandler);

  dragRef.value?.removeEventListener('dragstart', editor.value.sideMenu.blockDragStart);
  dragRef.value?.removeEventListener('dragend', editor.value.sideMenu.blockDragEnd);
});

const openMenu = ref(false);

watch(openMenu, (val) => {
  if (val) {
    editor.value.sideMenu.freezeMenu();
  }
  else {
    editor.value.sideMenu.unfreezeMenu();
  }
});

const colors = [
  'default',
  'gray',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
] as const;

const showTextColorPicker = computed(() => {
  if (currentBlock.value) {
    return (
      checkBlockTypeHasDefaultProp('textColor', currentBlock.value.type, editor.value)
      && checkBlockHasDefaultProp('textColor', currentBlock.value, editor.value)
    );
  }
  else {
    return false;
  }
});

const showBackgroundColorPicker = computed(() => {
  if (currentBlock.value) {
    return (
      checkBlockTypeHasDefaultProp('backgroundColor', currentBlock.value.type, editor.value)
      && checkBlockHasDefaultProp('backgroundColor', currentBlock.value, editor.value)
    );
  }
  else {
    return false;
  }
});
</script>

<template>
  <div
    v-show="show || openMenu"
    id="side_menu"
    ref="sideMenuRef"
    class="absolute cursor-pointer px-2 py-[3px]"
    :style="floatingStyles"
  >
    <span ref="plusRef" class="i-radix-icons:plus">
    </span>
    <DropdownMenuRoot v-model:open="openMenu">
      <DropdownMenuTrigger class="btn-init cursor-pointer">
        <span
          ref="dragRef"
          class="i-radix-icons:drag-handle-dots-2"
          draggable
        >
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="start"
          class="
          rounded
          bg-gray-100
          border border-solid border-gray-200 rounded-md
          min-w-[120px] max-h-[225px] overflow-y-auto scroll-smooth p-2
          flex flex-col gap-2
        "
        >
          <DropdownMenuItem
            v-if="currentBlock"
            class="p-1 rounded-md cursor-pointer hover:bg-gray-200!"
            @click="editor.removeBlocks([currentBlock])"
          >
            <span role="button" class="flex items-center gap-2">
              <span class="i-material-symbols:delete-forever-outline-rounded"></span>
              <span>Remove</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuSub v-if="showTextColorPicker || showBackgroundColorPicker">
            <DropdownMenuSubTrigger
              class="p-1 rounded-md
                flex items-center justify-between
                cursor-pointer
                hover:bg-gray-200!
              "
            >
              <span role="button" class="flex items-center gap-2 cursor-pointer">
                <span class="i-material-symbols:colors-rounded"></span>
                <span>Colors</span>
              </span>
              <span class="i-material-symbols:chevron-right-rounded"></span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                as="ul"
                class="
                  rounded
                  bg-gray-100
                  border border-solid border-gray-200 rounded-md
                  min-w-[140px] max-h-[225px] overflow-y-auto scroll-smooth p-2
                  flex flex-col gap-2
                "
              >
                <template v-if="showTextColorPicker">
                  <DropdownMenuLabel>Text</DropdownMenuLabel>
                  <DropdownMenuItem
                    v-for="color in colors"
                    :key="color"
                    as="li"
                    class="p-1 rounded-md cursor-pointer hover:bg-gray-200!"
                  >
                    <span
                      role="button"
                      tabindex="0"
                      class="flex items-center justify-between"
                      @click="editor.updateBlock(currentBlock!, {
                        type: currentBlock!.type,
                        props: { textColor: color },
                      })"
                      @keydown="editor.updateBlock(currentBlock!, {
                        type: currentBlock!.type,
                        props: { textColor: color },
                      })"
                    >
                      <span class="flex gap-2 items-center">
                        <span
                          data-background-color="default"
                          :data-text-color="color"
                          class="
                            inline-block w-6 h-6
                            rounded  border border-solid border-gray-200
                            flex items-center justify-center
                          "
                        >
                          A
                        </span>
                        <span>
                          {{ color.charAt(0).toUpperCase() + color.slice(1) }}
                        </span>
                      </span>
                      <span
                        v-if="currentBlock?.props.textColor === color"
                        class="i-material-symbols:check-small-rounded"
                      ></span>
                    </span>
                  </DropdownMenuItem>
                </template>
                <template v-if="showBackgroundColorPicker">
                  <DropdownMenuLabel>Background</DropdownMenuLabel>
                  <DropdownMenuItem
                    v-for="color in colors"
                    :key="color"
                    as="li"
                    class="p-1 rounded-md cursor-pointer hover:bg-gray-200!"
                  >
                    <span
                      role="button"
                      tabindex="0"
                      class="flex items-center justify-between"
                      @click="editor.updateBlock(currentBlock!, {
                        type: currentBlock!.type,
                        props: { backgroundColor: color },
                      })"
                      @keydown="editor.updateBlock(currentBlock!, {
                        type: currentBlock!.type,
                        props: { backgroundColor: color },
                      })"
                    >
                      <span class="flex gap-2 items-center">
                        <span
                          :data-background-color="color"
                          data-text-color="default"
                          class="
                            inline-block w-6 h-6
                            rounded  border border-solid border-gray-200
                            flex items-center justify-center
                          "
                        >
                          A
                        </span>
                        <span>
                          {{ color.charAt(0).toUpperCase() + color.slice(1) }}
                        </span>
                      </span>
                      <span
                        v-if="currentBlock?.props.backgroundColor === color"
                        class="i-material-symbols:check-small-rounded"
                      ></span>
                    </span>
                  </DropdownMenuItem>
                </template>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuArrow
            class="
                fill-white"
          />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>

<style scoped>

</style>
