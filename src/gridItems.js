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
import url14 from './grid_content/14_roomshowreel_video.mp4?url'
import url15 from './grid_content/15_fontshowreel_video.mp4?url'
import url16 from './grid_content/16_stolbcommucation_video.mp4?url'
import url17 from './grid_content/17_illustrationshowreel_video.mp4?url'
import url18 from './grid_content/18_stblogin_picture.png?url'
import url19 from './grid_content/19_vpkamediateka_picture.png?url'
import url20 from './grid_content/20_logintablet_picture.jpg?url'
import url21 from './grid_content/21_audioempty_video.mp4?url'
import url22 from './grid_content/22_tabbardownload_video.mp4?url'
import url23 from './grid_content/23_newyearlogos_picture.jpg?url'
import url24 from './grid_content/24_kkstbconcept_picture.png?url'
import url25 from './grid_content/25_minidramashowreel_video.mp4?url'
import url26 from './grid_content/26_newyearsharing_picture.jpg?url'
import url27 from './grid_content/27_tamagochi_video.mp4?url'
import url28 from './grid_content/28_audiovpk_video.mp4?url'

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
  item('4', ['graphic'], 'Logotype', { type: 'image', src: url4 }),
  item('14', ['motion'], 'Room showreel', { type: 'video', src: url14 }),
  item('5', ['interface', 'graphic'], 'Empty state', { type: 'image', src: url5 }),
  item('6', ['interface'], 'Content card', { type: 'image', src: url6 }),
  item('7', ['interface'], 'Audio card', { type: 'image', src: url7 }),
  item('17', ['motion', 'graphic'], 'Illustration showreel', { type: 'video', src: url17 }),
  item('3', ['interface'], 'Context menu', { type: 'video', src: url3 }),
  item('9', ['interface'], 'Avatars STB', { type: 'image', src: url9 }),
  item('8', ['motion', 'graphic', 'interface'], 'Results pillow', { type: 'video', src: url8 }),
  item('13', ['motion'], 'Audio poster animation', { type: 'video', src: url13 }),
  item('15', ['motion', 'graphic'], 'Font showreel', { type: 'video', src: url15 }),
  item('18', ['interface', 'graphic'], 'STB login', { type: 'image', src: url18 }),
  item('28', ['interface', 'motion'], 'Audio VPK', { type: 'video', src: url28 }),
  item('19', ['interface', 'graphic'], 'VPK mediateka', { type: 'image', src: url19 }),
  item('24', ['interface', 'graphic'], 'KKS TB concept', { type: 'image', src: url24 }),
  item('20', ['interface'], 'Login tablet', { type: 'image', src: url20 }),
  item('21', ['interface', 'motion'], 'Audio empty', { type: 'video', src: url21 }),
  item('23', ['graphic'], 'New year logos', { type: 'image', src: url23 }),
  item('16', ['interface', 'motion'], 'STB communication', { type: 'video', src: url16 }),
  item('22', ['interface', 'motion'], 'Tab bar download', { type: 'video', src: url22 }),
  item('12', ['motion', 'graphic'], 'Neuro search logo', { type: 'video', src: url12 }),
  item('26', ['graphic'], 'New year sharing', { type: 'image', src: url26 }),
  item('27', ['motion', 'graphic'], 'Tamagochi', { type: 'video', src: url27 }),
  item('25', ['motion'], 'Mini drama showreel', { type: 'video', src: url25 }),
  item('11', ['motion', 'interface'], 'Pull to refresh', { type: 'video', src: url11 }),
  item('10', ['motion', 'interface'], 'Sharing player', { type: 'video', src: url10 }),
]
