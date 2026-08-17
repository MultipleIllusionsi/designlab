import { defineType, defineField } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// Карточка галереи. Медиа хранится в Sanity. Редактор выбирает тип и грузит
// один файл (image / video), либо для vimeo — ссылку + картинку для сетки.
// Для видео грид-превью делается автоматически Action'ом sync-previews.
//
// Эффективный тип: явный выбор `mediaType`, иначе — по тому, что уже заполнено
// (чтобы старые карточки без явного выбора показывали правильное поле).
const effectiveType = (doc) =>
  doc?.mediaType ||
  (doc?.video ? 'video' : doc?.vimeoUrl || doc?.vimeoPoster ? 'vimeo' : 'image')

export const mediaItem = defineType({
  name: 'mediaItem',
  title: 'Карточка',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'mediaItem' }),
    defineField({
      name: 'description',
      title: 'Описание (показывается на детальной странице)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tags',
      title: 'Теги',
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
      name: 'mediaType',
      title: 'Тип медиа',
      type: 'string',
      options: {
        list: [
          { title: 'Изображение', value: 'image' },
          { title: 'Видео', value: 'video' },
          { title: 'Vimeo', value: 'vimeo' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Изображение',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => effectiveType(document) !== 'image',
    }),
    defineField({
      name: 'video',
      title: 'Видео',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Превью для главной страницы создастся для этого видео автоматически.',
      hidden: ({ document }) => effectiveType(document) !== 'video',
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'Ссылка на Vimeo',
      type: 'url',
      description: 'Вставится на детальной странице как встроенный плеер.',
      hidden: ({ document }) => effectiveType(document) !== 'vimeo',
    }),
    defineField({
      name: 'vimeoPoster',
      title: 'Изображение для главной',
      type: 'image',
      options: { hotspot: true },
      description: 'Показывается в сетке на главной странице.',
      hidden: ({ document }) => effectiveType(document) !== 'vimeo',
    }),
    defineField({
      // Авто-превью для сетки — скрыто из формы, заполняется Action'ом.
      name: 'videoPreview',
      title: 'Video grid preview',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: true,
      readOnly: true,
    }),
  ],
  validation: (rule) =>
    rule.custom((doc) => {
      const type = effectiveType(doc)
      if (type === 'image' && !doc?.image?.asset) return 'Загрузите изображение.'
      if (type === 'video' && !doc?.video?.asset) return 'Загрузите видео.'
      if (type === 'vimeo') {
        if (!doc?.vimeoUrl) return 'Вставьте ссылку на Vimeo.'
        if (!doc?.vimeoPoster?.asset) return 'Загрузите изображение для главной.'
      }
      return true
    }),
  preview: {
    select: {
      description: 'description',
      image: 'image',
      vimeoPoster: 'vimeoPoster',
      vimeoUrl: 'vimeoUrl',
      video: 'video.asset.originalFilename',
    },
    prepare({ description, image, vimeoPoster, vimeoUrl, video }) {
      const subtitle = image ? 'изображение' : vimeoUrl ? 'vimeo' : video ? `видео · ${video}` : '(нет медиа)'
      return {
        title: description || '(без описания)',
        subtitle,
        media: image || vimeoPoster || undefined,
      }
    },
  },
})
