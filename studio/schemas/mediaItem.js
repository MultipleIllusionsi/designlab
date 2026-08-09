import { defineType, defineField } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// One gallery card. Order is controlled by the hidden `orderRank` field via
// drag-and-drop in the orderable list (see structure.js); the frontend reads it
// through GROQ. Fields mirror the current hardcoded GRID_ITEMS shape (including
// `tags` and `alt`, which drive the filter nav and image accessibility).
export const mediaItem = defineType({
  name: 'mediaItem',
  title: 'Media item',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'mediaItem' }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Short accessibility description (mainly for images).',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'interface', value: 'interface' },
          { title: 'motion', value: 'motion' },
          { title: 'graphic', value: 'graphic' },
        ],
      },
    }),
    defineField({
      name: 'asset',
      title: 'Media',
      type: 'imagekitAsset',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    // No thumbnail on purpose: rendering a video thumbnail in the list would
    // trigger an ImageKit video transformation per item (burns video units).
    select: { title: 'title', filePath: 'asset.filePath', type: 'asset.type' },
    prepare({ title, filePath, type }) {
      return {
        title: title || filePath || '(untitled)',
        subtitle: [type, filePath].filter(Boolean).join(' · '),
      }
    },
  },
})
