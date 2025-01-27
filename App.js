import {
    getMonday,
    formatDateWithGenitive
} from './utils.js';

import { WeekCalendar } from './WeekCalendar.js';
import { MiniCalendar } from './MiniCalendar.js';
import { EventsManager } from './EventsManager.js';
import { SearchManager } from './SearchManager.js';

// Симуляция API-запроса (POST)
function fakeApiRequest(event) {
    return new Promise((resolve, reject) => {
        console.log('Отправка данных на сервер...');
        setTimeout(() => {
            console.log('Данные успешно отправлены:', event);
            resolve({ success: true, message: 'Событие успешно сохранено на сервере!' });
        }, 2000);
    });
}

export class App {
    constructor() {
        this.eventsRef = { value: [] };
        this.selectedDateRef = { value: new Date() };
        this.currentMonday = getMonday(new Date());
        this.currentDateForMini = new Date();

        this.initDOM();

        // Подгружаем события из localStorage
        this.loadEventsFromStorage();

        this.weekCalendar = new WeekCalendar(
            this.weekCalendarElem,
            (dateStr, timeStr) => this.openCreateModal(dateStr, timeStr),
            (evtId) => this.eventsManager.showEventDetails(evtId)
        );

        this.miniCalendar = new MiniCalendar(
            this.miniCalendarGrid,
            this.currentMonthElem,
            this.selectedDateRef,
            (dateClicked) => this.onSelectDateFromMini(dateClicked)
        );

        this.eventsManager = new EventsManager(
            this.modalOverlayCreate,
            this.modalCreate,
            this.modalOverlayDetails,
            this.modalDetails,
            this.detailsContent,
            this.editBtn,
            this.deleteBtn,
            this.closeDetailsBtn,
            this.eventForm,
            this.eventsRef,
            // Колбэк при обновлении массива событий:
            () => this.onEventsUpdated(),
            fakeApiRequest
        );

        this.searchManager = new SearchManager(
            this.searchOverlay,
            this.searchModal,
            this.searchInput,
            this.closeSearchBtn,
            this.searchResultsContainer,
            (evtId) => this.eventsManager.showEventDetails(evtId),
            this.eventsRef
        );

        this.buildWeekCalendar();
        this.eventsManagerModalEvents();
        this.weekCalendar.renderEvents(this.eventsRef.value);
        this.updateWeekRangeLabel();
        this.miniCalendar.renderMiniCalendar(this.currentDateForMini);

        // Привязываем клик на кнопки следующая неделя/предыдущая неделя
        this.initListeners();
    }

    initDOM() {
        this.weekCalendarElem  = document.getElementById('weekCalendar');
        this.newEventBtn       = document.getElementById('newEventBtn');
        this.cancelBtn         = document.getElementById('cancelBtn');
        this.eventForm         = document.getElementById('eventForm');
        this.modalOverlayCreate= document.getElementById('modalOverlayCreate');
        this.modalCreate       = document.getElementById('modalCreate');
        this.modalOverlayDetails = document.getElementById('modalOverlayDetails');
        this.modalDetails      = document.getElementById('modalDetails');
        this.detailsContent    = document.getElementById('detailsContent');
        this.editBtn           = document.getElementById('editBtn');
        this.deleteBtn         = document.getElementById('deleteBtn');
        this.closeDetailsBtn   = document.getElementById('closeDetailsBtn');
        this.searchInput       = document.getElementById('searchInput');
        this.searchOverlay     = document.getElementById('searchOverlay');
        this.searchModal       = document.getElementById('searchModal');
        this.closeSearchBtn    = document.getElementById('closeSearchBtn');
        this.searchResultsContainer = document.getElementById('searchResultsContainer');
        this.prevWeekBtn       = document.getElementById('prevWeekBtn');
        this.nextWeekBtn       = document.getElementById('nextWeekBtn');
        this.weekRangeLabel    = document.getElementById('weekRangeLabel');
        this.prevMonthBtn      = document.getElementById('prevMonthBtn');
        this.nextMonthBtn      = document.getElementById('nextMonthBtn');
        this.miniCalendarGrid  = document.getElementById('miniCalendarGrid');
        this.currentMonthElem  = document.getElementById('currentMonth');
    }

    initListeners() {
        this.newEventBtn.addEventListener('click', () => {
            this.openCreateModal();
        });
        this.cancelBtn.addEventListener('click', () => {
            this.eventsManager.closeCreateModal();
        });

        // Переключение недель
        this.prevWeekBtn.addEventListener('click', () => {
            this.currentMonday.setDate(this.currentMonday.getDate() - 7);
            this.buildWeekCalendar();
            this.weekCalendar.renderEvents(this.eventsRef.value);
            this.updateWeekRangeLabel();
        });
        this.nextWeekBtn.addEventListener('click', () => {
            this.currentMonday.setDate(this.currentMonday.getDate() + 7);
            this.buildWeekCalendar();
            this.weekCalendar.renderEvents(this.eventsRef.value);
            this.updateWeekRangeLabel();
        });

        // Переключение месяцев
        this.prevMonthBtn.addEventListener('click', () => {
            this.currentDateForMini.setMonth(this.currentDateForMini.getMonth() - 1);
            this.miniCalendar.renderMiniCalendar(this.currentDateForMini);
        });
        this.nextMonthBtn.addEventListener('click', () => {
            this.currentDateForMini.setMonth(this.currentDateForMini.getMonth() + 1);
            this.miniCalendar.renderMiniCalendar(this.currentDateForMini);
        });
    }

    onSelectDateFromMini(dateClicked) {
        this.currentMonday = getMonday(dateClicked);
        this.buildWeekCalendar();
        this.weekCalendar.renderEvents(this.eventsRef.value);
        this.updateWeekRangeLabel();
    }

    buildWeekCalendar() {
        this.weekCalendar.buildWeekCalendar(this.currentMonday);
    }

    updateWeekRangeLabel() {
        const mon = new Date(this.currentMonday);
        const sun = new Date(mon);
        sun.setDate(sun.getDate() + 6);
        this.weekRangeLabel.textContent = `${formatDateWithGenitive(mon)} - ${formatDateWithGenitive(sun)}`;
    }

    openCreateModal(dateStr = '', timeStr = '') {
        this.eventsManager.openCreateModal(dateStr, timeStr);
    }

    onEventsUpdated() {
        // Сохраняем в localStorage
        this.saveEventsToStorage();
        // Перерендерим календарь по неделям
        this.weekCalendar.renderEvents(this.eventsRef.value);
    }

    eventsManagerModalEvents() {
        // Функционал уже прописан в конструкторе EventsManager.
    }

    loadEventsFromStorage() {
        const saved = localStorage.getItem('myCalendarEvents');
        if (saved) {
            this.eventsRef.value = JSON.parse(saved);
        }
    }

    saveEventsToStorage() {
        localStorage.setItem('myCalendarEvents', JSON.stringify(this.eventsRef.value));
    }
}