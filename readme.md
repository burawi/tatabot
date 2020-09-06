# Tatabot
Tatabot, (from Arabic `تثبت` which means `Validation` or `Checking` ),
is a `JSON` schema validator written with ***Immutability*** and ***Modularity***
in mind. And which **does not follow `json-schema.org` standard rules**, because 
we believe that schema syntax can be much simpler than that standard. And that's what we
made in `Tatabot`.
## Example
```javascript
const tatabot = require("tatabot");

const schema = {
  "*name": "string",
  email: "email",
  age: { type: "integer", min: 13 },
  role: { type: "enum", values: ["admin", "follower"] }
}

const user1 = { name: "Bot", email: "tatabot@mm.co", age: "31", role: "admin" };
const user2 = { email: "tatabot", age: 10, role: "guest" }

const validation1 = tatabot.validate(user1, schema);
// validation1: { 
//   isValid: true,
//   errors: [],
//   coersion: { name: "Bot", email: "tatabot@mm.co", age: 31, role: "admin" }
// }

const validation2 = tatabot.validate(user2, schema);
// validation2: { 
//   isValid: false,
//   errors: [ "name is required", "email is not valid email", "age should be greater than 13" ],
//   coersion: { email: "tatabot", age: 10 }
// }
```
## Immutability
As you can see, `Tatabot` never changes the original object you passed to validation.
Instead it returns a coerced object.

This, makes your code much more predictable, thus less buggy.

## Modularity
The modularity of `Tatabot` makes customization possible, so you can add your own custom
types and their validation.

## Installation
```
npm i --save tatabot
```
## Core Concept
The main function of `Tatabot` is `validate`. It takes 3 arguments and returns 3 values.

It takes the object to be validated, the schema, and some additional validation options.
And it returns a `boolean` that set to `true` if the object is valid, a flat array containing all validation errors and an object with coerced values.

See [the example above](#example)

In addition to object and schema `validate` function takes a third argument, containing
validation settings:
* keepAdditional: true|false, if set to `true`, additional properties in object that are 
    not mentioned in schema, will not be removed.
* noRequired: true|false, if set to `true`, `required` type will not be handled, this is
    useful when you are validating an object intended for update purpose and which does not
    need to include all properties.

## Setting types
Each property must have at least one type, this type (or those types), can be set in
different ways. 
* Direct string
    The shortest form is this one. Just put the type as string value. Eg:
    ```javascript
    {
      age: "integer"
    }
    ```
* Direct array
    Thanks to its modularity, `Tatabot` allows property to have multiple types.
    In order to set multiple types you must put those types in array. The most common case
    is `required` type. (Yes required is considered as a type in `Tatabot`).
    ```javascript
    {
      age: ["required", "integer"]
    }
    ```
* type property
    The ways of doing shown above are very convenient when you just want to set types, but
    in many cases, you'll find yourself wanting to set some other options to the prop.
    In those cases, you have to set types in the long format, using `type` property. Eg:
    ```javascript
    {
      age: { type: "integer", min: 10 }
    }
    ```
    And of course, you can also set multiple types in array. Eg:
    ```javascript
    {
      age: { type: ["required","integer"], min: 10 }
    }
    ```
## Setting required
As we saw earlier, `required` is a type. So if you want a property to be required, just
give it the `required` type. Eg:
```javascript
{
  name: ["required","string"] 
}
```
### InKey required
As an alternative, you can add `*` in the begining of the property name, to set it
as required. Eg:
```javascript
{
  "*name": "string" 
}
```
## Types
This is the list of predefined types in `Tatabot` and their options.
### `string`
**options:**
* minLength: mininmum length of string
* maxLength: maximum length of string

Eg:
```javascript
{
  name: {type: "string", minLength: 3, maxLength: 6}
}
```
### `uppercase`
This takes the exact same options as `string` type. The only difference is that this type
coerces the value to upper case.
### `lowercase`
Same `uppercase` for lower case.
### `email`
Checks if value is a valid email.
### `url`
Checks if value is a valid url.
### `integer`
Checks if `parseInt` of value is not NaN.
**options:**
* min: mininmum value
* max: maximum value
Note: float will coerce to integers and not throw error.
### `float`
Checks if `parseFloat` of value is not NaN.
**options:**
* min: mininmum value
* max: maximum value
### `enum`
Checks if value is listed among `values` option.
**options:**
* values: list of allowed values

Eg:
```javascript
{
  role: {type: "enum", values: ["admin", "follower"]}
}
```
### `object`
Handles the value as plain object, according to its `schema` option.
**options:**
* schema: schema of object

Eg:
```javascript
{
  pet: {type: "object", schema: {
    name: "string",
    species: {type: "enum", values: ["dog", "cat"]}
  }}
}
```
### `array`
Checks the validity of the array
**options:**
* minItems: minimum length of array
* maxItems: maximum length of array
* itemOptions: schema of item

Eg:
```javascript
{
  children: {type: "array", maxItems: 10, itemOptions: "string"}
}
// Here, you'll have an array of strings that accepts 10 items as maximum
```

Or:
```javascript
{
  children: {type: "array", maxItems: 10, itemOptions: {
    type: "object",
    schema: {name: "string", age: "integer"}
  }}
}
// Here, you'll have an array of objects that accepts 10 items as maximum
```
## Custom Types
As we said, the modularity of `Tatabot` allows you to set your own custom types.
Use `addType` function to add a custom type this takes 2 arguments, the *type name* and
the *processors*.

Processors is an object that should contain 2 functions, `coerce` and `validate`.

`coerce` returns the coerced value.

`validate` returns an array of errors. This array should be empty if the value is valid.

These two processors take the same 2 arguments:
* value: the value to be processed
* options: an object containing the following properties:
    * key: the property name that is being processed
    * propOptions: the property options in the schema (`minLength`, `max`...) 
    * settings: the settings passed to `validate` function

Let's say you want to add `password` type, that accepts only strings longer than 6 and 
coerces all chars to `*` (miming crypting).

You'll write that code:
```javascript
tatabot.addType("password", {
  coerce: (value, options) => value.split("").map(() => "*").join(""),
  validate: (value) => value.length < 6 ? ["password too short"] : [],
})
```
