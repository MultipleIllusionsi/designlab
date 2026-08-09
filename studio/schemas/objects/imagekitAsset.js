import { defineType, defineField } from 'sanity'
import { ImageKitInput } from '../../components/ImageKitInput'

// The media reference. We store the ImageKit file path only — never a full URL —
// so transform tuning is one code change, not N edits in the CMS.
// `type`, `width`, `height` are auto-filled by the custom input (or the migration
// script) and shown read-only; the editor only ever touches `filePath`.
export const imagekitAsset = defineType({
  name: 'imagekitAsset',
  title: 'ImageKit asset',
  type: 'object',
  components: { input: ImageKitInput },
  fields: [
    defineField({
      name: 'filePath',
      title: 'File path',
      type: 'string',
      description: 'File name inside the ImageKit project folder, e.g. 10_sharingplayer_video.mp4',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: { list: ['image', 'video'] },
      readOnly: true,
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'height',
      title: 'Height',
      type: 'number',
      readOnly: true,
    }),
  ],
  preview: {
    select: { filePath: 'filePath', type: 'type', width: 'width', height: 'height' },
    prepare({ filePath, type, width, height }) {
      const dims = width && height ? `${width}×${height}` : ''
      return {
        title: filePath || '(no file)',
        subtitle: [type, dims].filter(Boolean).join(' · '),
      }
    },
  },
})
