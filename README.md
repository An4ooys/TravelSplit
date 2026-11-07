<p align="center">
  <img src="assets/travelsplit-banner-v4.svg" alt="TravelSplit — plan together, travel together, split fairly" width="100%" />
</p>

<p align="center">
  <strong>Умный веб-сервис для совместного планирования путешествий и разделения расходов</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/commit-activity/t/An4ooys/TravelSplit?style=for-the-badge&logo=git&logoColor=white&color=6366f1&label=commits" alt="Commits" />
  <img src="https://img.shields.io/github/last-commit/An4ooys/TravelSplit?style=for-the-badge&logo=github&logoColor=white&color=10b981&label=last%20commit" alt="Last Commit" />
</p>

<p align="center">
  <a href="#-о-проекте">О проекте</a> •
  <a href="#-что-уже-работает">Готово сейчас</a> •
  <a href="#-локальный-запуск">Запуск</a> •
  <a href="#-план-развития">План</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=java,spring,react,ts,nodejs,css,html&theme=light" alt="Tech Stack Icons" />
</p>

---

## 📖 О проекте

**TravelSplit** — пространство для совместного планирования поездок: маршрута, участников, документов и общих расходов. Идея проекта — собрать нужную информацию в одном месте и сделать возвращение к планам приятным. Визуальная тема меняется от утра к ночи перетаскиванием солнца по дуге.

Сейчас в репозитории работает **локальный фронтенд-прототип**. Бэкенд, база данных и авторизация ещё не реализованы. Данные поездок заданы в коде; редактирование поездок через интерфейс пока не предусмотрено.

## ✨ Что уже работает

| Экран или функция | Текущее состояние |
| --- | --- |
| Главная страница | Три демонстрационные поездки: Алтай, Норвегия и Швейцария. |
| Страница поездки | Общие сведения, участники с username, бюджет и список расходов. Карточки на главной открывают соответствующую поездку; работает возврат назад. |
| Визуальная тема | Утро, день, вечер и ночь. Выбор сохраняется в `localStorage` браузера. |
| Адаптивная верстка | Главная и страница поездки рассчитаны на широкий и узкий экран. |

Фон интерфейса взят из презентации проекта; изображения поездок — из папки [assets/generated-concepts/Anna](assets/generated-concepts/Anna/README.md). Подробности фронтенда — в [frontend/README.md](frontend/README.md).

## 🚀 Локальный запуск

Нужен Node.js LTS и npm. В **Windows PowerShell** из корня проекта выполните:

```powershell
cd frontend
if (-not (Test-Path .env)) { Copy-Item .env-example .env }
npm.cmd install
npm.cmd run dev
```

Откройте <http://127.0.0.1:5173/>. Для проверки сборки: `npm.cmd run build`. Если Node.js установили при уже открытом VS Code и команда `node` не находится, обновите `PATH` по инструкции в [frontend/README.md](frontend/README.md#запуск-в-windows-powershell) или полностью перезапустите VS Code. В PowerShell используйте `npm.cmd`: вызов `npm` может выбрать заблокированный системной политикой файл `npm.ps1`.

## ⚙️ Конфигурация

Локальные `.env` не попадают в Git. Образцы: [frontend/.env-example](frontend/.env-example) и [backend/.env-example](backend/.env-example).

| Где | Переменная | Назначение |
| --- | --- | --- |
| Фронтенд | `VITE_PORT=5173` | Порт Vite; адрес фиксирован как `127.0.0.1`. |
| Фронтенд | `VITE_DEFAULT_TIME=morning` | Начальная тема до первого выбора пользователя. |
| Фронтенд | `VITE_APP_TITLE=TravelSplit` | Название в шапке интерфейса. |
| Будущий бэкенд | `SERVER_ADDRESS=127.0.0.1`, `SERVER_PORT=8080` | Адрес и порт для Spring Boot. Пока приложение бэкенда отсутствует и эти переменные не используются. |

## 🧭 План развития

План v0 описан в [docs/architecture-v0.md](docs/architecture-v0.md). Следующие этапы: создание поездок и приглашения по username, маршрут по дням, билеты и бронирования, общие списки вещей, учёт расходов и баланс, фотоальбом. Один участник сможет состоять в нескольких командах. Для серверной части запланированы Java 17+, Spring Boot 3.x и REST API.

## 🛠️ Стек

- **Реализован:** React 18, TypeScript, Vite, CSS3.
- **Запланирован:** Java 17+, Spring Boot 3.x; хранение данных и API по архитектурному плану.
