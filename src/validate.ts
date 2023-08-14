export type ValidationData = {
	inputs: {[key: string]: SingleValidationData};
	capitalise?: boolean;
};
type SingleValidationData = {
	required?: boolean;
} & (NumberValidationData | StringValidationData);
interface NumberValidationData {
	type: 'number';
	min?: number;
	max?: number;
}
interface StringValidationData {
	type: 'string';
	minLength?: number;
	maxLength?: number;
	patterns?: StringValidationPattern[];
}
interface StringValidationPattern {
	pattern: RegExp;
	message: string;
}

export default function validate(validationData: ValidationData, body: {[key: string]: string | number | undefined}): {[key: string]: string} {
	const errorMessages: {[key: string]: string} = {};

	Object.keys(body).forEach((inputName) => {
		const inputValidationData = validationData.inputs[inputName];
		const inputValue = body[inputName];

		const inputDisplayName = validationData.capitalise ? inputName[0].toUpperCase() + inputName.slice(1) : inputName;

		if (inputValidationData.type === 'number') {
			if (inputValidationData.required && inputValue === undefined) {
				errorMessages[inputName] = `${inputDisplayName} is required`;
			} else if (typeof inputValue !== 'number') {
				errorMessages[inputName] = `${inputDisplayName} must be a number`;
			} else {
				if (inputValidationData.min !== undefined && inputValue < inputValidationData.min) {
					errorMessages[inputName] = `${inputDisplayName} must be at least ${inputValidationData.min}`;
				} else if (inputValidationData.max !== undefined && inputValue > inputValidationData.max) {
					errorMessages[inputName] = `${inputDisplayName} must be at most ${inputValidationData.max}`;
				}
			}
		} else if (inputValidationData.type === 'string') {
			if (inputValidationData.required && !inputValue) {
				errorMessages[inputName] = `${inputDisplayName} is required`;
			} else if (typeof inputValue !== 'string') {
				errorMessages[inputName] = `${inputDisplayName} must be a string`;
			} else {
				if (inputValidationData.minLength !== undefined && inputValue.length < inputValidationData.minLength) {
					errorMessages[inputName] = `${inputDisplayName} must be at least ${inputValidationData.minLength} characters long`;
				} else if (inputValidationData.maxLength !== undefined && inputValue.length > inputValidationData.maxLength) {
					errorMessages[inputName] = `${inputDisplayName} must be at most ${inputValidationData.maxLength} characters long`;
				} else if (inputValidationData.patterns !== undefined) {
					for (const pattern of inputValidationData.patterns) {
						if (!pattern.pattern.test(inputValue)) {
							errorMessages[inputName] = `${inputDisplayName} ${pattern.message}`;
							break;
						}
					}
				}
			}
		}
	});

	return errorMessages;
}
