# TravelSplit design prototype

Latest design: beige light theme, brown dark theme, RU / EN, responsive desktop and mobile layouts. Includes trips, bookings, visited places map and forms.

This standalone HTML/CSS/JavaScript prototype belongs in design-prototypes/travelsplit. It does not replace the existing frontend/ React + TypeScript application and is not connected to the API. Sample data is stored in the browser.

## Run

From this directory run `npm start` with Node.js 18+. No package installation is needed. Open http://127.0.0.1:4173 . Alternatively run `python3 -m http.server 4173 --directory dist`.

Use HTTP rather than opening index.html directly: the map and PWA need an HTTP origin.

## Team workflow

Work on a separate branch. Test before merging to main and open a Pull Request. Read docs/architecture-v0.md in the main repository before porting this design into React. Preserve the API contracts.

## Palettes

Light: #f1eae0 with dark green text and brown accents. Dark: #28211c with cream text and copper accents. Theme and language preferences persist in the browser.

## Источники и лицензии

Фотографии: Unsplash, изображения `photo-1464822759023-fed622ff2c3b`, `photo-1472396961693-142e6e269027`, `photo-1516483638261-f4dbaf036963`, `photo-1493976040374-85c8e12f0c0e`. Лицензия: https://unsplash.com/license . Фотографии иллюстрируют настроение, а не точное местоположение конкретного маршрута.

Шрифты Cormorant Garamond и Manrope: Google Fonts, SIL Open Font License. Тексты лицензий в `dist/assets/`.

Карта: Natural Earth world boundaries, копия GeoJSON из https://github.com/holtzy/D3-graph-gallery/blob/master/DATA/world.geojson . Картографические границы обобщены и могут не отражать текущие административные изменения; карта предназначена для личных отметок.

Код интерфейса можно свободно изменять и использовать в своём проекте. Права на сторонние материалы определяются их лицензиями.


## Interactive atlas update

The atlas now includes a satellite route explorer inspired by the supplied references: a translucent sidebar, dotted routes, interactive pins, three demo locations, map zoom/pan/pinch, terrain and diagram layers, favorites, fullscreen and adding custom stops by clicking the map. Switch to World map to keep using the original visited-country map.

The dotted lines connect sample points directly: they are not verified hiking/navigation tracks. Distances are calculated along these straight segments, not trail walking distances. Custom stops and favorites persist with the existing local data and are included in JSON backups.

Leaflet 1.9.4 is bundled locally under dist/vendor/leaflet (BSD-2-Clause, LICENSE included). Satellite and terrain tiles are loaded online from Esri ArcGIS services with attribution displayed on the map. Satellite imagery: Esri, Vantor, Earthstar Geographics, GIS User Community. Terrain: Esri and its data contributors. The external provider receives tile requests when an online layer is selected. For a production release, confirm the provider's current usage and licensing terms and use an appropriate licensed map service. The Diagram mode and World map do not require external tiles. There is no GPS access and no third-party navigation service. Do not precache third-party tiles for bulk offline use.

Changes are on the local codex/atlas-explorer branch. The existing React application is unchanged; this remains a design prototype for later integration.


## Verification

Run `npm run check` for JavaScript syntax and `npm test` for isolated atlas behavior checks using a Leaflet API stub. These cover RU/EN rendering, pin selection, layers, zoom, favorite persistence, creating and removing custom stops, backup compatibility, and disposal when switching views. They do not replace a real-browser test. Browser preview access was declined in this environment, so visual layout, actual touch gestures and native fullscreen remain unverified.

## Shared photo albums and trip members

The new Photo albums section is available from desktop and mobile navigation and from the home shortcuts. Create folders for a trip, select multiple JPG/PNG/WebP images, drag and drop files, open photos in a viewer and remove your uploads. Images are validated before saving (maximum 10 MB and 64 megapixels per photo). Binary files are stored in IndexedDB, separately from localStorage. Folder metadata, upload attribution and membership are persisted with the existing data. JSON backups contain metadata, not image files; restoring metadata on another device will show unavailable-image placeholders. Clearing browser site data removes uploaded files.

Trip details now include Members and Photo albums tabs. Organizers invite a registered demo user by username; invitations are case-insensitive and duplicates and self-invitations are blocked. Accepting an invitation adds one membership; declining does not grant access. Every album is shared with all members of its trip, without a separate per-folder allowlist.

To test the flow locally:

1. Open a trip as Anna and choose Add a member.
2. Invite `maria` to Altai (Ivan is already a member of that sample trip). You can also create another demo profile first.
3. Open the profile circle in the header, switch to Maria and accept the incoming invitation.
4. Maria now sees the trip and its shared folders. She can create folders and add photos in this same browser.
5. Switch back to Anna to see the same updates. A declined invitation gives no access.

The demo persists `User`, `Team`, `TeamMembership`, `Invitation`, `Album` and `Media` metadata with ID-based links. It supports membership in several trips. This is a local UI prototype, not authentication or real cross-device sharing. For the team application, replace these fixtures with the Spring Boot API and protected server file storage according to `docs/architecture-v0.md`. Do not deploy the demo-profile switch as authorization. Removing a trip also removes its local album metadata and schedules deletion of its uploaded photo blobs. Existing React code and main are unchanged; this work is in the local `codex/shared-albums` branch.


Collaboration verification: `npm test` also checks normalized usernames, invitation duplicates, recipient-only accept/decline, membership in several trips, shared-folder visibility, ownership checks, photo validation/upload metadata persistence and backup compatibility. These use isolated fixtures and an in-memory substitute for IndexedDB. Real IndexedDB persistence and mobile layouts still need browser verification.
