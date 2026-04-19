# Frontend — МАРКЕТ

React + Vite + TypeScript + Mantine.

MVP: регистрация, вход, лента объявлений с фильтрами и пагинацией, карточка объявления, создание / редактирование / удаление своих объявлений, страница «Мои объявления».

## Запуск

```bash
cd marketplace-face
npm install
npm run dev
```

Dev-сервер поднимется на http://localhost:5173 и проксирует:

- `/auth/*` → `http://localhost:8000` (Auth Service)
- `/ads/*` → `http://localhost:8002` (Ad Service)
- `/search/*` → `http://localhost:8003` (Search Service)

Это воспроизводит поведение Ingress: фронт ходит в один origin, и один и тот же билд поедет и локально, и в k8s.

## Скрипты

- `npm run dev` — Vite dev-сервер с HMR
- `npm run build` — типы + бандл в `dist/`
- `npm run lint` — ESLint
- `npm run preview` — подхватить готовый билд для проверки

## Структура

```
src/
  api/           клиент, JWT, типы
    client.ts    fetch-обёртка с auto-refresh на 401
    tokens.ts    хранение пары токенов в localStorage
    auth.ts      login / register / fetchMe
    ads.ts       listAds / getAd / listMyAds / createAd / updateAd / deleteAd
    types.ts     AdResponse, UserResponse, TokenResponse, MyAdsResponse, CreateAdPayload
  auth/
    AuthContext.tsx   AuthProvider
    context.ts        сам React-контекст и типы
    useAuth.ts        хук useAuth()
    RequireAuth.tsx   guard для защищённых роутов (редирект на /login?next=...)
  pages/
    AdsListPage.tsx    лента + фильтры + пагинация
    AdDetailsPage.tsx  карточка объявления (404 → redirect); для автора — кнопки «Редактировать» и «Удалить»
    AdCreatePage.tsx   форма создания объявления
    AdEditPage.tsx     форма редактирования (проверяет владение, отдаёт 403-страницу чужим)
    MyAdsPage.tsx      таблица своих объявлений с действиями edit/delete
    LoginPage.tsx      поддерживает ?next= для редиректа после входа
    RegisterPage.tsx   валидация: email + пароль от 8 символов
    NotFoundPage.tsx
  components/
    AdCard.tsx
    AdForm.tsx         общий контролируемый @mantine/form для create + edit
    FiltersPanel.tsx   категория, город, цена от/до, сортировка
  lib/
    errors.ts    форматирование ApiError (включая 422-массивы от Pydantic)
    format.ts    formatPrice (RUB), formatDate (ru-RU)
  App.tsx        AppShell + роуты
  main.tsx       MantineProvider + Notifications + BrowserRouter + AuthProvider
```

## Роуты

| Путь             | Авторизация | Что делает                         |
|------------------|-------------|------------------------------------|
| `/`              | —           | Лента объявлений                   |
| `/ads/:id`       | —           | Карточка объявления                |
| `/ads/new`       | ✅          | Создать объявление                 |
| `/ads/:id/edit`  | ✅ + автор  | Редактировать своё объявление      |
| `/my-ads`        | ✅          | Таблица своих объявлений           |
| `/login`         | —           | Вход (поддерживает `?next=`)       |
| `/register`      | —           | Регистрация                        |

Защищённые роуты обёрнуты в `<RequireAuth>`: если пользователь анонимный, уходит на `/login?next=...` и после успешного входа возвращается.

## JWT и refresh

`src/api/client.ts` держит пару токенов в localStorage. Перед каждым авторизованным запросом проверяет `exp` access-токена; если вышел — один раз рефрешится через `POST /auth/refresh` и повторяет запрос. На 401 от сервера тоже пробует рефрешнуться один раз.

Параллельные запросы не гоняют рефреш дважды — `refreshing` держит in-flight промис.

## CRUD объявлений

- `POST /ads` — `AdCreatePage` через `createAd(payload)`
- `PUT /ads/:id` — `AdEditPage` через `updateAd(id, payload)`; страница сама делает `GET /ads/:id` и сверяет `user_id` с текущим, иначе показывает 403
- `DELETE /ads/:id` — и в `MyAdsPage`, и в `AdDetailsPage` (для автора); soft-delete на бэке (ad переходит в `archived`). На 404 сервера `request<void>` не падает, т.к. ответ `204 No Content` обрабатывается отдельно

## Что ещё можно сделать

- Полнотекстовый поиск через `GET /search` и автодополнение через `GET /search/suggest`
- Code splitting (сейчас весь Mantine в одном чанке)
- TanStack Query вместо ручного `useEffect`-фетчинга
- Восстановление архивированных объявлений (сейчас бэк умеет только soft-delete)
