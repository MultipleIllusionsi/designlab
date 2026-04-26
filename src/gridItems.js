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
      'An animation of terminal for intermediate state of payment',
  }),
  item('2', ['interface', 'motion'], 'Tab bar', cloudVideo('2_tabbar_video.mp4'), {
    title: 'Tab Bar',
    description:
      'An animated tabbar with our special icon deformation',
  }),
  item('3', ['graphic'], 'Logotype', cloudImage('4_logotype_picture.jpg'), {
    title: 'Logotype',
    description:
      'Visual refresh of our logotype',
  }),
  item('4', ['motion'], 'Room showreel', cloudVideo('14_roomshowreel_video.mp4'), {
    title: 'Room showreel',
    description:
      'Part of the big product showreel [_link_]',
  }),
  item('5', ['interface', 'graphic'], 'Empty state', cloudImage('5_emptystate_picture.png'), {
    title: 'Empty state',
    description:
      'Friendly illustration that indicates «nothing here»',
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
      'Character-led motion and illustration in one reel for product marketing',
  }),
  item('9', ['interface'], 'Context menu', cloudVideo('3_contextmenu_video.mp4'), {
    title: 'Context menu',
    description:
      'A radial-style menu that keeps frequent actions at thumb reach on the remote',
  }),
  item('10', ['interface'], 'Avatars STB', cloudImage('9_avatarsstb_picture.png'), {
    title: 'Avatars STB',
    description:
      'Profile avatars and picker layout tuned for 10-foot interfaces',
  }),
  item('11', ['motion', 'graphic', 'interface'], 'Results pillow', cloudVideo('8_resultspillow_video.mp4'), {
    title: 'Results pillow',
    description:
      'A floating result surface for search: fast to scan, hard to miss',
  }),
  item('12', ['motion'], 'Audio poster animation', cloudVideo('13_audioposteranimation_video.mp4'), {
    title: 'Audio poster animation',
    description:
      'A looping audio poster that makes static key art feel alive in rows',
  }),
  item('13', ['motion', 'graphic'], 'Font showreel', cloudVideo('15_fontshowreel_video.mp4'), {
    title: 'Font showreel',
    description:
      'Showcases the brand type system in large display and long reading blocks',
  }),
  item('14', ['interface', 'graphic'], 'STB login', cloudImage('18_stblogin_picture.png'), {
    title: 'STB login',
    description:
      'Sign-in and pairing flows that stay simple on a TV remote and phone bridge',
  }),
  item('15', ['interface', 'motion'], 'Audio VPK', cloudVideo('28_audiovpk_video.mp4'), {
    title: 'Audio VPK',
    description:
      'Audio-first vertical product kit for editorial rails and carousels',
  }),
  item('16', ['interface', 'graphic'], 'VPK mediateka', cloudImage('19_vpkamediateka_picture.png'), {
    title: 'VPK mediateka',
    description:
      'Library browsing pattern with dense grids and long titles handled gracefully',
  }),
  item('17', ['interface', 'graphic'], 'KKS TB concept', cloudImage('24_kkstbconcept_picture.png'), {
    title: 'KKS TB concept',
    description:
      'A concept for kids’ content: playful without abandoning the core design language',
  }),
  item('18', ['interface'], 'Login tablet', cloudImage('20_logintablet_picture.jpg'), {
    title: 'Login tablet',
    description:
      'A tablet-oriented login and QR bridge layout matching the main TV app',
  }),
  item('19', ['interface', 'motion'], 'Audio empty', cloudVideo('21_audioempty_video.mp4'), {
    title: 'Audio empty',
    description:
      'An empty state when the audio library has no items yet, with motion in the key art',
  }),
  item('20', ['graphic'], 'New year logos', cloudImage('23_newyearlogos_picture.jpg'), {
    title: 'New year logos',
    description:
      'Seasonal mark explorations and treatments for campaigns and in-app takeovers',
  }),
  item('21', ['interface', 'motion'], 'STB communication', cloudVideo('16_stolbcommucation_video.mp4'), {
    title: 'STB communication',
    description:
      'System toasts, banners, and system-level messaging on the set-top box',
  }),
  item('22', ['interface', 'motion'], 'Tab bar download', cloudVideo('22_tabbardownload_video.mp4'), {
    title: 'Tab bar download',
    description:
      'Download and offline affordances in the same tab bar you already use daily',
  }),
  item('23', ['motion', 'graphic'], 'Neuro search logo', cloudVideo('12_neurosearchlogo_video.mp4'), {
    title: 'Neuro search logo',
    description:
      'A kinetic logo for AI search moments: short loop, high recall, on-brand color',
  }),
  item('24', ['graphic'], 'New year sharing', cloudImage('26_newyearsharing_picture.jpg'), {
    title: 'New year sharing',
    description:
      'A festive sharing visual with enough negative space for partner logos',
  }),
  item('25', ['motion', 'graphic'], 'Tamagochi', cloudVideo('27_tamagochi_video.mp4'), {
    title: 'Tamagochi',
    description:
      'Playful character motion that sits beside real product UI, not on top of it',
  }),
  item('26', ['motion'], 'Mini drama showreel', cloudVideo('25_minidramashowreel_video.mp4'), {
    title: 'Mini drama showreel',
    description:
      'A compact reel for short-form vertical drama: hooks in the first second',
  }),
  item('27', ['motion', 'interface'], 'Pull to refresh', cloudVideo('11_pulltorefresh_video.mp4'), {
    title: 'Pull to refresh',
    description:
      'Pull-to-refresh behavior adapted for the TV remote, not a touch screen',
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
  item('31', ['motion', 'graphic'], 'Juja #1', cloudVideo('juja_sad_toys.mp4'), {
    title: 'Sad Juja',
    description:
      'An animation of our character for empty state in design system',
  }),
  item('32', ['graphic'], 'Juja #2', cloudImage('juja_lying.png'), {
    title: 'Lying Juja',
    description:
      'An our character in a promo activities',
  }),
  item('33', ['graphic'], 'Juja #3', cloudImage('juja_back.png'), {
    title: 'Juja back',
    description:
      'An our character in a promo activities',
  }),
  item('34', ['graphic'], 'Carbine', cloudImage('3d_carbine.png'), {
    title: 'Carbine',
    description:
      'An illustration for a promo subscription',
  }),
  item('35', ['graphic'], 'Cover of inner activity', cloudImage('communication_composition.png'), {
    title: 'Cover of inner activity',
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
