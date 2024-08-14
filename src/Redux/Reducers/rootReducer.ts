import { combineReducers } from "redux";
import AddAmenitiesReducer from "./AddAmenitiesReducer/reducer";
import AddImageReducer from "./AddImageReducer/reducer";
import AddPriceReducer from "./AddPriceReducer/reducer";
import AddPropertyDetailsReducer from "./AddPropertyDetailsReducer/reducer";
import adminNavReducer from "./AdminNavReducer/reducer";
import areaUnitReducer from "./AreaUnitReducer/reducer";
import countryReducer from "./countryReducer/reducer";
import currencyReducer from "./currencyReducer/reducer";
import languageReducer from "./LanguageReducer/reducer";
import locationReducer from "./LocationsReducer/reducer";
import loginReducer from "./LoginReducer/reducer";
import organizationReducer from "./OrganizationReducer/reducer";
import packageReducer from "./PackagesReducer/reducer";
import propertiesReducer from "./propertiesReducer/reducer";
import roleReducer from "./RolesReducer/reducer";
import usersReducer from "./UsersReducer/reducer";
import systemModulesReducer from "./SystemModulesReducer/reducer";

export default combineReducers({
	loginReducer: loginReducer,
	adminNavReducer: adminNavReducer,
	countryReducer: countryReducer,
	languageReducer: languageReducer,
	currencyReducer: currencyReducer,
	areaUnitReducer: areaUnitReducer,
	roleReducer: roleReducer,
	packageReducer: packageReducer,
	propertiesReducer: propertiesReducer,
	locationReducer: locationReducer,
	AddPropertyDetailsReducer: AddPropertyDetailsReducer,
	AddPriceReducer: AddPriceReducer,
	AddImageReducer: AddImageReducer,
	AddAmenitiesReducer: AddAmenitiesReducer,
	usersReducer: usersReducer,
	systemModulesReducer: systemModulesReducer,
	organizationReducer: organizationReducer,
});
