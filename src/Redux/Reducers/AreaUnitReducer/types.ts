// action constants

export const SET_AREA_UNIT_DATA = "SET_AREA_UNIT_DATA";
export const ADD_AREA_UNIT_DATA = "ADD_AREA_UNIT_DATA";
export const SET_AREA_UNIT_DROPDOWN_DATA = "SET_AREA_UNIT_DROPDOWN_DATA";
export const EDIT_AREA_UNIT_DATA = "EDIT_AREA_UNIT_DATA";
export const DELETE_AREA_UNIT_DATA = "DELETE_AREA_UNIT_DATA";
export const GET_SINGLE_AREA_UNIT_DATA = "GET_SINGLE_AREA_UNIT_DATA";

// types
export type AreaUnit = {
  id: number
  name: string
  symbol: string
  rate: number
  isPublished: boolean
  isDeleted: boolean
}
