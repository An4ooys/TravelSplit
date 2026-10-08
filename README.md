# <p align="center">✈️ TravelSplit 🌍</p>

<p align="center">
  <strong>Умный веб-сервис для совместного планирования путешествий и разделения расходов</strong>
</p>

<p align="center">
  <a href="#-о-проекте">О проекте</a> •
  <a href="#-ключевые-возможности">Возможности</a> •
  <a href="#-технологический-стек">Стек технологий</a> •
  <a href="#-архитектура-проекта">Архитектура</a> •
  <a href="#-быстрый-старт">Запуск</a> •
  <a href="#-планы-по-развитию">Roadmap</a>
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
- **Сборщик:** Maven / Gradle
- **Архитектура:** RESTful API

### **Frontend**
- **Библиотека:** [React](https://react.dev/)
- **Скрипты:** JavaScript (ES6+)
- **Окружение:** [Node.js](https://nodejs.org/) & npm
- **Стилизация:** Модульный CSS3 / Flexbox & Grid / Responsive UI

<details>
<summary>📋 <b>Иконки и бейджи стека</b></summary>

```markdown
- Java: https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white
- Spring: https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white
- React: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
- JavaScript: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
- Node.js: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
- CSS3: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
```
</details>

---

## 📂 Структура проекта

```text
TravelSplit/
├── backend/                # Серверная часть (Java + Spring Boot)
│   ├── src/
│   │   ├── main/java/      # Контроллеры, сервисы, репозитории, модели
│   │   └── main/resources/ # application.properties / конфигурация
│   └── pom.xml (build.gradle)
│
├── frontend/               # Клиентская часть (React SPA)
│   ├── public/             # Статические ресурсы
│   ├── src/
│   │   ├── components/     # UI-компоненты (карточки, модалки, списки)
│   │   ├── pages/          # Страницы (Поездки, Расходы, Маршрут)
│   │   ├── services/       # Интеграция с Backend API
│   │   └── App.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Быстрый старт

### Требования
- JDK 17 или выше
- Node.js v18+ и npm
- Git

### 1. Клонирование репозитория
```bash
git clone https://github.com/An4ooys/TravelSplit.git
cd TravelSplit
```

### 2. Запуск Backend (Spring Boot)
```bash
cd backend
# Если используется Maven:
./mvnw spring-boot:run
# Или Gradle:
./gradlew bootRun
```
*Сервер запустится по адресу:* `http://localhost:8080`

### 3. Запуск Frontend (React)
```bash
cd ../frontend
npm install
npm start
```
*Клиентское приложение откроется по адресу:* `http://localhost:3000`

---

## 🗺️ Дорожная карта (Roadmap)

- [x] Инициализация архитектуры репозитория
- [ ] Аутентификация и профили пользователей (JWT / Spring Security)
- [ ] CRUD поездок и участников
- [ ] Модуль учета расходов и алгоритм оптимизации долгов (Debt Simplification)
- [ ] Загрузка и прикрепление билетов / броней (PDF, изображения)
- [ ] Интерактивная карта маршрута (OpenStreetMap / Google Maps)
- [ ] Офлайн-режим (PWA)

---

## 🤝 Вклад в проект (Contributing)

1. Сделайте Fork репозитория
2. Создайте ветку фичи: `git checkout -b feature/AmazingFeature`
3. Зафиксируйте изменения: `git commit -m 'feat: Add some AmazingFeature'`
4. Отправьте ветку: `git push origin feature/AmazingFeature`
5. Откройте **Pull Request**

---

<p align="center">
  Сделано с ❤️ для путешественников и лёгких поездок
</p>
