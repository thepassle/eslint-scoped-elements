/**
 * @fileoverview Don't use custom elements in html tagged template literals that are not defined in static scopedElements
 * @author pascal schilp
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/scoped-elements.js"),

  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 13,
  },
});
ruleTester.run("scoped-elements", rule, {
  //------------------------------------------------------------------------------
  // ✅ VALID
  //------------------------------------------------------------------------------
  valid: [
    /** ✅ Static getter */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'my-el': MyEl
    }
  }

  render() { return html\`<my-el></my-el>\`}
}
` },
    /** ✅ Static getter, reversed order */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  render() { return html\`<my-el></my-el>\`}

  static get scopedElements() {
    return {
      'my-el': MyEl
    }
  }
}
` },

    /** ✅ Static class field */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  static scopedElements = { 'my-el': MyEl }
  render() { return html\`<my-el></my-el>\`}
}
` },
    /** ✅ Static class field, reversed order */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  render() { return html\`<my-el></my-el>\`}
  static scopedElements = { 'my-el': MyEl }
}
` },

    /** ✅ Lazy loaded */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  firstUpdated() {
    import('foo').then(m => this.defineScopedElement('my-el', m.MyEl));
  }

  render() { return html\`<my-el></my-el>\`}
}
` },
    /** ✅ Lazy loaded, reversed order */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  firstUpdated() {
    import('foo').then(m => this.defineScopedElement('my-el', m.MyEl));
  }

  render() { return html\`<my-el></my-el>\`}
}
` },

    //------------------------------------------------------------------------------
    // EDGECASES
    //------------------------------------------------------------------------------
    /** ✅ ...super.scopedElements, edgecase: ignore for now, improve in the future */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  static scopedElements = { ...super.scopedElements }
  render() { return html\`<my-el></my-el>\`}
}
` },
    /** ✅ ...super.scopedElements, edgecase: ignore for now, improve in the future */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  static get scopedElements() { 
    return { ...super.scopedElements }
  }
  render() { return html\`<my-el></my-el>\`}
}
` },
    /** ✅ Dynamically defined, edgecase: ignore for now, improve in the future */
    {
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  firstUpdated() {
    this.defineScopedElement(foo, MyEl);
  }

  render() { return html\`<my-el></my-el>\`}
}
` },
  ],

  //------------------------------------------------------------------------------
  // ❌ INVALID
  //------------------------------------------------------------------------------
  invalid: [
    {
      /** ❌ Not declared */
      code: `
class MyElement extends ScopedElementsMixin(LitElement) {
  render() { return html\`<my-el></my-el>\`}
}
      `,
      errors: [{ message: 'todo' }]
    }
  ]
});
