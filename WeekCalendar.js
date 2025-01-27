import { formatDateToYMD, formatTime, parseTime, getMonthShortName } from './utils.js';

/*  Реализация функционала календаря по неделям */
export class WeekCalendar {
    constructor(weekCalendarElem, onCreateEvent, onShowEventDetails) {
        // DOM-элемент, где строим календарь
        this.weekCalendarElem = weekCalendarElem;
        // Колбэки, которые будут вызываться при клике на пустое место (создать событие)
        // и при клике на существующее событие (показать детали)
        this.onCreateEvent = onCreateEvent;
        this.onShowEventDetails = onShowEventDetails;
    }

    buildWeekCalendar(monday) {
        this.weekCalendarElem.innerHTML = '';

        // Прописываем дни
        const daysOfWeek = [];
        for (let i = 0; i < 7; i++) {
            const temp = new Date(monday);
            temp.setDate(monday.getDate() + i);
            daysOfWeek.push(temp);
        }

        // Резервируем "уголок" в левом верхнем углу
        const corner = document.createElement('div');
        corner.classList.add('corner-cell');
        corner.textContent = '';
        this.weekCalendarElem.appendChild(corner);

        // Прописываем ячейки с названиями дней
        daysOfWeek.forEach(d => {
            const dayTitle = document.createElement('div');
            dayTitle.classList.add('week-day-title');
            const dd = d.getDate();
            const mmShort = getMonthShortName(d.getMonth());
            dayTitle.textContent = `${dd} ${mmShort}`;
            this.weekCalendarElem.appendChild(dayTitle);
        });

        // Колонка с часами
        const hourCol = document.createElement('div');
        hourCol.classList.add('hour-column');
        hourCol.style.gridColumn = '1 / 2';
        hourCol.style.gridRow = '2 / 3';
        this.weekCalendarElem.appendChild(hourCol);

        // Отрисовка часовых линий
        for (let hour = 0; hour < 24; hour++) {
            const line = document.createElement('div');
            line.classList.add('hour-line');
            line.style.top = hour * 60 + 'px';
            hourCol.appendChild(line);

            const label = document.createElement('div');
            label.classList.add('hour-label-text');
            label.style.top = (hour * 60 + 2) + 'px';
            label.textContent = hour + ':00';
            hourCol.appendChild(label);
        }

        // Реализуем 7 колонок под дни недели
        for (let i = 0; i < 7; i++) {
            const day = daysOfWeek[i];
            const dayCol = document.createElement('div');
            dayCol.classList.add('day-column');
            dayCol.style.gridColumn = (i + 2) + ' / span 1';
            dayCol.style.gridRow = '2 / span 1';

            if (i === 5 || i === 6) {
                dayCol.classList.add('weekend-column');
            }

            dayCol.dataset.date = formatDateToYMD(day);

            // Линии внутри "дня"
            for (let hour = 0; hour < 24; hour++) {
                const line = document.createElement('div');
                line.classList.add('day-line');
                line.style.top = (hour * 60) + 'px';
                dayCol.appendChild(line);
            }

            // По клику по пустой области создаем событие
            dayCol.addEventListener('click', (e) => {
                const rect = dayCol.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                let hour = Math.floor(offsetY / 60);
                let minutes = 0;
                if (hour < 0) hour = 0;
                if (hour > 23) hour = 23;

                const dateStr = dayCol.dataset.date;
                const timeStr = formatTime(hour, minutes);
                this.onCreateEvent(dateStr, timeStr);
            });

            this.weekCalendarElem.appendChild(dayCol);
        }
    }

    // Рендер событий
    renderEvents(events) {
        // Сначала удаляем блоки event-block
        this.weekCalendarElem.querySelectorAll('.day-column .event-block').forEach(el => el.remove());

        events.forEach(evt => {
            const col = this.weekCalendarElem.querySelector(`.day-column[data-date="${evt.date}"]`);
            if (!col) return; // событие не на этой неделе

            // Парсим время
            const [startH, startM] = parseTime(evt.start);
            const [endH, endM] = parseTime(evt.end);
            const startY = startH * 60 + startM;
            const endY = endH * 60 + endM;
            if (endY <= startY) return;

            const eventEl = document.createElement('div');
            eventEl.classList.add('event-block');
            eventEl.textContent = evt.title;
            eventEl.style.top = startY + 'px';
            eventEl.style.height = (endY - startY) + 'px';

            // По клику переходим в детали
            eventEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onShowEventDetails(evt.id);
            });

            col.appendChild(eventEl);
        });
    }
}