import { configureStore, createSlice } from '@reduxjs/toolkit';

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

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const bookingSlice = createSlice({
    name: 'booking',
    initialState: {
        currentYear: today.getFullYear(),
        currentMonth: today.getMonth(),
        selectedDate: null,
        selectedTime: null,
        availableSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    },
    reducers: {
        nextMonth: (state) => {
            if (state.currentMonth === 11) {
                state.currentMonth = 0;
                state.currentYear += 1;
            } else {
                state.currentMonth += 1;
            }
            state.selectedDate = null;
            state.selectedTime = null;
        },
        prevMonth: (state) => {
            if (state.currentMonth === 0) {
                state.currentMonth = 11;
                state.currentYear -= 1;
            } else {
                state.currentMonth -= 1;
            }
            state.selectedDate = null;
            state.selectedTime = null;
        },
        selectDate: (state, action) => {
            state.selectedDate = action.payload;
            state.selectedTime = null;
        },
        selectTime: (state, action) => {
            state.selectedTime = action.payload;
        }
    }
});

export { request };
export const { nextMonth, prevMonth, selectDate, selectTime } = bookingSlice.actions;

export const store = configureStore({
    reducer: {
        booking: bookingSlice.reducer
    }
});
