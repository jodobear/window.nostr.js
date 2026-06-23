# window.nostr.js

a small `<script>` you can drop in any page that already uses [NIP-07](https://nips.nostr.com/7) and make it also work with [NIP-46](https://nips.nostr.com/46) automatically when the user doesn't have an extension installed.

It adds a small floating button on the side of the window that users can use to create Nostr accuonts or connect to their NIP-46 bunkers.

## How to use it

Include `<script src="https://cdn.jsdelivr.net/npm/window.nostr.js/dist/window.nostr.min.js"></script>` in your HTML and proceed to use [`window.nostr`](https://nips.nostr.com/7) normally.

## Customization
The script supports optional `data-*` attributes on the `<script>` tag to personalize the design:

```
<script src="https://cdn.jsdelivr.net/npm/window.nostr.js/dist/window.nostr.min.js"
  data-accent="green"
  data-position="bottom"
  data-start-hidden
  data-compact-mode
  data-relays='["wss://bucket.coracle.social","wss://relay.nsec.app"]'
  data-app-name='example app
  data-app-image='https://example.com/logo.png'
></script>
```

| Attribute           | Description                                                                            |
| -----------         | -------------                                                                          |
| `data-accent`       | Accent color: `cyan` (default), `green`, `purple`, `red`, `orange`, `neutral`, `stone` |
| `data-position`     | Widget position: `bottom` (default is top)                                             |
| `data-start-hidden` | Hide minimized widget until user connects (for pages with custom login buttons)        |
| `data-compact-mode` | Show minimized widget in compact form                                                  |
| `data-dof`          | Disable automatic overflow fix on mobile                                               |
| `data-relays`       | JSON array of relay URLs for QR code login                                             |
| `data-app-name`     | Name of the current page that is sent to bunker signers, defaults to the page hostname |
| `data-app-image`    | Logo of the current app that is sent to bunker signers, defaults to the page favicon   |
| `data-app-url`      | Defaults to the current URL (cleaned), if specified must belong to the current domain  |

## Bookmarklet

If a website has opted to not include this, but you like it, you can still use it on the website. Just add this to your browser bookmarks and click on it to load the widget on any website:

```
javascript:void((function(){var%20e=document.createElement('script');e.setAttribute('src','https://cdn.jsdelivr.net/npm/window.nostr.js/dist/window.nostr.min.js');document.body.appendChild(e)})())
```

## Demo videos

https://github.com/fiatjaf/window.nostr.js/assets/1653275/eacb1302-bbfd-4d28-aec2-dbe231f92c53

https://github.com/fiatjaf/window.nostr.js/assets/1653275/8c2546f1-439a-4a1b-beb6-af540de37601
