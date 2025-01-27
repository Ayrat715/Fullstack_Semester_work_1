import { parseTime, formatTime } from './utils.js';

export class EventsManager {
    constructor(
        modalOverlayCreate,
        modalCreate,
        modalOverlayDetails,
        modalDetails,
        detailsContent,
        editBtn,
        deleteBtn,
        closeDetailsBtn,
        eventForm,
        eventsRef,
        onEventsUpdated,
        fakeApiRequest
    ) {
        this.modalOverlayCreate = modalOverlayCreate;
        this.modalCreate = modalCreate;
        this.modalOverlayDetails = modalOverlayDetails;
        this.modalDetails = modalDetails;
        this.detailsContent = detailsContent;
        this.editBtn = editBtn;
        this.deleteBtn = deleteBtn;
        this.closeDetailsBtn = closeDetailsBtn;
        this.eventForm = eventForm;

        // Храним массив событий
        this.eventsRef = eventsRef;
        // Callback, который вызывается после обновления массива событий,
        // чтобы перерисовать «большой» календарь
        this.onEventsUpdated = onEventsUpdated;

        // Текущий id события для редактирования
        this.editEventId = null;
        this.fakeApiRequest = fakeApiRequest;

        // Добавляем обработчики
        this.closeDetailsBtn.addEventListener('click', () => this.closeDetailsModal());
        this.editBtn.addEventListener('click', () => {
            const evtId = this.editBtn.dataset.eventId;
            if (evtId) this.openEditModal(Number(evtId));
        });
        this.deleteBtn.addEventListener('click', () => {
            const evtId = this.deleteBtn.dataset.eventId;
            if (evtId) this.deleteEvent(Number(evtId));
        });
        // Сохраняем форму
        this.eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });
    }

    /* Создание и редактирование событий */
    openCreateModal(dateStr = '', startTime = '') {
        this.editEventId = null;
        document.getElementById('modalCreateTitle').textContent = 'Создать событие';
        this.clearForm();
        this.modalOverlayCreate.classList.add('show');
        this.modalCreate.classList.add('show');

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

    openEditModal(evtId) {
        this.editEventId = evtId;
        const evtObj = this.eventsRef.value.find(e => e.id === evtId);
        if (!evtObj) return;
        this.closeDetailsModal();

        document.getElementById('modalCreateTitle').textContent = 'Редактировать событие';
        this.fillForm(evtObj);

        this.modalOverlayCreate.classList.add('show');
        this.modalCreate.classList.add('show');
    }

    closeCreateModal() {
        this.modalOverlayCreate.classList.remove('show');
        this.modalCreate.classList.remove('show');
    }

    /* Окно с деталями события */
    showEventDetails(evtId) {
        const evtObj = this.eventsRef.value.find(e => e.id === evtId);
        if (!evtObj) return;

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
        this.detailsContent.innerHTML = html;
        this.editBtn.dataset.eventId = evtObj.id;
        this.deleteBtn.dataset.eventId = evtObj.id;
        this.modalOverlayDetails.classList.add('show');
        this.modalDetails.classList.add('show');
    }

    closeDetailsModal() {
        this.modalOverlayDetails.classList.remove('show');
        this.modalDetails.classList.remove('show');
    }

    // Асинхронная функция сохранения события
    async saveEvent() {
        if (!this.validateEventForm()) return;

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

        try {
            // Отправляем данные на сервер
            const response = await this.fakeApiRequest(evtData);
            console.log(response.message);

            if (this.editEventId) {
                // Редактирование
                const eventIndex = this.eventsRef.value.findIndex(e => e.id === this.editEventId);
                if (eventIndex !== -1) {
                    this.eventsRef.value[eventIndex] = {
                        ...this.eventsRef.value[eventIndex],
                        ...evtData
                    };
                }
            } else {
                // Новое событие
                const newEvt = { id: Date.now(), ...evtData };
                this.eventsRef.value.push(newEvt);
            }

            this.onEventsUpdated(); // Сигнал, что events обновились
            this.closeCreateModal();

        } catch (error) {
            console.error('Ошибка при отправке данных на сервер:', error);
            alert('Не удалось сохранить событие. Попробуйте снова.');
        }
    }

    // Удаление события
    deleteEvent(evtId) {
        if (!confirm('Точно удалить?')) return;
        this.eventsRef.value = this.eventsRef.value.filter(e => e.id !== evtId);
        this.onEventsUpdated();
        this.closeDetailsModal();
    }

    // Проверка корректности данных формы
    validateEventForm() {
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

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startInMin = startH * 60 + startM;
        const endInMin = endH * 60 + endM;

        if (endInMin <= startInMin) {
            alert('Время окончания должно быть позже времени начала!');
            return false;
        }

        return true;
    }

    clearForm() {
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTimeStart').value = '';
        document.getElementById('eventTimeEnd').value = '';
        document.getElementById('eventParticipants').value = '';
        document.getElementById('eventLocation').value = '';
        document.getElementById('eventLink').value = '';
        document.getElementById('eventDescription').value = '';
    }

    fillForm(evtObj) {
        document.getElementById('eventTitle').value = evtObj.title;
        document.getElementById('eventDate').value = evtObj.date;
        document.getElementById('eventTimeStart').value = evtObj.start;
        document.getElementById('eventTimeEnd').value = evtObj.end;
        document.getElementById('eventParticipants').value = evtObj.participants || '';
        document.getElementById('eventLocation').value = evtObj.location || '';
        document.getElementById('eventLink').value = evtObj.link || '';
        document.getElementById('eventDescription').value = evtObj.description || '';
    }
}