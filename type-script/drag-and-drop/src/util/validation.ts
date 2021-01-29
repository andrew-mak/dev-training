namespace App {
  //Validation
  export interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  export function checkValidation(inputObj: Validatable) {
    let isValid = true;
    if (inputObj.required) {
      isValid = isValid && inputObj.value.toString().trim().length !== 0;
    }
    if (inputObj.minLength != null && typeof inputObj.value === 'string') {
      isValid = isValid && inputObj.value.length >= inputObj.minLength;
    }
    if (inputObj.maxLength != null && typeof inputObj.value === 'string') {
      isValid = isValid && inputObj.value.length <= inputObj.maxLength;
    }
    if (inputObj.min != null && typeof inputObj.value === 'number') {
      isValid = isValid && inputObj.value >= inputObj.min;
    }
    if (inputObj.max != null && typeof inputObj.value === 'number') {
      isValid = isValid && inputObj.value <= inputObj.max;
    }
    return isValid
  }

}