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
