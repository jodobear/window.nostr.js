import styles from './app.css?inline'
import App from './App.svelte'
import * as pomegranate from './pomegranate'

// To customize the widget add data-* attributes to the <script> tag:
// <script src='wnj.js' data-accent='green' data-position='bottom' data-start-hidden></script>
// Supported accent values: cyan (default), green, purple, red, orange, neutral, stone

let script =
  document.currentScript || document.querySelector('script[data-wnj]')
if (!script) {
  const scripts = document.querySelectorAll('script')
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i]
    if (s.src === import.meta.url) {
      script = s
      break
    }
  }
}

const d = script?.dataset || {}
const win = window as any
const p = win.wnjParams || {}

const pg = pomegranate as any
if (d.pomegranateCentralUrl) {
  pg.POMEGRANATE_CENTRAL_URL = d.pomegranateCentralUrl
}
if (d.pomegranateOperators) {
  try { pg.POMEGRANATE_OPERATORS = JSON.parse(d.pomegranateOperators) } catch { /***/ }
}
if (d.pomegranateThreshold) {
  pg.POMEGRANATE_THRESHOLD = parseInt(d.pomegranateThreshold, 10)
}

win.destroyWnj = () => {
  setTimeout(() => {
    app.$destroy()
  }, 1)
}

const base = document.createElement('div')
base.style.zIndex = '90000'
document.body.appendChild(base)

const mountPoint = document.createElement('div')
mountPoint.id = 'wnj'

const style = document.createElement('style')
style.innerHTML = styles

const shadowRoot = base.attachShadow({mode: 'open'})
shadowRoot.appendChild(mountPoint)
shadowRoot.appendChild(style)

let relays: string[] | undefined
try {
  relays = JSON.parse(d.relays || '')
} catch {
  /***/
}

const app = new App({
  target: mountPoint,
  props: {
    accent: d.accent || p.accent || 'cyan',
    position: (d.position || p.position) === 'bottom' ? 'bottom' : 'top',
    startHidden: d.startHidden ? d.startHidden !== 'false' : false,
    compactMode: d.compactMode ? d.compactMode !== 'false' : false,
    relays: relays ||
      p.nostrConnectRelays || [
        'wss://bucket.coracle.social',
        'wss://relay.ditto.pub',
        'wss://nos.lol',
        'wss://relay.primal.net'
      ],
    appMetadata:
      d.appName || d.appImage || d.appUrl
        ? {
            name: d.appName,
            image: d.appImage,
            url: d.appUrl
          }
        : p.appMetadata || {}
  }
})

if (d.dof === undefined && !p.disableOverflowFix) {
  // Inject on the host page a style to avoid weird scrolling on the
  // right/bottom on mobile, if the underlying page has some horizontal
  // scrolling
  const styleElement = document.createElement('style')
  const cssCode = `
    html, body {
      overflow: auto;
      height: 100%;
    }
  `
  styleElement.innerHTML = cssCode
  document.head.appendChild(styleElement)
}

export default app
