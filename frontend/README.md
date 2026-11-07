# Фронтенд TravelSplit

Демонстрационный фронтенд на React 18, TypeScript и Vite. Главный экран открывает страницы трёх поездок. На странице поездки показаны общие сведения, участники и расходы. Все значения заданы в `src/trips.ts`; авторизации и запросов к серверу нет.

## Запуск в Windows PowerShell

Требуется Node.js LTS. Если он не установлен, установите его с [официального сайта](https://nodejs.org/) или через `winget install --id OpenJS.NodeJS.LTS --exact --scope user`.

Если VS Code был открыт до установки Node.js, сначала обновите `PATH` в текущем терминале PowerShell. Эту строку можно пропустить после полного перезапуска VS Code:

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
```

Затем из папки `frontend` выполните:

```powershell
node --version
npm.cmd --version
npm.cmd install
npm.cmd run dev
```

В PowerShell используйте `npm.cmd`: команда `npm` может выбрать `npm.ps1` и завершиться ошибкой из-за системной политики выполнения сценариев. Откройте `http://127.0.0.1:5173/`. Для проверки сборки выполните `npm.cmd run build`.

Настройки Vite находятся в `.env`. Образец — `.env-example`. `VITE_PORT` задаёт порт локального сервера (по умолчанию `5173`); адрес фронтенда остаётся `127.0.0.1`. `VITE_DEFAULT_TIME` принимает `morning`, `day`, `evening` или `night`; выбранное время суток сохраняется в `localStorage` браузера. В [`../backend/.env-example`](../backend/.env-example) подготовлены `SERVER_ADDRESS` и `SERVER_PORT` для будущего Spring Boot приложения; фронтенд их не использует.

Основной пейзаж извлечен из предоставленной презентации `TravelSplit_защита_идеи_v10.pptx`. Иллюстрации карточек взяты из `assets/generated-concepts/Anna/backgrounds/`, в том числе утренний кадр `camp-cycle/01-morning.png`.
