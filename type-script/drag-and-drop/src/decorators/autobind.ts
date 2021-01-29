namespace App {
  //autobind decorator
  export function autobind(_: any, _2: string | Symbol, descriptor: PropertyDescriptor) {
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

}