import { applyMiddleware, legacy_createStore } from "redux";
import thunk from "redux-thunk";
import rootReducer from "../Reducers/rootReducer";


const middleWares = [thunk];
const store = legacy_createStore(rootReducer, applyMiddleware(...middleWares));
export type RootState = ReturnType<typeof store.getState>;
export default store