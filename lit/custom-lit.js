import {TemplateResult, defaultPartCallback, AttributePart} from '/lit/lit-html.js';
export * from '/lit/lit-html.js';
export * from '/lit/lib/repeat.js';

const ctMarker = Symbol('compiletime');
export function compileTime(value) {
  return {
    value,
    [ctMarker]: true
  };
}

export function isCompileTime(value) {
  return !!value[ctMarker];
}

export function getCompileTimeValue(value) {
  return value.value;
}

export function html(strings, ...values) {
  strings = strings.slice();
  while (values.some(isCompileTime)) {
    const i = values.findIndex(isCompileTime);
    strings[i] = `${strings[i]}${getCompileTimeValue(values[i])}${strings[i+1]}`;
    strings.splice(i+1, 1);
    values.splice(i, 1);
  }
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
