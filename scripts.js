let events = [];
let currentMonday = getMonday(new Date());
let editEventId = null;

// Мини-календарь (по месяцам)
let currentDateForMini = new Date();
let selectedDate = new Date();

// DOM-элементы
let weekCalendar,
    newEventBtn,
    cancelBtn,
    eventForm,
    modalOverlayCreate,
    modalCreate,
    modalOverlayDetails,
    modalDetails,
    detailsContent,
    editBtn,
    deleteBtn,
    closeDetailsBtn,
    searchInput,
    searchOverlay,
    searchModal,
    closeSearchBtn,
    searchResultsContainer,
    prevWeekBtn,
    nextWeekBtn,
    weekRangeLabel,
    prevMonthBtn,
    nextMonthBtn,
    miniCalendarGrid,
    currentMonthElem;

document.addEventListener('DOMContentLoaded', () => {
    // Привязка к DOM
    weekCalendar         = document.getElementById('weekCalendar');
    newEventBtn         = document.getElementById('newEventBtn');
    cancelBtn           = document.getElementById('cancelBtn');
    eventForm           = document.getElementById('eventForm');
    modalOverlayCreate  = document.getElementById('modalOverlayCreate');
    modalCreate         = document.getElementById('modalCreate');
    modalOverlayDetails = document.getElementById('modalOverlayDetails');
    modalDetails        = document.getElementById('modalDetails');
    detailsContent      = document.getElementById('detailsContent');
    editBtn             = document.getElementById('editBtn');
    deleteBtn           = document.getElementById('deleteBtn');
    closeDetailsBtn     = document.getElementById('closeDetailsBtn');
    searchInput         = document.getElementById('searchInput');
    searchOverlay       = document.getElementById('searchOverlay');
    searchModal         = document.getElementById('searchModal');
    closeSearchBtn      = document.getElementById('closeSearchBtn');
    searchResultsContainer = document.getElementById('searchResultsContainer');
    prevWeekBtn         = document.getElementById('prevWeekBtn');
    nextWeekBtn         = document.getElementById('nextWeekBtn');
    weekRangeLabel      = document.getElementById('weekRangeLabel');
    prevMonthBtn        = document.getElementById('prevMonthBtn');
    nextMonthBtn        = document.getElementById('nextMonthBtn');
    miniCalendarGrid    = document.getElementById('miniCalendarGrid');
    currentMonthElem    = document.getElementById('currentMonth');

    loadEventsFromStorage();

    // Строим "большой" календарь
    buildWeekCalendar(currentMonday);
    renderEvents();
    updateWeekRangeLabel();

    renderMiniCalendar(currentDateForMini);

    // События
    newEventBtn.addEventListener('click', openCreateModal);
    cancelBtn.addEventListener('click', closeCreateModal);
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvent();
    });
    closeDetailsBtn.addEventListener('click', closeDetailsModal);
    editBtn.addEventListener('click', () => {
        const evtId = editBtn.dataset.eventId;
        if (evtId) openEditModal(Number(evtId));
    });
    deleteBtn.addEventListener('click', () => {
        const evtId = deleteBtn.dataset.eventId;
        if (evtId) deleteEvent(Number(evtId));
    });

    // Переключение недель (календарь по неделям)
    prevWeekBtn.addEventListener('click', () => {
        currentMonday.setDate(currentMonday.getDate() - 7);
        buildWeekCalendar(currentMonday);
        renderEvents();
        updateWeekRangeLabel();
    });
    nextWeekBtn.addEventListener('click', () => {
        currentMonday.setDate(currentMonday.getDate() + 7);
        buildWeekCalendar(currentMonday);
        renderEvents();
        updateWeekRangeLabel();
    });

    // Переключение месяцев (календарь по месяцам)
    prevMonthBtn.addEventListener('click', () => {
        currentDateForMini.setMonth(currentDateForMini.getMonth() - 1);
        renderMiniCalendar(currentDateForMini);
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDateForMini.setMonth(currentDateForMini.getMonth() + 1);
        renderMiniCalendar(currentDateForMini);
    });

    // Поиск по событиям
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            doSearch();
        }
    });
    closeSearchBtn.addEventListener('click', () => {
        hideSearchOverlay();
    });
});

/*  Реализация функционала календаря по неделям */
function buildWeekCalendar(monday) {
    // Очищаем
    weekCalendar.innerHTML = '';

    // Прописываем дни
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
        const temp = new Date(monday);
        temp.setDate(monday.getDate() + i);
        daysOfWeek.push(temp);
    }

    const corner = document.createElement('div');
    corner.classList.add('corner-cell');
    corner.textContent = '';
    weekCalendar.appendChild(corner);

    // Прописываем ячейки с названиями дней
    daysOfWeek.forEach(d => {
        const dayTitle = document.createElement('div');
        dayTitle.classList.add('week-day-title');
        const dd = d.getDate();
        const mmShort = getMonthShortName(d.getMonth());
        dayTitle.textContent = `${dd} ${mmShort}`;
        weekCalendar.appendChild(dayTitle);
    });

    // Одна колонка под часы + 7 колонок под дни недели
    const hourCol = document.createElement('div');
    hourCol.classList.add('hour-column');
    hourCol.style.gridColumn = '1 / 2';
    hourCol.style.gridRow = '2 / 3'; // т.к. уже мы заняли 1 строку под корешок
    weekCalendar.appendChild(hourCol);

    // Расставляем линии и часы
    for (let hour = 0; hour < 24; hour++) {
        const line = document.createElement('div');
        line.classList.add('hour-line');
        const topPx = hour * 60;
        line.style.top = topPx + 'px';
        hourCol.appendChild(line);

        // Расставляем часы
        const label = document.createElement('div');
        label.classList.add('hour-label-text');
        label.style.top = (topPx + 2) + 'px';
        label.textContent = hour + ':00';
        hourCol.appendChild(label);
    }

    // Реализуем 7 колонок под дни недели
    for (let i = 0; i < 7; i++) {
        const day = daysOfWeek[i];
        const dayCol = document.createElement('div');
        dayCol.classList.add('day-column');
        dayCol.style.gridColumn = (i + 2) + ' / span 1'; // т.к. 1 колонка отдана под часоы
        dayCol.style.gridRow = '2 / span 1'; // т.к. 1 колонка отдана под часоы
        if (i === 5 || i === 6) {
            dayCol.classList.add('weekend-column'); // выделяем выходные
        }
        // dayCol.dataset - будем хранить дату
        dayCol.dataset.date = formatDateToYMD(day);

        for (let hour = 0; hour < 24; hour++) {
            const line = document.createElement('div');
            line.classList.add('day-line');
            line.style.top = (hour * 60) + 'px';
            dayCol.appendChild(line);
        }

        // По клику на пустую область (ячейку) можем создать событие
        // Определяем время событие, исходя из места клика
        dayCol.addEventListener('click', (e) => {
            // Координата клика относительно dayCol
            const rect = dayCol.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            // offsetY = от 0..1440
            let hour = Math.floor(offsetY / 60);
            let minutes = Math.floor(offsetY % 60);
            minutes = 0;
            if (hour < 0) hour = 0;
            if (hour > 23) hour = 23;

            const dateStr = dayCol.dataset.date; // дд:мм:гггг
            const timeStr = formatTime(hour, minutes); // чч:мм
            openCreateModal(dateStr, timeStr);
        });

        weekCalendar.appendChild(dayCol);
    }
}

// Рендер событий
function renderEvents() {
    // Сначала очистим все day-column
    document.querySelectorAll('.day-column .event-block').forEach(el => el.remove());

    events.forEach(evt => {
        const col = document.querySelector(`.day-column[data-date="${evt.date}"]`);
        if (!col) return; // событие не на этой неделе

        // Парсим время
        const [startH, startM] = parseTime(evt.start);
        const [endH, endM] = parseTime(evt.end);
        const startY = startH * 60 + startM;
        const endY = endH * 60 + endM;
        if (endY <= startY) return; // некорректный интервал

        const eventEl = document.createElement('div');
        eventEl.classList.add('event-block');
        eventEl.textContent = evt.title;
        eventEl.style.top = startY + 'px';
        eventEl.style.height = (endY - startY) + 'px';
        // Клик => детали
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventDetails(evt.id);
        });

        col.appendChild(eventEl);
    });
}

// Метод для корректного правописания месяцев
function updateWeekRangeLabel() {
    const mon = new Date(currentMonday);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    weekRangeLabel.textContent =
        `${formatDateWithGenitive(mon)} - ${formatDateWithGenitive(sun)}`;
}

/* Календарь по месяцам */
function renderMiniCalendar(date) {
    miniCalendarGrid.innerHTML = '';
    const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    dayNames.forEach(dn => {
        const hdCell = document.createElement('div');
        hdCell.classList.add('day-header-cell');
        hdCell.textContent = dn;
        miniCalendarGrid.appendChild(hdCell);
    });

    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthElem.textContent = `${getFullMonthName(month)} ${year}`;

    // Задаем 42 ячейки (6 строк и 7 столбцов)
    const firstDayOfMonth = new Date(year, month, 1);
    let wd = firstDayOfMonth.getDay();
    if (wd === 0) wd = 7;
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - (wd - 1));

    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);

        const cell = document.createElement('div');
        cell.classList.add('calendar-cell');
        cell.textContent = cellDate.getDate();

        if (cellDate.getMonth() !== month) {
            cell.classList.add('other-month');
        }
        if (isSameDate(cellDate, new Date())) {
            cell.classList.add('today-day');
        }
        if (isSameDate(cellDate, selectedDate)) {
            cell.classList.add('selected-day');
        }
        cell.addEventListener('click', () => {
            selectedDate = cellDate;
            renderMiniCalendar(date);
            // Переходим на неделю, содержащую эту дату
            currentMonday = getMonday(cellDate);
            buildWeekCalendar(currentMonday);
            renderEvents();
            updateWeekRangeLabel();
        });

        miniCalendarGrid.appendChild(cell);
    }
}

/* Создание и редактирование событий */
function openCreateModal(dateStr = '', startTime = '') {
    editEventId = null;
    document.getElementById('modalCreateTitle').textContent = 'Создать событие';
    clearForm();
    modalOverlayCreate.classList.add('show');
    modalCreate.classList.add('show');

    // Предзаполняем данные, если переданы
    if (dateStr) {
        document.getElementById('eventDate').value = dateStr;
    }
    if (startTime) {
        document.getElementById('eventTimeStart').value = startTime;
        // По умолчанию конец + 1 час
        let [h, m] = parseTime(startTime);
        h += 1;
        if (h > 23) h = 23;
        document.getElementById('eventTimeEnd').value = formatTime(h, m);
    }
}
function openEditModal(evtId) {
    editEventId = evtId;
    const evtObj = events.find(e => e.id === evtId);
    if (!evtObj) return;
    closeDetailsModal();

    document.getElementById('modalCreateTitle').textContent = 'Редактировать событие';
    fillForm(evtObj);

    modalOverlayCreate.classList.add('show');
    modalCreate.classList.add('show');
}
function closeCreateModal() {
    modalOverlayCreate.classList.remove('show');
    modalCreate.classList.remove('show');
}
// Проверка корректности данных формы
function validateEventForm() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value.trim();
    const startTime = document.getElementById('eventTimeStart').value.trim();
    const endTime = document.getElementById('eventTimeEnd').value.trim();

    if (!title || !date || !startTime || !endTime) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return false;
    }

    const eventYear = new Date(date).getFullYear();
    const currentYear = new Date().getFullYear();
    if (eventYear < currentYear) {
        alert('Год события не может быть прошедшим!');
        return false;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;

    if (endInMinutes <= startInMinutes) {
        alert('Время окончания должно быть позже времени начала!');
        return false;
    }

    return true;
}
// Функция сохранения события
function saveEvent() {
    if (!validateEventForm()) {
        return; // Останавливаем сохранение, если валидация не пройдена
    }

    const evtData = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        start: document.getElementById('eventTimeStart').value,
        end: document.getElementById('eventTimeEnd').value,
        participants: document.getElementById('eventParticipants').value,
        location: document.getElementById('eventLocation').value,
        link: document.getElementById('eventLink').value,
        description: document.getElementById('eventDescription').value,
    };

    if (editEventId) {
        // Редактирование события
        const idx = events.findIndex(e => e.id === editEventId); // idx — index
        if (idx !== -1) {
            events[idx] = { ...events[idx], ...evtData };
        }
    } else {
        // Новое событие
        const newEvt = { // evt - event
            id: Date.now(),
            ...evtData,
        };
        events.push(newEvt);
    }

    saveEventsToStorage();
    renderEvents();
    closeCreateModal();
}
function deleteEvent(evtId) {
    if (!confirm('Точно удалить?')) return;
    events = events.filter(e => e.id !== evtId);
    saveEventsToStorage();
    renderEvents();
    closeDetailsModal();
}
function clearForm() {
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTimeStart').value = '';
    document.getElementById('eventTimeEnd').value = '';
    document.getElementById('eventParticipants').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventLink').value = '';
    document.getElementById('eventDescription').value = '';
}
function fillForm(evtObj) {
    document.getElementById('eventTitle').value = evtObj.title;
    document.getElementById('eventDate').value = evtObj.date;
    document.getElementById('eventTimeStart').value = evtObj.start;
    document.getElementById('eventTimeEnd').value = evtObj.end;
    document.getElementById('eventParticipants').value = evtObj.participants || '';
    document.getElementById('eventLocation').value = evtObj.location || '';
    document.getElementById('eventLink').value = evtObj.link || '';
    document.getElementById('eventDescription').value = evtObj.description || '';
}

/* Окно с деталями события */
function showEventDetails(evtId) {
    const evtObj = events.find(e => e.id === evtId);
    if (!evtObj) return;
    // Для динамического формирования содержимого модалки
    const html = ` 
        <div class="field-row">
          <span class="field-label">Название события:</span> ${evtObj.title}
        </div>
        <div class="field-row">
          <span class="field-label">Дата:</span> ${evtObj.date}
        </div>
        <div class="field-row">
          <span class="field-label">Время:</span> ${evtObj.start} - ${evtObj.end}
        </div>
        <div class="field-row">
          <span class="field-label">Участники:</span> ${evtObj.participants || ''}
        </div>
        <div class="field-row">
          <span class="field-label">Место:</span> ${evtObj.location || ''}
        </div>
        <div class="field-row">
          <span class="field-label">Ссылка:</span> ${evtObj.link || ''}
        </div>
        <div class="field-row">
          <span class="field-label">Описание:</span> ${evtObj.description || ''}
        </div>
      `;
    detailsContent.innerHTML = html;
    editBtn.dataset.eventId = evtObj.id;
    deleteBtn.dataset.eventId = evtObj.id;
    modalOverlayDetails.classList.add('show');
    modalDetails.classList.add('show');
}
function closeDetailsModal() {
    modalOverlayDetails.classList.remove('show');
    modalDetails.classList.remove('show');
}

/* Поиск по событиям */
function doSearch() {
    const q = searchInput.value.toLowerCase().trim();
    searchResultsContainer.innerHTML = '';
    if (!q) {
        searchResultsContainer.innerHTML = '<p>Пустой запрос</p>';
        showSearchOverlay();
        return;
    }
    const found = events.filter(e => e.title.toLowerCase().includes(q));
    if (found.length === 0) {
        searchResultsContainer.innerHTML = '<p>Нет совпадений</p>';
    } else {
        let html = '';
        found.forEach(e => {
            const dt = new Date(e.date);
            const dow = getDayOfWeekShort(dt.getDay());
            const dnum = dt.getDate();
            const mon = getMonthShortName(dt.getMonth());
            html += `
            <div class="search-item" data-id="${e.id}">
              <strong>${dow}, ${dnum} ${mon}, ${e.start}-${e.end}</strong>
              <br/>
              ${e.title}
            </div>
          `;
        });
        searchResultsContainer.innerHTML = html;

        // Вешаем клик
        const items = searchResultsContainer.querySelectorAll('.search-item');
        items.forEach(it => {
            it.addEventListener('click', () => {
                const eId = Number(it.dataset.id);
                hideSearchOverlay();
                showEventDetails(eId);
            });
        });
    }
    searchInput.value = '';
    showSearchOverlay();
}
function showSearchOverlay() {
    searchOverlay.classList.add('show');
    searchModal.classList.add('show');
}
function hideSearchOverlay() {
    searchOverlay.classList.remove('show');
    searchModal.classList.remove('show');
}

/* Вспомогательные методы */

// Для "поиска" понедельника по номеру дня недели
function getMonday(date) {
    const d = new Date(date);
    let day = d.getDay();
    if (day === 0) day = 7;
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
}
// дд:мм:гггг
function formatDateToYMD(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
// Сравнение по дате
function isSameDate(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}
// Разборка времени в чч:мм
function parseTime(t) {
    const [h, m] = t.split(':').map(Number);
    return [h, m];
}
// Сборка времени в чч:мм
function formatTime(h, m) {
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// метод для корректного отображения даты
function formatDateWithGenitive(dt) {
    const dnum = dt.getDate();
    const mgen = getMonthGenitive(dt.getMonth());
    const yyyy = dt.getFullYear();
    return `${dnum} ${mgen} ${yyyy}`;
}
// метод для склонения месяцев по род. падежу XDDD
function getMonthGenitive(idx) {
    const arr = [
        'января','февраля','марта','апреля','мая','июня',
        'июля','августа','сентября','октября','ноября','декабря'
    ];
    return arr[idx];
}
// метод для коротких имен месяцев
function getMonthShortName(idx) {
    const arr = [
        'янв','фев','мар','апр','май','июн',
        'июл','авг','сен','окт','ноя','дек'
    ];
    return arr[idx];
}
// метод для полных имен месяцев
function getFullMonthName(idx) {
    const arr = [
        'Январь','Февраль','Март','Апрель','Май','Июнь',
        'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
    ];
    return arr[idx];
}
// метод для коротких имен дней (воскресенье = 0)
function getDayOfWeekShort(dayI) {
    const arr = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
    return arr[dayI];
}

// LocalStorage
function loadEventsFromStorage() {
    const saved = localStorage.getItem('myCalendarEvents');
    if (saved) {
        events = JSON.parse(saved);
    }
}
function saveEventsToStorage() {
    localStorage.setItem('myCalendarEvents', JSON.stringify(events));
}


