import url1 from './grid_content/1_terminal_video.mp4?url'
import url2 from './grid_content/2_tabbar_video.mp4?url'
import url3 from './grid_content/3_contextmenu_video.mp4?url'
import url4 from './grid_content/4_logotype_picture.jpg?url'
import url5 from './grid_content/5_emptystate_picture.png?url'
import url6 from './grid_content/6_contentcard_picture.png?url'
import url7 from './grid_content/7_audiocard_picture.png?url'
import url8 from './grid_content/8_resultspillow_video.mp4?url'
import url9 from './grid_content/9_avatarsstb_picture.png?url'
import url10 from './grid_content/10_sharingplayer_video.mp4?url'
import url11 from './grid_content/11_pulltorefresh_video.mp4?url'
import url12 from './grid_content/12_neurosearchlogo_video.mp4?url'
import url13 from './grid_content/13_audioposteranimation_video.mp4?url'

/** @typedef {{ type: 'image' | 'video', src: string }} GridMedia */

/**
 * @param {string} id
 * @param {('interface'|'motion'|'graphic')[]} tags
 * @param {string} alt
 * @param {GridMedia} media
 * @param {{ columnSpanAll?: boolean }} [opts]
 */
function item(id, tags, alt, media, opts = {}) {
  return { id, tags, alt, media, ...opts }
}

export const GRID_ITEMS = [
  item('1', ['interface'], 'Terminal', { type: 'video', src: url1 }),
  item('2', ['interface', 'motion'], 'Tab bar', { type: 'video', src: url2 }),
  item('3', ['interface'], 'Context menu', { type: 'video', src: url3 }),
  item('4', ['graphic'], 'Logotype', { type: 'image', src: url4 }),
  item('5', ['interface', 'graphic'], 'Empty state', { type: 'image', src: url5 }),
  item('6', ['interface'], 'Content card', { type: 'image', src: url6 }),
  item('7', ['interface'], 'Audio card', { type: 'image', src: url7 }),
  item('8', ['motion', 'graphic', 'interface'], 'Results pillow', { type: 'video', src: url8 }),
  item('9', ['interface'], 'Avatars STB', { type: 'image', src: url9 }),
  item('10', ['motion', 'interface'], 'Sharing player', { type: 'video', src: url10 }),
  // item('9', ['interface'], 'Avatars STB', { type: 'image', src: url9 }, { columnSpanAll: true }),
  item('11', ['motion', 'interface'], 'Pull to refresh', { type: 'video', src: url11 }),
  item('12', ['motion', 'graphic'], 'Neuro search logo', { type: 'video', src: url12 }),
  item('13', ['motion'], 'Audio poster animation', { type: 'video', src: url13 }),
]
