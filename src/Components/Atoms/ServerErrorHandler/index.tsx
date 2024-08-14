export const HandleServerErrors = (
	serverErrors: any,
	errorFields: Array<any>,
	...childrens: any
) => {
	let errors = errorFields;
	serverErrors?.forEach(function (value: any) {
		if (value.constraints) {
			let errorsDt = Object.entries(value.constraints).map((ele: any, index: number) => {
				return <li key={"__err" + index}>{ele[1]}</li>;
			});
			let propertyName = value.property;
			if (childrens && childrens.length > 0) {
				propertyName = [...childrens, value.property];
			}
			errors.push({
				name: propertyName,
				errors: [<ul className="form-error-data ">{errorsDt}</ul>],
			});
		}

		if (value.children) {
			let newProp = value.property;
			if (!isNaN(newProp)) {
				newProp = parseInt(newProp);
			}
			return HandleServerErrors(value.children, errors, ...childrens, newProp);
		} else {
			return errors;
		}
	});
	return errors;
};
