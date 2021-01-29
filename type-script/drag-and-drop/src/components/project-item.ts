/// <reference path="base-component.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../decorators/autobind.ts" />

namespace App {
  
  export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get team(): string {
      if (this.project.people > 1) return `Team: ${this.project.people} persons assigned`
      else return `Team: ${this.project.people} person assigned`
    }


    constructor(hostElementId: string, project: Project) {
      super('single-project', hostElementId, 'beforeend', project.id);
      this.project = project;

      this.configure();
      this.renderContent();
    }

    @autobind
    dragStartHandler(event: DragEvent) {
      event.dataTransfer!.setData('text/plain', this.project.id);
      event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent) { }

    configure() {
      this.element.addEventListener('dragstart', this.dragStartHandler)
      this.element.addEventListener('dragend', this.dragEndHandler)
    }

    renderContent() {
      const titleEl = this.element.querySelector('h2') as HTMLHeadingElement;
      const teamEl = this.element.querySelector('h3') as HTMLHeadingElement;
      const descriptionEL = this.element.querySelector('p') as HTMLParagraphElement;

      titleEl.textContent = this.project.title;
      teamEl.textContent = this.team;
      descriptionEL.textContent = this.project.description;
    }
  }
}