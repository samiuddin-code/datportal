import { Action, AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "../store";

export type actionType = AnyAction
export type dispatchType = ThunkDispatch<RootState, void, Action>;