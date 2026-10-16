import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { nextMonth, prevMonth, selectDate, selectTime } from './api';

const MONTHS_NOMINATIVE = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAYS_OF_WEEK = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

function CalendarComponent() {
    const dispatch = useDispatch();
    const { currentYear, currentMonth, selectedDate } = useSelector(state => state.booking);

    const parsedSelectedDate = selectedDate ? new Date(selectedDate) : null;

    const getCalendarDays = () => {
        const days = [];
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < shift; i++) {
            days.push({ dayNum: null, isOld: true });
        }

        for (let day = 1; day <= totalDays; day++) {
            const cellDate = new Date(currentYear, currentMonth, day);
            days.push({
                dayNum: day,
                isOld: cellDate < today
            });
        }
        return days;
    };

    return (
        <section className="calendar-section">
            <div className="calendar-header">
                <h2>{MONTHS_NOMINATIVE[currentMonth]} {currentYear}</h2>
                <div className="calendar-nav">
                    <button type="button" onClick={() => dispatch(prevMonth())}>&lt;</button>
                    <button type="button" onClick={() => dispatch(nextMonth())}>&gt;</button>
                </div>
            </div>
            <div className="calendar-grid">
                {DAY_NAMES_SHORT.map(name => (
                    <div key={name} className="day-name">{name}</div>
                ))}
                {getCalendarDays().map((item, index) => {
                    if (item.dayNum === null) {
                        return <div key={`empty-${index}`} className="day old"></div>;
                    }

                    const isSelected = parsedSelectedDate && 
                        parsedSelectedDate.getDate() === item.dayNum && 
                        parsedSelectedDate.getMonth() === currentMonth && 
                        parsedSelectedDate.getFullYear() === currentYear;

                    return (
                        <button
                            key={`day-${item.dayNum}`}
                            type="button"
                            className={`day ${item.isOld ? 'old' : ''} ${isSelected ? 'active' : ''}`}
                            disabled={item.isOld}
                            onClick={() => dispatch(selectDate(new Date(currentYear, currentMonth, item.dayNum).toISOString()))}
                        >
                            {item.dayNum}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function TimeSlotsComponent() {
    const dispatch = useDispatch();
    const { selectedDate, selectedTime, availableSlots } = useSelector(state => state.booking);

    if (!selectedDate) {
        return (
            <section className="time-section">
                <h2>Доступное время</h2>
                <div className="time-grid">
                    <p style={{ gridColumn: '1 / -1', color: '#999' }}>Выберите дату для просмотра времени</p>
                </div>
            </section>
        );
    }

    const parsedDate = new Date(selectedDate);
    
    const getDisabledSlotsForDate = (date) => {
        const day = date.getDate();
        return day % 2 === 0 ? ['10:00', '14:00', '16:00'] : ['11:00', '13:00'];
    };

    const disabledSlots = getDisabledSlotsForDate(parsedDate);

    return (
        <section className="time-section">
            <h2>Доступное время</h2>
            <div className="time-grid">
                {availableSlots.map(time => {
                    const isDisabled = disabledSlots.includes(time);
                    const isSelected = selectedTime === time;

                    return (
                        <button
                            key={time}
                            type="button"
                            className={`time-slot ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                            disabled={isDisabled}
                            onClick={() => dispatch(selectTime(time))}
                        >
                            {time}
                            {isDisabled && <span> Занято</span>}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function BottomInfoBarComponent() {
    const { selectedDate, selectedTime } = useSelector(state => state.booking);

    if (!selectedDate) {
        return <div className="bottom-info-bar">Дата и время не выбраны</div>;
    }

    const parsedDate = new Date(selectedDate);
    const dayOfWeek = DAYS_OF_WEEK[parsedDate.getDay()];
    const dayNum = parsedDate.getDate();
    const monthText = MONTHS_GENITIVE[parsedDate.getMonth()];
    const yearNum = parsedDate.getFullYear();
    const timeText = selectedTime ? ` • ${selectedTime}` : ' • Время не выбрано';

    return (
        <div className="bottom-info-bar">
            {`${dayOfWeek}, ${dayNum} ${monthText} ${yearNum}${timeText}`}
        </div>
    );
}

export default function App() {
    const { selectedDate, selectedTime } = useSelector(state => state.booking);

    const handleNextSubmit = () => {
        if (selectedDate && selectedTime) {
            const parsedDate = new Date(selectedDate);
            alert(`Успешная запись через Redux на ${parsedDate.getDate()} ${MONTHS_GENITIVE[parsedDate.getMonth()]} в ${selectedTime}`);
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="logo">LOGO</div>
                <nav className="nav">
                    <a href="#">Услуги</a>
                    <a href="#">Галерея</a>
                    <a href="#">Команда</a>
                    <a href="#">Отзывы</a>
                    <a href="#">Контакты</a>
                </nav>
            </header>

            <div className="progress-bar">
                <div className="step done">1</div>
                <div className="line done"></div>
                <div className="step done">2</div>
                <div className="line done"></div>
                <div className="step done">3</div>
                <div className="line done"></div>
                <div className="step active">4</div>
                <div className="line"></div>
                <div className="step">5</div>
            </div>

            <main className="main-content">
                <div className="title-block">
                    <button className="btn-back" type="button">←</button>
                    <h1>Выберите дату и время (Redux)</h1>
                </div>

                <div className="booking-container">
                    <CalendarComponent />
                    <TimeSlotsComponent />
                </div>

                <BottomInfoBarComponent />

                <button 
                    className="btn-next" 
                    type="button" 
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleNextSubmit}
                >
                    Далее
                </button>
            </main>

            <footer className="footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="logo">LOGO</div>
                        <p>Дружелюбное описание услуг</p>
                    </div>
                    <div className="footer-contacts">
                        <h3>КОНТАКТЫ</h3>
                        <p>ул. Садовая, 15, Москва</p>
                        <p>+7 (495) 123-45-67</p>
                    </div>
                    <div className="footer-hours">
                        <h3>РЕЖИМ РАБОТЫ</h3>
                        <p>Пн–Пт: 9:00 – 21:00</p>
                        <p>Сб–Вс: 10:00 – 19:00</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026. Все права защищены.</p>
                    <a href="#">Политика конфиденциальности</a>
                </div>
            </footer>
        </div>
    );
}
