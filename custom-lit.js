import {TemplateResult, defaultPartCallback, AttributePart} from '/lit-html.js';
export * from '/lit-html.js';

export function html(strings, ...values) {
  return new TemplateResult(strings, values, 'html', propertyPartCallback);
}

export function propertyPartCallback(instance, templatePart, node) {
  if (templatePart && templatePart.type === 'attribute' && templatePart.name.endsWith('$')) {
    const name = templatePart.name.slice(0, -1);
    return new PropertyPart(instance, node, name, templatePart.strings);
  }
  return defaultPartCallback(instance, templatePart, node);
}

export class PropertyPart extends AttributePart {
  setValue(values, startIndex) {
    const s = this.strings;
    this.element[this.name] = values[0];
  }
}
