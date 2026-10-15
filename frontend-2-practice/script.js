const MONTHS_NOMINATIVE = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAYS_OF_WEEK = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const state = {
    currentYear: 2026,
    currentMonth: 9,
    selectedDate: new Date(2026, 9, 15),
    selectedTime: null,
    availableSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    disabledSlots: ['11:00', '13:00']
};

const today = new Date(2026, 9, 15);

function init() {
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
    setupMonthNavigation();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-month-year');
    
    title.innerText = `${MONTHS_NOMINATIVE[state.currentMonth]} ${state.currentYear}`;
    grid.innerHTML = '';

    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayNames.forEach(name => {
        const el = document.createElement('div');
        el.className = 'day-name';
        el.innerText = name;
        grid.appendChild(el);
    });

    const firstDayIndex = new Date(state.currentYear, state.currentMonth, 1).getDay();
    const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

    for (let i = 0; i < shift; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day old';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day';
        dayCell.innerText = day;

        const currentCellDate = new Date(state.currentYear, state.currentMonth, day);

        if (currentCellDate < today) {
            dayCell.classList.add('old');
        } else {
            if (state.selectedDate && 
                state.selectedDate.getDate() === day && 
                state.selectedDate.getMonth() === state.currentMonth && 
                state.selectedDate.getFullYear() === state.currentYear) {
                dayCell.classList.add('active');
            }
            
            dayCell.addEventListener('click', () => onDayClick(day));
        }
        grid.appendChild(dayCell);
    }
}

function renderTimeSlots() {
    const grid = document.getElementById('time-grid');
    grid.innerHTML = '';

    state.availableSlots.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        slot.innerText = time;

        if (state.disabledSlots.includes(time)) {
            slot.classList.add('disabled');
            const span = document.createElement('span');
            span.innerText = ' Занято';
            slot.appendChild(span);
        } else {
            if (state.selectedTime === time) {
                slot.classList.add('selected');
            }
            slot.addEventListener('click', () => onTimeSlotClick(time));
        }
        grid.appendChild(slot);
    });
}

function onDayClick(day) {
    state.selectedDate = new Date(state.currentYear, state.currentMonth, day);
    state.selectedTime = null;
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

function onTimeSlotClick(time) {
    state.selectedTime = time;
    renderTimeSlots();
    updateBottomBar();
}

function updateBottomBar() {
    const bar = document.getElementById('bottom-info-bar');
    if (!state.selectedDate) {
        bar.innerText = 'Выберите дату и время';
        return;
    }

    const dayOfWeek = DAYS_OF_WEEK[state.selectedDate.getDay()];
    const dayNum = state.selectedDate.getDate();
    const monthText = MONTHS_GENITIVE[state.selectedDate.getMonth()];
    const yearNum = state.selectedDate.getFullYear();
    const timeText = state.selectedTime ? ` • ${state.selectedTime}` : ' • Время не выбрано';

    bar.innerText = `${dayOfWeek}, ${dayNum} ${monthText} ${yearNum}${timeText}`;
}

function setupMonthNavigation() {
    document.getElementById('btn-prev-month').addEventListener('click', () => {
        state.currentMonth--;
        if (state.currentMonth < 0) {
            state.currentMonth = 11;
            state.currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('btn-next-month').addEventListener('click', () => {
        state.currentMonth++;
        if (state.currentMonth > 11) {
            state.currentMonth = 0;
            state.currentYear++;
        }
        renderCalendar();
    });
}

document.addEventListener('DOMContentLoaded', init);
