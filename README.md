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
  <a href="#-ключевые-возможности">Возможности</a> •
  <a href="#-технологический-стек">Стек технологий</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=java,spring,react,js,nodejs,css,html&theme=light" alt="Tech Stack Icons" />
</p>

---

## 📖 О проекте

**TravelSplit** решает главную головную боль любых групповых поездок: хаос в чатах, потерянные чеки, споры «кто кому сколько должен» и забытые билеты.

Сервис объединяет всё необходимое в одном удобном пространстве: от составления пошагового маршрута и бронирований до алгоритмического расчета взаиморасчетов и сохранения общих фотовоспоминаний.

> 💡 *Путешествуйте с друзьями и делитесь впечатлениями, а не головной болью от подсчёта расходов!*

---

## ✨ Ключевые возможности

| Раздел | Описание |
| :--- | :--- |
| 🗺️ **Маршрут и таймлайн** | Создание поездки, подробный план по дням, фиксация локаций и ключевых точек маршрута. |
| 👥 **Коллаборация** | Приглашение друзей в поездку, совместное редактирование и распределение ролей. |
| 💰 **Умный сплит расходов** | Фиксация трат в любой момент, распределение на всех или выбранных участников, автоматический расчёт минимального количества переводов для закрытия долгов. |
| 🎟️ **Билеты и бронирования** | Единое хранилище авиабилетов, отелей, аренд и входных ваучеров — всё под рукой в офлайн/онлайн доступе. |
| 🎒 **Чек-листы и списки вещей** | Общий список сбора багажа с отметкой, кто что берет (аптечка, палатка, зарядные устройства). |
| 📸 **Общий фотоальбом** | Единое облако фото и видео для всей компании участников путешествия. |

---

## 🛠️ Технологический стек

### **Backend**
- **Язык:** [Java](https://www.java.com/)
- **Фреймворк:** [Spring Boot](https://spring.io/projects/spring-boot) (Spring MVC, Spring Data, Spring Security)
- **Архитектура:** RESTful API

### **Frontend**
- **Библиотека:** [React](https://react.dev/)
- **Скрипты:** JavaScript (ES6+)
- **Окружение:** [Node.js](https://nodejs.org/) & npm
- **Стилизация:** Модульный CSS3 / Flexbox & Grid / Responsive UI

---

## ✅ Реализовано в прототипе

- Главная страница с тремя демонстрационными поездками и переходом на страницу каждой поездки.
- Страница поездки с общей информацией, участниками и расходами. Данные пока заданы в коде.
- Переключение темы «утро → день → вечер → ночь» перетаскиванием солнца; выбранная тема сохраняется в браузере.
- Адаптивный интерфейс с фоном из презентации проекта. Фронтенд сделан на React 18, TypeScript и Vite.

Сейчас работают только эти экраны. Авторизация, бэкенд, база данных и остальные возможности из списка выше ещё не реализованы. Порядок дальнейшей разработки описан в [плане v0](docs/architecture-v0.md).

## 🚀 Локальный запуск

Установите Node.js LTS. В Windows PowerShell из корня проекта выполните:

```powershell
cd frontend
if (-not (Test-Path .env)) { Copy-Item .env-example .env }
npm.cmd install
npm.cmd run dev
```

Откройте <http://127.0.0.1:5173/>. Для проверки сборки выполните `npm.cmd run build`. Если после установки Node.js терминал VS Code не находит `node`, полностью перезапустите VS Code или обновите `PATH` по инструкции в [README фронтенда](frontend/README.md#запуск-в-windows-powershell). В PowerShell команда `npm.cmd` позволяет запускать npm без изменения политики выполнения сценариев.

Порт фронтенда задаётся через `VITE_PORT` в [frontend/.env-example](frontend/.env-example). В [backend/.env-example](backend/.env-example) подготовлены адрес и порт будущего сервера; бэкенд пока не запускается. Подробности — в [README фронтенда](frontend/README.md).

---

<p align="center">
  Сделано с ❤️ для путешественников и лёгких поездок
</p>
