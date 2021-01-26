//autobind decorator
function Autobind(_: any, _2: string | Symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const upgradedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunc = originalMethod.bind(this);
      return boundFunc;
    }
  };
  return upgradedDescriptor;
}

//Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function checkValidation(inputObj: Validatable) {
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

//ProjectInput class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  startForm: HTMLFormElement;

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input') as HTMLTemplateElement;
    this.hostElement = document.getElementById('app') as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.startForm = importedNode.firstElementChild as HTMLFormElement;
    this.startForm.id = 'user-input';

    this.titleInputElement = this.startForm.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.startForm.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.startForm.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    }
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    }
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 2,
      max: 8
    }
    if (
      checkValidation(titleValidatable) &&
      checkValidation(descriptionValidatable) &&
      checkValidation(peopleValidatable)
    ) {
      return [enteredTitle, enteredDescription, +enteredPeople]
    }
    else {
      alert('Invalid input, please try again!');
      return
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      console.log(userInput)
      this.clearInputs();
    }
  }

  @Autobind
  private configure() {
    this.startForm.addEventListener('submit', this.submitHandler)
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.startForm);
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
}

const projectInput = new ProjectInput();
