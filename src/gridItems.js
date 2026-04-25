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
      'A focused shell-style interface for power users on the big screen.\nTypography and motion stay calm under dense information and frequent updates.\nThe layout keeps commands readable from the couch.',
  }),
  item('2', ['interface', 'motion'], 'Tab bar', cloudVideo('2_tabbar_video.mp4'), {
    title: 'Tab bar',
    description:
      'Primary navigation for TV: clear hierarchy, generous hit targets, and state you can read at a glance.\nSubtle motion links selection to content so orientation never breaks.\nBuilt to survive long sessions and quick channel-style jumps.',
  }),
  item('4', ['graphic'], 'Logotype', cloudImage('4_logotype_picture.jpg'), {
    title: 'Logotype',
    description:
      'A refined mark and lockups tuned for both crisp UI and large marketing surfaces.\nContrast and clear space protect recognition on any background.\nScales from favicon to billboard without losing character.',
  }),
  item('14', ['motion'], 'Room showreel', cloudVideo('14_roomshowreel_video.mp4'), {
    title: 'Room showreel',
    description:
      'A tight motion piece showcasing spatial hierarchy and light across the product.\nPacing is deliberate: enough room to read each frame on TV safe areas.\nBuilt as a template you can re-cut for social and in-app surfaces.',
  }),
  item('5', ['interface', 'graphic'], 'Empty state', cloudImage('5_emptystate_picture.png'), {
    title: 'Empty state',
    description:
      'Friendly illustration plus copy that turns “nothing here” into a next step.\nThe scene stays on-brand while leaving UI chrome to do the heavy lifting.\nDesigned so localization does not break balance or line lengths.',
  }),
  item('6', ['interface'], 'Content card', cloudImage('6_contentcard_picture.png'), {
    title: 'Content card',
    description:
      'A dense card for titles, metadata, and actions in a single glanceable unit.\nHierarchy separates hero art from text so lists stay scannable on TV.\nSpacing matches the system grid to align with rails and carousels.',
  }),
  item('7', ['interface'], 'Audio card', cloudImage('7_audiocard_picture.png'), {
    title: 'Audio card',
    description:
      'A compact pattern for albums and episodes with playback affordances in view.\nArtwork, titles, and controls read clearly at a distance on STB.\nReused wherever audio content appears next to video-first layouts.',
  }),
  item('17', ['motion', 'graphic'], 'Illustration showreel', cloudVideo('17_illustrationshowreel_video.mp4'), {
    title: 'Illustration showreel',
    description:
      'Character-led motion and illustration in one reel for product marketing.\nStyle is consistent: bold color, clear silhouettes, readable expressions.\nCuts are timed for both silent booth loops and sound-on cuts.',
  }),
  item('3', ['interface'], 'Context menu', cloudVideo('3_contextmenu_video.mp4'), {
    title: 'Context menu',
    description:
      'A radial-style menu that keeps frequent actions at thumb reach on the remote.\nFocus and depth cues make the current selection unmistakable in motion.\nDies away quickly so it never competes with the main canvas.',
  }),
  item('9', ['interface'], 'Avatars STB', cloudImage('9_avatarsstb_picture.png'), {
    title: 'Avatars STB',
    description:
      'Profile avatars and picker layout tuned for 10-foot interfaces.\nPresents many identities without crowding; selection stays obvious in grids.\nPairs with account switching and family profiles across the app.',
  }),
  item('8', ['motion', 'graphic', 'interface'], 'Results pillow', cloudVideo('8_resultspillow_video.mp4'), {
    title: 'Results pillow',
    description:
      'A floating result surface for search: fast to scan, hard to miss.\nMotion softens entry so results feel like a response, not a hard cut.\nTies metadata, artwork, and actions in one cohesive blob.',
  }),
  item('13', ['motion'], 'Audio poster animation', cloudVideo('13_audioposteranimation_video.mp4'), {
    title: 'Audio poster animation',
    description:
      'A looping audio poster that makes static key art feel alive in rows.\nKeeps file weight sensible while still selling mood and energy.\nDesigned to not fight neighboring posters or autoplaying trailers.',
  }),
  item('15', ['motion', 'graphic'], 'Font showreel', cloudVideo('15_fontshowreel_video.mp4'), {
    title: 'Font showreel',
    description:
      'Showcases the brand type system in large display and long reading blocks.\nRhythm, spacing, and contrast are demonstrated on real product strings.\nUseful as a spec for teams picking weights for new surfaces.',
  }),
  item('18', ['interface', 'graphic'], 'STB login', cloudImage('18_stblogin_picture.png'), {
    title: 'STB login',
    description:
      'Sign-in and pairing flows that stay simple on a TV remote and phone bridge.\nClear steps reduce support load; error states are plain language first.\nVisuals stay calm so the living room does not feel like a kiosk.',
  }),
  item('28', ['interface', 'motion'], 'Audio VPK', cloudVideo('28_audiovpk_video.mp4'), {
    title: 'Audio VPK',
    description:
      'Audio-first vertical product kit for editorial rails and carousels.\nMotion highlights focus without overshooting the safe area on TV.\nPresents titles, play state, and upsell in one coherent loop.',
  }),
  item('19', ['interface', 'graphic'], 'VPK mediateka', cloudImage('19_vpkamediateka_picture.png'), {
    title: 'VPK mediateka',
    description:
      'Library browsing pattern with dense grids and long titles handled gracefully.\nArtwork and badges align so repeat visits stay visually predictable.\nScales to collections, favorites, and mixed content types.',
  }),
  item('24', ['interface', 'graphic'], 'KKS TB concept', cloudImage('24_kkstbconcept_picture.png'), {
    title: 'KKS TB concept',
    description:
      'A concept for kids’ content: playful without abandoning the core design language.\nColor, iconography, and type remain legible in animated browsing.\nExplores how parent controls might appear without breaking the mood.',
  }),
  item('20', ['interface'], 'Login tablet', cloudImage('20_logintablet_picture.jpg'), {
    title: 'Login tablet',
    description:
      'A tablet-oriented login and QR bridge layout matching the main TV app.\nLarge type and obvious affordances for fast pairing in the same room.\nStays consistent with STB so users trust they are in the right flow.',
  }),
  item('21', ['interface', 'motion'], 'Audio empty', cloudVideo('21_audioempty_video.mp4'), {
    title: 'Audio empty',
    description:
      'An empty state when the audio library has no items yet, with motion in the key art.\nGuides the user to add or explore without sounding apologetic.\nKeeps layout stable when the list refills to avoid jarring shifts.',
  }),
  item('23', ['graphic'], 'New year logos', cloudImage('23_newyearlogos_picture.jpg'), {
    title: 'New year logos',
    description:
      'Seasonal mark explorations and treatments for campaigns and in-app takeovers.\nReadability and animation hooks are considered for TV end tags.\nProvides a small kit of alternates for partners and local markets.',
  }),
  item('16', ['interface', 'motion'], 'STB communication', cloudVideo('16_stolbcommucation_video.mp4'), {
    title: 'STB communication',
    description:
      'System toasts, banners, and system-level messaging on the set-top box.\nStacking, priority, and focus rules keep critical alerts from hiding each other.\nVisual language stays distinct from editorial content in the app.',
  }),
  item('22', ['interface', 'motion'], 'Tab bar download', cloudVideo('22_tabbardownload_video.mp4'), {
    title: 'Tab bar download',
    description:
      'Download and offline affordances in the same tab bar you already use daily.\nProgress, errors, and completion read clearly in peripheral vision.\nMotion nudges attention when an action needs confirmation.',
  }),
  item('12', ['motion', 'graphic'], 'Neuro search logo', cloudVideo('12_neurosearchlogo_video.mp4'), {
    title: 'Neuro search logo',
    description:
      'A kinetic logo for AI search moments: short loop, high recall, on-brand color.\nDesigned to work over varied thumbnails without crushing contrast.\nPairs with a simple logotype for longer editorial beats.',
  }),
  item('26', ['graphic'], 'New year sharing', cloudImage('26_newyearsharing_picture.jpg'), {
    title: 'New year sharing',
    description:
      'A festive sharing visual with enough negative space for partner logos.\nWorks in square and wide crops for social and in-player cards.\nKeeps the brand voice warm without clashing with UI around it.',
  }),
  item('27', ['motion', 'graphic'], 'Tamagochi', cloudVideo('27_tamagochi_video.mp4'), {
    title: 'Tamagochi',
    description:
      'Playful character motion that sits beside real product UI, not on top of it.\nCute, fast loops for campaigns and easter-egg style moments in the app.\nTiming tuned so it is delightful at second three and still at minute one.',
  }),
  item('25', ['motion'], 'Mini drama showreel', cloudVideo('25_minidramashowreel_video.mp4'), {
    title: 'Mini drama showreel',
    description:
      'A compact reel for short-form vertical drama: hooks in the first second.\nCaption-safe framing for silent autoplay in feeds and pre-rolls.\nStylistically linked to the main show packaging for seamless jumps.',
  }),
  item('11', ['motion', 'interface'], 'Pull to refresh', cloudVideo('11_pulltorefresh_video.mp4'), {
    title: 'Pull to refresh',
    description:
      'Pull-to-refresh behavior adapted for the TV remote, not a touch screen.\nSatisfying motion at the end of a list or rail without disorienting jumps.\nMicro-interaction hints the system is working even on slow networks.',
  }),
  item('10', ['motion', 'interface'], 'Sharing player', cloudVideo('10_sharingplayer_video.mp4'), {
    title: 'Sharing player',
    description:
      'Sharing flow and player strip that make “send this” feel one gesture away.\nBalances marketing moments with a player that does not feel boxed in.\nMotion connects share targets to the content currently on screen.',
  }),
]
