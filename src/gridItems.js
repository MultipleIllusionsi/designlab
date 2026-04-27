// Local media (kept for easy rollback).
// import url1 from './grid_content/1_terminal_video.mp4?url'
// import url2 from './grid_content/2_tabbar_video.mp4?url'
// import url3 from './grid_content/3_contextmenu_video.mp4?url'
// import url4 from './grid_content/4_logotype_picture.jpg?url'
// import url5 from './grid_content/5_emptystate_picture.png?url'
// import url6 from './grid_content/6_contentcard_picture.png?url'
// import url7 from './grid_content/7_audiocard_picture.png?url'
// import url8 from './grid_content/8_resultspillow_video.mp4?url'
// import url9 from './grid_content/9_avatarsstb_picture.png?url'
// import url10 from './grid_content/10_sharingplayer_video.mp4?url'
// import url11 from './grid_content/11_pulltorefresh_video.mp4?url'
// import url12 from './grid_content/12_neurosearchlogo_video.mp4?url'
// import url13 from './grid_content/13_audioposteranimation_video.mp4?url'
// import url14 from './grid_content/14_roomshowreel_video.mp4?url'
// import url15 from './grid_content/15_fontshowreel_video.mp4?url'
// import url16 from './grid_content/16_stolbcommucation_video.mp4?url'
// import url17 from './grid_content/17_illustrationshowreel_video.mp4?url'
// import url18 from './grid_content/18_stblogin_picture.png?url'
// import url19 from './grid_content/19_vpkamediateka_picture.png?url'
// import url20 from './grid_content/20_logintablet_picture.jpg?url'
// import url21 from './grid_content/21_audioempty_video.mp4?url'
// import url22 from './grid_content/22_tabbardownload_video.mp4?url'
// import url23 from './grid_content/23_newyearlogos_picture.jpg?url'
// import url24 from './grid_content/24_kkstbconcept_picture.png?url'
// import url25 from './grid_content/25_minidramashowreel_video.mp4?url'
// import url26 from './grid_content/26_newyearsharing_picture.jpg?url'
// import url27 from './grid_content/27_tamagochi_video.mp4?url'
// import url28 from './grid_content/28_audiovpk_video.mp4?url'

const CLOUD_NAME = 'do56uaw6e'

// Assets live at cloud root (no folder in public_id). publicId must include the
// file extension, e.g. 5_emptystate_picture.png — same shape as "Copy URL" in Media Library.
function cloudinaryAssetUrl({ resourceType, publicId, transform }) {
  const t = transform ? `${transform}/` : ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/${t}${publicId}`
}

function cloudImage(publicId) {
  return {
    type: 'image',
    previewSrc: cloudinaryAssetUrl({
      resourceType: 'image',
      publicId,
      // Grid: keep fast + sharp enough for cards.
      transform: 'f_auto,q_auto,w_900,c_limit',
    }),
    fullSrc: cloudinaryAssetUrl({
      resourceType: 'image',
      publicId,
      // Lightbox: bigger cap while still letting Cloudinary optimize format/quality.
      transform: 'f_auto,q_auto,w_2400,c_limit',
    }),
  }
}

function cloudVideo(publicId) {
  return {
    type: 'video',
    previewSrc: cloudinaryAssetUrl({
      resourceType: 'video',
      publicId,
      // Grid: smaller + lower bitrate.
      transform: 'q_auto:low,w_900,c_limit',
    }),
    fullSrc: cloudinaryAssetUrl({
      resourceType: 'video',
      publicId,
      // Lightbox: higher quality and larger cap.
      transform: 'q_auto,w_1920,c_limit',
    }),
  }
}

/** @typedef {{ type: 'image' | 'video', previewSrc: string, fullSrc: string }} GridMedia */

/**
 * @param {string} id
 * @param {('interface'|'motion'|'graphic')[]} tags
 * @param {string} alt
 * @param {GridMedia} media
 * @param {{ title: string, description: string }} meta
 */
function item(id, tags, alt, media, meta) {
  return {
    id,
    tags,
    alt,
    media,
    title: meta.title,
    description: meta.description,
  }
}

export const GRID_ITEMS = [
  item('1', ['interface'], 'Terminal', cloudVideo('1_terminal_video.mp4'), {
    title: 'Terminal',
    description:
      'An animation of terminal for an intermediate state of payment process',
  }),
  item('2', ['interface', 'motion'], 'Tab Bar', cloudVideo('2_tabbar_video.mp4'), {
    title: 'Tab Bar',
    description:
      'An animated tabbar with our special icon deformation',
  }),
  item('3', ['graphic'], 'Logotype refresh', cloudImage('4_logotype_picture.jpg'), {
    title: 'Logotype refresh',
    description:
      'Visual refresh of ivi logotype',
  }),
  item('4', ['motion'], 'Room showreel', cloudVideo('14_roomshowreel_video.mp4'), {
    title: 'Room showreel',
    description:
      'A part of the big product showreel [_link_]',
  }),
  item('5', ['interface', 'graphic'], 'Empty state', cloudImage('5_emptystate_picture.png'), {
    title: 'Empty state',
    description:
      'Friendly illustration that indicates «There is no internet»',
  }),
  item('6', ['interface'], 'Content card', cloudImage('6_contentcard_picture.png'), {
    title: 'Content card',
    description:
      'A detail card of series with accent on trailer and visual',
  }),
  item('7', ['interface'], 'Audio card', cloudImage('7_audiocard_picture.png'), {
    title: 'Audio card',
    description:
      'A detail card of audio content with our brand gradients on the background',
  }),
  item('8', ['motion', 'graphic'], 'Illustration showreel', cloudVideo('17_illustrationshowreel_video.mp4'), {
    title: 'Illustration showreel',
    description:
      'A part of the big product showreel [_link_]',
  }),
  item('9', ['interface'], 'Context menu', cloudVideo('3_contextmenu_video.mp4'), {
    title: 'Context menu',
    description:
      'An app menu with frequent actions that opens on long tap gesture',
  }),
  item('10', ['interface'], 'TV child avatars', cloudImage('9_avatarsstb_picture.png'), {
    title: 'TV child avatars',
    description:
      'Concept of picking avatar in a child profile on TV',
  }),
  item('11', ['motion', 'graphic', 'interface'], 'Endscreen visuals', cloudVideo('8_resultspillow_video.mp4'), {
    title: 'Endscreen visuals',
    description:
      'An inflated pillows we are using in endscreens (after buying subscription, for example)',
  }),
  item('12', ['motion'], 'Audio poster animation', cloudVideo('13_audioposteranimation_video.mp4'), {
    title: 'Audio poster animation',
    description:
      'A looping effect that makes static poster feel alive. Made with code, actually.',
  }),
  item('13', ['motion', 'graphic'], 'Font showreel', cloudVideo('15_fontshowreel_video.mp4'), {
    title: 'Font showreel',
    description:
      'A part of the big font showreel [_link_]',
  }),
  item('14', ['interface'], 'TV login', cloudImage('18_stblogin_picture.png'), {
    title: 'TV login',
    description:
      'A welcome page on TV with focus on quick sign-in flow (phone-TV bridge)',
  }),
  item('15', ['interface', 'motion'], 'Audio promo video', cloudVideo('28_audiovpk_video.mp4'), {
    title: 'Audio promo video',
    description:
      "A video we've used for promo of new audio content",
  }),
  item('16', ['graphic'], 'Amediateka promo', cloudImage('19_vpkamediateka_picture.png'), {
    title: 'Amediateka promo',
    description:
      'A promo visual for Amediateka — one of the biggest subscription inside ivi',
  }),
  item('17', ['interface', 'graphic'], 'Detail series card on TV', cloudImage('24_kkstbconcept_picture.png'), {
    title: 'Detail series card on TV',
    description:
      'A concept of series card with focus on progress of viewing',
  }),
  item('18', ['interface', 'graphic'], 'Login • App & Web', cloudImage('20_logintablet_picture.jpg'), {
    title: 'Login • App & Web',
    description:
      'A refresh and simplified login flow on web & app platforms',
  }),
  item('19', ['interface', 'motion'], 'Audio empty state', cloudVideo('21_audioempty_video.mp4'), {
    title: 'Audio empty state',
    description:
      'An animated empty state when a user has no audio content added yet',
  }),
  item('20', ['graphic'], 'New year logo', cloudImage('23_newyearlogos_picture.jpg'), {
    title: 'New year logo',
    description:
      'New year representation of ivi logo',
  }),
  item('21', ['graphic', 'motion'], 'Seeking for new talents', cloudVideo('16_stolbcommucation_video.mp4'), {
    title: 'Seeking for new talents',
    description:
      'A video for HR, to find new talents for design team',
  }),
  item('22', ['interface', 'motion'], 'Tab bar downloading', cloudVideo('22_tabbardownload_video.mp4'), {
    title: 'Tab bar downloading',
    description:
      'A visual indicator of current progress in app tabbar',
  }),
  item('23', ['motion', 'graphic'], 'Neuro search logo', cloudVideo('12_neurosearchlogo_video.mp4'), {
    title: 'Neuro search logo',
    description:
      'An identity for loader in new neuro search',
  }),
  item('24', ['interface', 'graphic'], 'New year sharing button', cloudImage('26_newyearsharing_picture.jpg'), {
    title: 'New year sharing button',
    description:
      "A festive visual for subscription sharing in product. Before this idea we've tried piece of olivier salad :)",
  }),
  item('25', ['motion', 'graphic'], 'Tamagochi', cloudVideo('27_tamagochi_video.mp4'), {
    title: 'Tamagochi',
    description:
      'A concept of character who lives inside app',
  }),
  item('26', ['motion'], 'Mini drama showreel', cloudVideo('25_minidramashowreel_video.mp4'), {
    title: 'Mini drama showreel',
    description:
      'A part of the minidramas presentation video [_link_]',
  }),
  item('27', ['motion', 'interface'], 'Pull-to-refresh', cloudVideo('11_pulltorefresh_video.mp4'), {
    title: 'Pull-to-refresh',
    description:
      'A concept of pull-to-refresh feature in app, based on idea of showing different stylish logotypes',
  }),
  item('28', ['motion', 'interface'], 'Mutual view', cloudVideo('10_sharingplayer_video.mp4'), {
    title: 'Mutual view',
    description:
      'A feature for a mutual view of content in an one quick gesture',
  }),
  item('29', ['motion', 'graphic'], 'Meetup welcome', cloudVideo('meetup_welcome.mp4'), {
    title: 'Meetup welcome',
    description:
      'Our intro video for the inner design meetup',
  }),
  item('30', ['interface', 'graphic'], 'Minidramas intro', cloudImage('vpk_minidramas.png'), {
    title: 'Minidramas intro',
    description:
      'An app comminucation to present a new type of content — minidramas',
  }),
  item('31', ['motion', 'graphic'], 'Sad Juja', cloudVideo('juja_sad_toys.mp4'), {
    title: 'Sad Juja',
    description:
      'An animation of our character for empty state in design system',
  }),
  item('32', ['graphic'], 'Lying Juja', cloudImage('juja_lying.png'), {
    title: 'Lying Juja',
    description:
      'An our character in a promo activities',
  }),
  item('33', ['graphic'], "Juja's back", cloudImage('juja_back.png'), {
    title: "Juja's back",
    description:
      'An our character in a promo activities',
  }),
  item('34', ['graphic'], 'Carbine', cloudImage('3d_carbine.png'), {
    title: 'Carbine',
    description:
      'An illustration for a promo subscription',
  }),
  item('35', ['graphic'], 'Cover for inner activity', cloudImage('communication_composition.png'), {
    title: 'Cover for inner activity',
    description:
      'Thats kinda nice',
  }),
  item('36', ['interface', 'graphic'], '3D numbers', cloudImage('3d_numbers.png'), {
    title: '3D numbers',
    description:
      "A list of illustration we've used for a giveaway",
  }),
  item('37', ['graphic'], 'Bowling', cloudImage('3d_bowling.png'), {
    title: 'Bowling',
    description:
      'Another nice promo illustration',
  }),
  item('38', ['graphic'], 'Jelly', cloudImage('3d_jelly.png'), {
    title: 'Jelly',
    description:
      'Another nice promo illustration',
  }),
  item('39', ['graphic'], 'Camera seeking', cloudImage('3d_camera.png'), {
    title: 'Camera seeking',
    description:
      'An illustration for an inner activity',
  }),
  item('40', ['interface', 'graphic'], '3D app icons', cloudImage('3d_icons.png'), {
    title: '3D app icons',
    description:
    "A list of icons we are using in our interfaces",
  }),
  item('41', ['graphic'], 'Abaddon character', cloudImage('3d_abaddon.png'), {
    title: 'Abaddon character',
    description:
      'Our cute pigeon for promo',
  }),
  item('42', ['graphic'], 'Lucifer character', cloudImage('3d_lucifer.png'), {
    title: 'Lucifer character',
    description:
      'Our fat dog for promo',
  }),
  item('43', ['graphic'], 'Belial character', cloudImage('3d_belial.png'), {
    title: 'Belial character',
    description:
      'Our weirdo fish for promo',
  }),
]
