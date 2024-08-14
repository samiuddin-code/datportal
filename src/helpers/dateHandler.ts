export let months = [
	["Jan", "January"],
	["Feb", "February"],
	["Mar", "March"],
	["Apr", "April"],
	["May", "May"],
	["Jun", "June"],
	["Jul", "July"],
	["Aug", "August"],
	["Sep", "September"],
	["Oct", "October"],
	["Nov", "November"],
	["Dec", "December"],
];

export const weekDays = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
]

export function convertDate(
	dt: string | number | Date,
	format:
		| "dd/mm/yy"
		| "dd-mm-yy"
		| "dd mm yy"
		| "dd M yy"
		| "dd M,yy"
		| "dd MM,yy"
		| "dd MM yy"
		| "M dd,yy"
		| "MM dd,yy"
		| "M dd yy"
		| "MM dd yy"
		| "dd M,yy-t"
		| "yy-mm-dd"
) {
	if (dt) {
		var date = new Date(dt);
		let day = date.getDate();
		let dayWith0 = day > 9 ? day : "0" + String(day);
		let month = date.getMonth();
		let monthWith0 = month + 1 > 9 ? month + 1 : "0" + String(month + 1);
		let year = date.getFullYear();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let min = minutes > 9 ? minutes : "0" + String(minutes);
		let monthNameShort = months[month][0];
		let monthNameLong = months[month][1];
		switch (format) {
			case "dd/mm/yy":
				return `${dayWith0}/${monthWith0}/${year}`;
			case "dd-mm-yy":
				return `${dayWith0}-${monthWith0}-${year}`;
			case "yy-mm-dd":
				return `${year}-${monthWith0}-${dayWith0}`;
			case "dd mm yy":
				return `${dayWith0} ${monthWith0} ${year}`;
			case "dd M yy":
				return `${dayWith0} ${monthNameShort} ${year}`;
			case "dd M,yy":
				return `${dayWith0} ${monthNameShort}, ${year}`;
			case "dd MM,yy":
				return `${dayWith0} ${monthNameLong}, ${year}`;
			case "dd MM yy":
				return `${dayWith0} ${monthNameLong} ${year}`;
			case "M dd,yy":
				return ` ${monthNameShort} ${dayWith0}, ${year}`;
			case "MM dd,yy":
				return `${monthNameLong} ${dayWith0}, ${year}`;
			case "M dd yy":
				return ` ${monthNameShort} ${dayWith0} ${year}`;
			case "MM dd yy":
				return `${monthNameLong} ${dayWith0} ${year}`;
			case "dd M,yy-t":
				return `${dayWith0} ${monthNameShort}, ${year} - ${hours > 12 ? `${hours - 12}:${min} pm` : `${hours}:${min} am`
					}`;
			default:
				break;
		}
	}
}

export function getDifferenceInDays(startDate: Date | string, endDate: Date | string): number {
	const startDateObj = new Date(startDate);
	const endDateObj = new Date(endDate);
	const timeDifference = endDateObj.getTime() - startDateObj.getTime();
	const differenceInDays = timeDifference / (24 * 60 * 60 * 1000);
	return Math.round(differenceInDays);
  }
