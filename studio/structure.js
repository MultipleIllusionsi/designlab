import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

// The orderable list renders mediaItem documents with drag-and-drop reordering.
// Reordering writes the hidden `orderRank` field, which the frontend reads via GROQ.
export const structure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'mediaItem',
        title: 'Media items',
        S,
        context,
      }),
    ])
