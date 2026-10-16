
import React, { useState, useEffect } from 'react';
import { fetchToday, fetchSlots } from './api';

const MONTHS_NOMINATIVE = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAYS_OF_WEEK = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function Calendar({ currentYear, currentMonth, selectedDate, todayDate, onDaySelect, onPrevMonth, onNextMonth }) {
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
                isOld: cellDate < todayDate
            });
        }
        return days;
    };

    return (
        <section className="calendar-section">
            <div className="calendar-header">
                <h2>{MONTHS_NOMINATIVE[currentMonth]} {currentYear}</h2>
                <div className="calendar-nav">
                    <button type="button" onClick={onPrevMonth}>&lt;</button>
                    <button type="button" onClick={onNextMonth}>&gt;</button>
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

                    const isSelected = selectedDate &&
                        selectedDate.getDate() === item.dayNum &&
                        selectedDate.getMonth() === currentMonth &&
                        selectedDate.getFullYear() === currentYear;

                    return (
                        <button
                            key={`day-${item.dayNum}`}
                            type="button"
                            className={`day ${item.isOld ? 'old' : ''} ${isSelected ? 'active' : ''}`}
                            disabled={item.isOld}
                            onClick={() => onDaySelect(item.dayNum)}
                        >
                            {item.dayNum}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function TimeSlots({ slots, loading, error, selectedTime, onTimeSelect }) {
    if (loading) {
        return (
            <section className="time-section">
                <h2>Доступное время</h2>
                <div className="time-grid">
                    <p style={{ color: '#666', gridColumn: '1 / -1' }}>Загрузка слотов...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="time-section">
                <h2>Доступное время</h2>
                <div className="time-grid">
                    <p style={{ color: '#ff4d4d', gridColumn: '1 / -1' }}>{error}</p>
                </div>
            </section>
        );
    }

    if (!slots || slots.length === 0) {
        return (
            <section className="time-section">
                <h2>Доступное время</h2>
                <div className="time-grid">
                    <p style={{ color: '#999', gridColumn: '1 / -1' }}>Выберите доступную дату в календаре</p>
                </div>
            </section>
        );
    }

    return (
        <section className="time-section">
            <h2>Доступное время</h2>
            <div className="time-grid">
                {slots.map(slot => {
                    const isDisabled = !slot.available;
                    const isSelected = selectedTime === slot.time;

                    return (
                        <button
                            key={slot.time}
                            type="button"
                            className={`time-slot ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                            disabled={isDisabled}
                            onClick={() => onTimeSelect(slot.time)}
                        >
                            {slot.time}
                            {isDisabled && <span> Занято</span>}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function BottomInfoBar({ selectedDate, selectedTime }) {
    if (!selectedDate) {
        return <div className="bottom-info-bar">Дата и время не выбраны</div>;
    }

    const dayOfWeek = DAYS_OF_WEEK[selectedDate.getDay()];
    const dayNum = selectedDate.getDate();
    const monthText = MONTHS_GENITIVE[selectedDate.getMonth()];
    const yearNum = selectedDate.getFullYear();
    const timeText = selectedTime ? ` • ${selectedTime}` : ' • Время не выбрано';

    return <div className="bottom-info-bar">{`${dayOfWeek}, ${dayNum} ${monthText} ${yearNum}${timeText}`}</div>;
}

export default function App() {
    const [todayDate, setTodayDate] = useState(null);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState(null);

    const [slots, setSlots] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [pageError, setPageError] = useState(null);
    const [slotsError, setSlotsError] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        let active = true;
        fetchToday()
            .then(data => {
                if (!active) return;
                const dateObj = new Date(data.year, data.month, data.day);
                setTodayDate(dateObj);
                setCurrentYear(data.year);
                setCurrentMonth(data.month);
                setPageLoading(false);
            })
            .catch(err => {
                if (!active) return;
                setPageError(err.message || 'Не удалось загрузить данные с сервера');
                setPageLoading(false);
            });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!selectedDate) {
            setSlots([]);
            return;
        }

        let active = true;
        setSlotsLoading(true);
        setSlotsError(null);

        fetchSlots(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear())
            .then(data => {
                if (!active) return;
                setSlots(data.slots || []);
                setSlotsLoading(false);
            })
            .catch(err => {
                if (!active) return;
                setSlotsError(err.message || 'Ошибка загрузки временных слотов');
                setSlotsLoading(false);
            });

        return () => { active = false; };
    }, [selectedDate]);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const handleDaySelect = (day) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
        setSelectedTime(null);
    };

    if (pageLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', fontWeight: 'bold' }}>Загрузка...</div>;
    }

    if (pageError) {
        return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ff4d4d', gap: '20px' }}><h2>Произошла ошибка</h2><p>{pageError}</p></div>;
    }

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
                    <h1>Выберите дату и время</h1>
                    <button
                        className="btn-next"
                        type="button"
                        disabled={!selectedDate || !selectedTime}
                        onClick={() => {
                            const dayNum = selectedDate.getDate();
                            const monthText = MONTHS_GENITIVE[selectedDate.getMonth()];
                            const yearNum = selectedDate.getFullYear();
                            alert(`Запись успешно подтверждена на ${dayNum} ${monthText} ${yearNum} в ${selectedTime}`);
                        }}
                    >
                        Далее
                    </button>
                </div>

                <div className="booking-layout">
                    {todayDate && (
                        <Calendar
                            currentYear={currentYear}
                            currentMonth={currentMonth}
                            selectedDate={selectedDate}
                            todayDate={todayDate}
                            onDaySelect={handleDaySelect}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                        />
                    )}
                    <TimeSlots
                        slots={slots}
                        loading={slotsLoading}
                        error={slotsError}
                        selectedTime={selectedTime}
                        onTimeSelect={setSelectedTime}
                    />
                </div>

                <BottomInfoBar selectedDate={selectedDate} selectedTime={selectedTime} />
            </main>

            <footer className="footer">
                <div className="footer-column">
                    <div className="logo">LOGO</div>
                    <p>Дружелюбное описание услуг</p>
                </div>
                <div className="footer-column">
                    <h3>КОНТАКТЫ</h3>
                    <p>ул. Садовая, 15, Москва</p>
                    <p>+7 (495) 123-45-67</p>
                </div>
                <div className="footer-column">
                    <h3>РЕЖИМ РАБОТЫ</h3>
                    <p>Пн–Пт: 9:00 – 21:00</p>
                    <p>Сб–Вс: 10:00 – 19:00</p>
                </div>
                <div className="footer-bottom">
                    <p>© 2026. Все права защищены.</p>
                    <a href="#">Политика конфиденциальности</a>
                </div>
            </footer>
        </div>
    );
}
