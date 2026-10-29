# Бронирование переговорной комнаты (Maddevs test task)

**Live demo:** https://tt-02-maddevs.vercel.app

Web UI для бронирования переговорной в рабочий день **09:00–18:00**. Спецификация: [`task.md`](task.md).

## Требования

- Node.js 20+
- npm

## Как запустить

```bash
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

### Next.js MCP (coding agents)

Next.js 16 exposes a dev-only MCP endpoint at `/_next/mcp`. Cursor reads [`.cursor/mcp.json`](.cursor/mcp.json) (also [`.mcp.json`](.mcp.json) for other agents) with [`next-devtools-mcp`](https://nextjs.org/docs/app/guides/mcp).

1. Run `npm run dev`.
2. In Cursor → **Settings → MCP**, confirm **next-devtools** is connected (reload MCP after first install).
3. Open the app in a browser when using tools such as `get_errors` or `get_page_metadata`.

Install or refresh the bridge:

```bash
npx add-mcp next-devtools-mcp@latest --agent cursor --yes
```

Production builds and Vercel deploys are unchanged; MCP is for local development only.

Production-сборка:

```bash
npm run build
npm start
```

## Статус по заданию

**`+`** — сделано, **`-`** — не сделано.

### Задача

Реализовать интерфейс бронирования переговорной комнаты в течение рабочего дня (09:00–18:00).

**+** выбрать дату;  
**+** посмотреть существующие бронирования на выбранную дату;  
**+** выбрать время начала и окончания;  
**+** создать бронирование;  
**+** редактировать бронирование;  
**+** удалить бронирование;  
**+** формат отображения: таймлайн.

### Бизнес-правила

**+** время начала и окончания — в пределах рабочего дня;  
**+** start < end;  
**+** минимальная длительность — 30 минут;  
**+** максимальная длительность — 2 часа;  
**+** бронирования не пересекаются; касание границ допустимо (10:00–11:00 и 11:00–12:00);  
**+** нельзя бронировать прошедшее время;  
**+** для сегодняшней даты прошедшие слоты недоступны;  
**+** для прошедших дат создание брони недоступно;  
**+** при редактировании текущая бронь не конфликтует сама с собой;  
**+** сервер может вернуть конфликт, даже если UI считал слот свободным; UI показывает понятное сообщение, обновляет список броней и не теряет введённые данные.

### Что важно показать

**+** аккуратную работу с бизнес-логикой и валидацией;  
**+** корректные состояния UI: загрузка, пустое состояние, ошибка, отправка формы;  
**+** обработку серверных ошибок, в том числе конфликтов;  
**+** разделение слоя API и UI;  
**+** читаемый TypeScript и понятную структуру кода;  
**+** адаптивность и базовую доступность.

### Стек

**+** Next.js (App Router) + TypeScript;  
**+** mock API (Route Handlers, in-memory store);  
**+** GET /api/bookings?date=YYYY-MM-DD;  
**+** POST /api/bookings;  
**+** PATCH /api/bookings/:id;  
**+** DELETE /api/bookings/:id;  
**+** тип Booking: id, date, start, end, опционально title;  
**+** сервер валидирует бизнес-правила и умеет возвращать конфликт (409).

### Что сдать (task.md)

**+** README: как запустить, статус по пунктам, время (разделы ниже);  
**+** ссылка на deployed demo (см. ниже);  
**-** указано фактическое время в разделе «Сколько времени заняло» (заполнить перед сдачей).

**Репозиторий:** https://github.com/radomir-radionov/tt-02-maddevs

## Сколько времени заняло

_(указать перед сдачей, ориентир по заданию: 4–6 часов)_

## Deploy (Vercel)

Проект связан с GitHub; push в `main` автоматически деплоится на Vercel.

- **Production:** https://tt-02-maddevs.vercel.app
- **Dashboard:** https://vercel.com/radomirs-projects/tt-02-maddevs

## Чеклист сдачи

- [x] Ссылка на репозиторий
- [x] README: запуск, сделано / не сделано, время
- [x] Deployed demo
- [ ] Чат-переписка с AI
