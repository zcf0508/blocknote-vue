import { Ref, onMounted, nextTick, shallowRef } from 'vue-demi';
import type { 
  BlockSpecs, 
  BlockNoteEditorOptions, 
  InlineContentSpecs, 
  StyleSpecs, 
  BlockSchemaFromSpecs,
  InlineContentSchemaFromSpecs,
  StyleSchemaFromSpecs, 
} from '@blocknote/core';
import { 
  BlockNoteEditor, 
  defaultBlockSpecs, 
  defaultInlineContentSpecs, 
  defaultStyleSpecs, 
} from '@blocknote/core';


export function useBlocknote<
  BSpecs extends BlockSpecs = typeof defaultBlockSpecs, 
  ISpecs extends InlineContentSpecs = typeof defaultInlineContentSpecs, 
  SSpecs extends StyleSpecs = typeof defaultStyleSpecs,
>(
  parentElement: Ref<HTMLElement | undefined>, 
  options?: Partial<Omit<BlockNoteEditorOptions<BSpecs, ISpecs, SSpecs>, 'parentElement'>>,
) {
  let blocknote = shallowRef<BlockNoteEditor<
    BlockSchemaFromSpecs<BSpecs>,
    InlineContentSchemaFromSpecs<ISpecs>,
    StyleSchemaFromSpecs<SSpecs>
  >>();
  
  onMounted(() => {
    nextTick(() => {
      if(!parentElement.value) return;
      blocknote.value = BlockNoteEditor.create({
        parentElement: parentElement.value,
        ...options,
      });
    });
  });

  return {
    blocknote,
  };
}