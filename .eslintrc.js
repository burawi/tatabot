module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  ,
  rules: {
    indent: [ "error", 2 ],
    "linebreak-style": [ "error", "unix" ],
    quotes: [ "error", "double" ],
    semi: [ "error", "always" ],
    "no-template-curly-in-string": "warn",
    "no-unreachable": "warn",
    "no-console": "off",

    "block-scoped-var": "error",
    "dot-location": [ "error", "property" ],
    "max-classes-per-file": [ "error", 1 ],
    "no-alert": "error",
    "no-unused-vars": ["error", { "ignoreRestSiblings": true }],
    "no-else-return": [ "error", { allowElseIf: false } ],
    "no-empty-function": "error",
    "no-eq-null": "error",
    "no-eval": "error",
    "no-loop-func": "error",
    "no-magic-numbers": "off",
    "no-multi-spaces": "error",
    "no-multi-str": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-octal": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-unmodified-loop-condition": "error",
    "no-label-var": "error",
    "no-use-before-define": "error",
    "no-return-assign": [ "error", "always" ],
    yoda: [ "warn", "never" ],
    "no-shadow": [ "error", { builtinGlobals: false, hoist: "functions", allow: [] } ],

    "array-bracket-newline": [ "error", "consistent" ],
    "array-bracket-spacing": [ "error", "always" ],
    "array-element-newline": [ "error", "consistent" ],
    "block-spacing": "error",
    "brace-style": "error",
    camelcase: [ "error", { properties: "never", allow: [ "^\\$*[A-Z]+_" ] } ],
    "comma-dangle": [ "error", "always-multiline" ],
    "comma-spacing": [ "error", { before: false, after: true } ],
    "comma-style": [ "error", "last" ],
    "consistent-this": [ "error", "hadha" ],
    "eol-last": [ "error", "always" ],
    "func-call-spacing": [ "error", "never" ],
    "func-name-matching": "error",
    "func-names": [ "warn", "always" ],
    "function-paren-newline": [ "error", "consistent" ],
    "key-spacing": "error",
    "keyword-spacing": "error",
    "linebreak-style": "error",
    "lines-between-class-members": [ "error", "always" ],
    "max-depth": [ "error", 3 ],
    "max-len": [ "error", { code: 80 } ],
    "max-lines": [ "error", 250 ],
    "max-lines-per-function": [ "error", { max: 30, skipBlankLines: true, skipComments: true } ],
    "max-nested-callbacks": [ "error", 2 ],
    "max-params": [ "error", 3 ],
    "multiline-ternary": [ "error", "never" ],
    "no-bitwise": "error",
    "no-lonely-if": "error",
    "no-mixed-operators": "error",
    "no-multi-assign": "error",
    "no-multiple-empty-lines": "error",
    "no-negated-condition": "error",
    "no-nested-ternary": "error",
    "no-new-object": "error",
    "no-trailing-spaces": "error",
    "no-unneeded-ternary": "error",
    "prefer-object-spread": "error",
    "no-whitespace-before-property": "error",
    "object-curly-newline": [ "error", { consistent: true } ],
    "object-curly-spacing": [ "error", "always" ],
    "one-var": [ "error", "never" ],
    "operator-assignment": [ "error", "always" ],
    "operator-linebreak": [ "error", "before" ],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: [ "import", "cjs-import" ], next: [ "class", "export", "cjs-export" ] },
      { blankLine: "always", prev: [ "class" ], next: [ "export", "cjs-export" ] },
    ],
    "quote-props": [ "error", "as-needed" ],
    "semi-spacing": "error",
    "semi-style": [ "error", "last" ],
    "space-infix-ops": "error",
    "spaced-comment": [ "error", "always" ],
    "switch-colon-spacing": [ "error", { after: true, before: false } ],
    "space-unary-ops": "error",
    "wrap-regex": "error",
    "arrow-body-style": [ "error", "as-needed" ],
    "arrow-parens": [ "error", "as-needed" ],
    "arrow-spacing": "error",
    "no-duplicate-imports": "error",
    "no-useless-constructor": "error",
    "no-useless-rename": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "error",
    "template-curly-spacing": "error",
    "prefer-destructuring": [ "warn", {
      array: true,
      object: true,
    }, {
      enforceForRenamedProperties: false,
    } ],
    "rest-spread-spacing": [ "error", "never" ],
    "require-atomic-updates": "off",
  },
};
