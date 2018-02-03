export function statefulElement(clazz) {
  return class StatefulElement extends clazz {
    // static outerLightDom(state) {
    //   return html`
    //     <${compileTime(clazz.tag)}>
    //       ${clazz.lightDom(state)}
    //     </${compileTime(clazz.tag)}>
    //   `;
    // }
  }
}
