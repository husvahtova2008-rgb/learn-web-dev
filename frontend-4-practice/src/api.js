async function request(url) {
    const response = await fetch(url);
    if (!response.ok) {
        let message = `HTTP error ${response.status}`;
        try {
            const data = await response.json();
            if (data && data.error) message = data.error;
        } catch (e) {}
        throw new Error(message);
    }
    return response.json();
}

export function fetchToday() {
    return request('/api/booking/today');
}

export function fetchSlots(day, month, year) {
    return request(`/api/slots?day=${day}&month=${month}&year=${year}`);
}
