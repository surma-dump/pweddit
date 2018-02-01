import {defaultPartCallback, AttributePart, render as baseRender} from '/lit-html.js';

export function propertyPartCallback(instance, templatePart, node) {
  if (templatePart.type === 'attribute' && templatePart.name.endsWith('$')) {
    const name = templatePart.name.slice(0, -1);
    return new PropertyPart(instance, node, name, templatePart.strings);
  }
  return defaultPartCallback(instance, templatePart, node);
}

export function render(result, container, partCallback = propertyPartCallback) {
  baseRender(result, container, partCallback);
}

export class PropertyPart extends AttributePart {
  setValue(values, startIndex) {
    const s = this.strings;
    this.element[this.name] = values[0];
  }
}
