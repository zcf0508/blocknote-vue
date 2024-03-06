import type { Ref } from 'vue-demi';
import { nextTick, onMounted, shallowRef } from 'vue-demi';
import type {
  BlockNoteEditorOptions,
  BlockSchemaFromSpecs,
  BlockSpecs,
  InlineContentSchemaFromSpecs,
  InlineContentSpecs,
  StyleSchemaFromSpecs,
  StyleSpecs,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from '@blocknote/core';
import {
  BlockNoteEditor,
} from '@blocknote/core';

export function useBlocknote<
  BSpecs extends BlockSpecs = typeof defaultBlockSpecs,
  ISpecs extends InlineContentSpecs = typeof defaultInlineContentSpecs,
  SSpecs extends StyleSpecs = typeof defaultStyleSpecs,
>(
  parentElement: Ref<HTMLElement | undefined>,
  options?: Partial<Omit<BlockNoteEditorOptions<
    BlockSchemaFromSpecs<BSpecs>,
    InlineContentSchemaFromSpecs<ISpecs>,
    StyleSchemaFromSpecs<SSpecs>
  >, 'parentElement'>>,
) {
  const blocknote = shallowRef<BlockNoteEditor<
    BlockSchemaFromSpecs<BSpecs>,
    InlineContentSchemaFromSpecs<ISpecs>,
    StyleSchemaFromSpecs<SSpecs>
  >>(BlockNoteEditor.create({
    ...options,
  }));

  onMounted(() => {
    nextTick(() => {
      if (!parentElement.value) {
        return;
      }
      blocknote.value.mount(parentElement.value);
    });
  });

  return {
    blocknote,
  };
}
