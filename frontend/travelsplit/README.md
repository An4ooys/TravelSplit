# TravelSplit design prototype

Latest design: Living Forest (v1.4.0) — spatial journey carousel, botanical motion,  milky green light theme, deep forest dark theme, translucent panels, RU / EN, responsive desktop and mobile layouts. Includes trips, bookings, visited places map and forms.

This standalone HTML/CSS/JavaScript prototype belongs in design-prototypes/travelsplit. It does not replace the existing frontend/ React + TypeScript application and is not connected to the API. Sample data is stored in the browser.

## Run

From this directory run `npm start` with Node.js 18+. No package installation is needed. Open http://127.0.0.1:4173 . Alternatively run `python3 -m http.server 4173 --directory dist`.

Use HTTP rather than opening index.html directly: the map and PWA need an HTTP origin.

## Team workflow

Work on a separate branch. Test before merging to main and open a Pull Request. Read docs/architecture-v0.md in the main repository before porting this design into React. Preserve the API contracts.

## Palettes

Light: #edf0e7 with forest-green text, frosted panels and adaptive nature accents. Dark: #101e17 with pale text and green glass panels. Theme and language preferences persist in the browser.

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


## Forest Glass visual redesign (2026-11-23)

The complete prototype now uses a nature-inspired glass design: forest greens, milky light surfaces, lime accents, soft borders, rounded translucent panels, blurred backdrops and landscape imagery. Light and dark modes remain available. Desktop navigation becomes a fixed glass sidebar; tablet/mobile navigation retains all five destinations in a bottom dock. All pages, dialogs, bookings, members, invitations, photo albums and atlas layers follow the same visual system. No server API or storage contracts were changed.

The presentation layer lives in `dist/nature.css`, loaded after existing feature styles. Existing behavior remains in `app.js`, `atlas.js`, `collaboration.js` and `store.js`. Existing data keys and demo profile identities are retained. Changes are on local branch `codex/forest-glass-design`, not main.

New background photo: Unsplash `photo-1441974231531-c6227db76b6e`, bundled at `dist/assets/forest-canopy.jpg`. It is mood imagery, not an identification of the trip location. See https://unsplash.com/license . No external font or background-image requests are needed for this design; online satellite/terrain map tiles still need a connection.

`npm test` continues to cover atlas interactions, membership/invitation behavior and photo-album actions. Visual layout and real device/browser behavior still need manual verification; no passing browser QA is claimed.


Preview check on 2026-11-23: local HTTP preview returned 200 for the new stylesheet. The in-app browser was still denied by a saved origin permission even after the user authorized a new check in chat. No browser-security bypass was attempted. Visual screenshots and native touch testing remain unverified.

## Living Forest · v1.4.0

Последний Forest Glass объединён с объёмной каруселью из короткого видео и природными композициями из коллажа. Главный экран показывает доступные пользователю поездки: сначала запланированные, затем завершённые. Центральная карточка открывает поездку, боковая выбирает её. Кнопки, индикаторы, стрелки клавиатуры внутри карусели и горизонтальный свайп переключают выбор без перерисовки всей страницы. Фотография, название, дата, статус и обе кнопки открытия относятся к одной выбранной поездке. При быстрой смене предыдущие фоновые слои удаляются.

Лесные, прибрежные и цветочные акценты соответствуют обложке поездки; светлая и тёмная темы сохранены. Добавлены мягкое появление разделов, диалогов, движение природной композиции и небольшой параллакс мышью. В профиле есть переключатель «Живой интерфейс». Системное `prefers-reduced-motion` отключает движение независимо от переключателя. При скрытии вкладки непрерывная анимация приостанавливается. Автоматического перелистывания нет.

Сохранены все пять разделов, RU/EN, создание поездок и броней, интерактивный атлас, участники, локальные приглашения, общие фотоальбомы, загрузка фотографий и резервные копии. Сервер и схема данных не изменены; перенос в React и подключение командного API по-прежнему требуются. Это фронтенд-прототип, а не синхронизация между устройствами.

Новые файлы: `dist/motion.js`, `dist/motion.css`, `dist/assets/living-botanical.png`. Композиция создана встроенным image_gen, промпт сохранён в `ASSET-PROMPT.txt`. Ассет включён в локальный PWA-кэш. При переносе в React вынесите карусель в компонент с состоянием выбранной поездки; сохраняйте фильтрацию по участнику и обработку reduced motion.

Рабочая ветка: `codex/living-forest`. Проверки: `npm run check` и `npm test`. Новая проверка покрывает порядок карточек, быстрые переключения, циклический переход, выбор/открытие, согласованность ссылки и выбранной поездки, цветовые состояния, ноль/одну поездку и настройку анимаций. Существующие проверки атласа и совместных альбомов сохранены. DOM-адаптеры не заменяют реальный браузер: визуальная проверка на телефоне и ПК остаётся необходимой. Встроенный браузер не разрешил автоматический доступ к локальному адресу.

Для текущего локального просмотра: `PORT=4174 npm start`, затем http://127.0.0.1:4174/?v=living-forest#home . Стандартный `npm start` продолжает использовать 4173. Для передачи на GitHub используйте папку `design-prototypes/travelsplit/` из архива, работайте в отдельной ветке, откройте Pull Request и сливайте после проверки командой. Не загружайте ZIP вместо исходников и не заменяйте корневой package.json командного проекта.
