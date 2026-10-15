import React, { useState, useEffect } from 'react';
import { fetchToday, fetchSlots } from './api';

const MONTHS_NOMINATIVE = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAYS_OF_WEEK = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function App() {
    const [today, setToday] = useState(null);
    const [currentYear, setCurrentYear] = useState(2026);
    const [currentMonth, setCurrentMonth] = useState(9);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const [slots, setSlots] = useState([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        fetchToday()
            .then(data => {
                if (!isMounted) return;
                const serverToday = new Date(data.year, data.month, data.day);
                setToday(serverToday);
                setCurrentYear(data.year);
                setCurrentMonth(data.month);
                setSelectedDate(serverToday);
                setIsLoadingPage(false);
            })
            .catch(() => {
                if (isMounted) {
                    setGlobalError('Ошибка сервера при загрузке даты. Пожалуйста, обновите страницу.');
                    setIsLoadingPage(false);
                }
            });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!selectedDate) return;
        let isMounted = true;
        setIsLoadingSlots(true);

        fetchSlots(selectedDate)
            .then(data => {
                if (!isMounted) return;
                const formattedDateStr = selectedDate.toISOString().split('T')[0];
                if (data.date === formattedDateStr) {
                    setSlots(data.slots || []);
                }
                setIsLoadingSlots(false);
            })
            .catch(() => {
                if (isMounted) {
                    setGlobalError('Не удалось загрузить временные слоты. Попробуйте выбрать другой день.');
                    setIsLoadingSlots(false);
                }
            });

        return () => { isMounted = false; };
    }, [selectedDate]);

    if (isLoadingPage) return <div className="loading">Загрузка календаря...</div>;
    if (globalError && !today) return <div className="error">{globalError}</div>;

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleDayClick = (day) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
        setSelectedTime(null);
    };

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

    const getBottomBarText = () => {
        if (!selectedDate) return 'Выберите дату и время';
        const dayOfWeek = DAYS_OF_WEEK[selectedDate.getDay()];
        const dayNum = selectedDate.getDate();
        const monthText = MONTHS_GENITIVE[selectedDate.getMonth()];
        const yearNum = selectedDate.getFullYear();
        const timeText = selectedTime ? ` • ${selectedTime}` : ' • Время не выбрано';
        return `${dayOfWeek}, ${dayNum} ${monthText} ${yearNum}${timeText}`;
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
                <div className="step active">3</div>
                <div className="line"></div>
                <div className="step">4</div>
                <div className="line"></div>
                <div className="step">5</div>
            </div>

            <main className="main-content">
                <div className="title-block">
                    <button className="btn-back">←</button>
                    <h1>Выберите дату и время</h1>
                </div>

                {globalError && <div className="error">{globalError}</div>}

                <div className="booking-container">
                    <section className="calendar-section">
                        <div className="calendar-header">
                            <h2>{MONTHS_NOMINATIVE[currentMonth]} {currentYear}</h2>
                            <div className="calendar-nav">
                                <button onClick={handlePrevMonth}>&lt;</button>
                                <button onClick={handleNextMonth}>&gt;</button>
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
                                    <div
                                        key={`day-${item.dayNum}`}
                                        className={`day ${item.isOld ? 'old' : ''} ${isSelected ? 'active' : ''}`}
                                        onClick={item.isOld ? undefined : () => handleDayClick(item.dayNum)}
                                    >
                                        {item.dayNum}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="time-section">
                        <h2>Доступное время</h2>
                        {isLoadingSlots ? (
                            <div className="loading">Загрузка слотов...</div>
                        ) : (
                            <div className="time-grid">
                                {slots.map(slotItem => {
                                    const isSelected = selectedTime === slotItem.time;

                                    return (
                                        <button
                                            key={slotItem.time}
                                            className={`time-slot ${!slotItem.available ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                                            disabled={!slotItem.available}
                                            onClick={() => setSelectedTime(slotItem.time)}
                                        >
                                            {slotItem.time}
                                            {!slotItem.available && <span> Занято</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                <div className="bottom-info-bar">
                    {getBottomBarText()}
                </div>

                <button className="btn-next">Далее</button>
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

