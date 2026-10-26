export const ReservacionesReducer = (state = [], action) => {
    switch (action.type) {
        case "load":
            return action.payload;
        case "add":
            return [...state, action.payload];
        case "update":
            return state.map((actual) =>
                actual.id === action.payload.id ? action.payload : actual
            );
        case "delete":
            return state.filter((actual) => actual.id !== action.payload);
        default:
            return state;
    }
}
