<script setup lang="ts">
import { flip, offset, useFloating } from '@floating-ui/vue';
import type { BlockNoteEditor } from '@blocknote/core';

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

const show = ref(false);
const showRow = ref(true);
const showCol = ref(true);

const rowIndex = ref(0);
const colIndex = ref(0);

const draggedCellOrientation = ref<'col' | 'row'>();

const referencePosCell = ref<DOMRect>();
const referencePosTable = ref<DOMRect>();

const mousePos = ref<number>();

const rowReference = computed(() => {
  return {
    getBoundingClientRect: () => {
      if (draggedCellOrientation.value === 'row') {
        return new DOMRect(
          referencePosTable.value?.x,
          mousePos.value,
          referencePosTable.value?.width,
          0,
        );
      }
      return new DOMRect(
        referencePosTable.value?.x,
        referencePosCell.value?.y,
        referencePosTable.value?.width,
        referencePosCell.value?.height,
      );
    },
  };
});

const colReference = computed(() => {
  return {
    getBoundingClientRect: () => {
      if (draggedCellOrientation.value === 'col') {
        return new DOMRect(
          mousePos.value,
          referencePosTable.value?.y,
          0,
          referencePosTable.value?.height,
        );
      }
      return new DOMRect(
        referencePosCell.value?.x,
        referencePosTable.value?.y,
        referencePosCell.value?.width,
        referencePosTable.value?.height,
      );
    },
  };
});

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{ isCol: boolean }>();

const rowHandleRef = ref<InstanceType<typeof ReuseTemplate>>();
const colHandleRef = ref<InstanceType<typeof ReuseTemplate>>();

const rowFloating = useFloating(rowReference, rowHandleRef, {
  open: show,
  placement: 'left',
  middleware: [offset(-10)],
});

const colFloating = useFloating(colReference, colHandleRef, {
  open: show,
  placement: 'top',
  middleware: [offset(-12)],
});

const tableHandleRef = ref<HTMLDivElement>();

const { editor } = toRefs(props);

if (props.parentElement) {
  editor.value.tableHandles!.onUpdate((state) => {
    if (!tableHandleRef.value) {
      return;
    }

    show.value = state.show;
    rowIndex.value = state.rowIndex;
    colIndex.value = state.colIndex;

    nextTick(() => {
      if (colHandleRef.value) {
        colHandleRef.value.$el.draggable = true;
        colHandleRef.value.$el.addEventListener('dragstart', editor.value.tableHandles!.colDragStart);
        colHandleRef.value.$el.addEventListener('dragend', editor.value.tableHandles!.dragEnd);
      }
      if (rowHandleRef.value) {
        rowHandleRef.value.$el.draggable = true;
        rowHandleRef.value.$el.addEventListener('dragstart', editor.value.tableHandles!.rowDragStart);
        rowHandleRef.value.$el.addEventListener('dragend', editor.value.tableHandles!.dragEnd);
      }
    });

    draggedCellOrientation.value = state.draggingState?.draggedCellOrientation;
    mousePos.value = state.draggingState?.mousePos;

    referencePosCell.value = state.referencePosCell;
    referencePosTable.value = state.referencePosTable;

    if (!props.parentElement.contains(tableHandleRef.value)) {
      props.parentElement.appendChild(tableHandleRef.value);
    }

    rowFloating.update();
    colFloating.update();
  });
}

onUnmounted(() => {
  colHandleRef.value?.$el.removeEventListener('dragstart', editor.value.tableHandles!.colDragStart);
  rowHandleRef.value?.$el.removeEventListener('dragstart', editor.value.tableHandles!.rowDragStart);
  colHandleRef.value?.$el.removeEventListener('dragend', editor.value.tableHandles!.dragEnd);
  rowHandleRef.value?.$el.removeEventListener('dragend', editor.value.tableHandles!.dragEnd);
});
</script>

<template>
  <DefineTemplate v-slot="{ isCol }">
    <span
      class="
        px-[1.5px]
        flex justify-center items-center
        bg-white text-gray-400 shadow-sm hover:bg-gray-300
        border border-solid border-gray-100 rounded-md
        cursor-pointer
      "
      draggable
    >
      <span
        class="i-radix-icons:drag-handle-dots-2 "
        :class="isCol ? 'transform rotate-90' : ''"
      >
      </span>
    </span>
  </DefineTemplate>

  <div v-show="show" ref="tableHandleRef">
    <ReuseTemplate
      v-show="showRow"
      ref="rowHandleRef"
      :style="rowFloating.floatingStyles.value"
      :is-col="false"
    />

    <ReuseTemplate
      v-show="showCol"
      ref="colHandleRef"
      :style="colFloating.floatingStyles.value"
      :is-col="true"
    />
  </div>
</template>

<style scoped>

</style>
