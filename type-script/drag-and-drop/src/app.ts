enum ProjectStatus { Active, Finished }

type Listener = (items: Project[]) => void;


//Project State Management
class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() { }

  static getInstance() {
    if (this.instance) { return this.instance }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      (Math.random() * 10000).toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

//Global instanse of the State
const projectState = ProjectState.getInstance();


class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) { }
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list') as HTMLTemplateElement;
    this.hostElement = document.getElementById('app') as HTMLDivElement;
    this.assignedProjects = [];

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(project => {
        if (this.type == 'active') return project.status == ProjectStatus.Active
        else return project.status == ProjectStatus.Finished
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
    listEl.innerHTML = '';
    for (const project of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = project.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }
}


//autobind decorator
function autobind(_: any, _2: string | Symbol, descriptor: PropertyDescriptor) {
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

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  @autobind
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
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');
