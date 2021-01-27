enum ProjectStatus { Active, Finished }

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

//Project State Management
class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) { return this.instance }
    this.instance = new ProjectState();
    return this.instance;
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

// Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    position: InsertPosition,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId) as T;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementId) this.element.id = newElementId;

    this.attach(position);
  }

  private attach(position: InsertPosition) {
    this.hostElement.insertAdjacentElement(position, this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>{
  private project: Project;

  get team(): string {
    if (this.project.people > 1) return `Team: ${this.project.people} persons assigned`
    else return `Team: ${this.project.people} person assigned`
  }


  constructor(hostElementId: string, project: Project) {
    super('single-project', hostElementId, 'beforeend', project.id);
    this.project = project;

    this.renderContent();
  }

  configure() { }
  renderContent() {
    const titleEl = this.element.querySelector('h2') as HTMLHeadingElement;
    const teamEl = this.element.querySelector('h3') as HTMLHeadingElement;
    const descriptionEL = this.element.querySelector('p') as HTMLParagraphElement;

    titleEl.textContent = this.project.title;
    teamEl.textContent = this.team;
    descriptionEL.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement>{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', 'beforeend', `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(project => {
        if (this.type == 'active') return project.status == ProjectStatus.Active
        else return project.status == ProjectStatus.Finished
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
    listEl.innerHTML = '';
    for (const project of this.assignedProjects) {
      new ProjectItem(`${this.type}-projects-list`, project);
    }
  }

  renderContent() {
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
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', 'afterbegin', 'user-input');

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
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

  renderContent() { }

  configure() {
    this.element.addEventListener('submit', this.submitHandler)
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

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
}

const projectInput = new ProjectInput();
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');
