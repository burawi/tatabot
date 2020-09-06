const tatabot = require("./index.js");

const schema = {
  "*name":  "string",
  id: "string",
  age: {type: "integer", min: 0, max: 100},
  wallet: "float",
  email: "email",
  acronym: "uppercase",
  address: {type: "lowercase", maxLength: 20},
  role: {type: "enum", values: ["admin", "normal"]},
  groups: {type: "array", minItems: 3, itemOptions: "integer"},
  parents: {type: "array", maxItems: 2 },
  image: "url",
  password: "password",
  meta: {type: "object", schema: {creditCard: {type: "string", minLength: 3}}},
  children: {type: "array", itemOptions: {
    type: "object",
    schema: {"*name": "string", age: "integer"}
  }}
}

tatabot.addType("password", {
  coerce: (value, options) => value.split("").map(() => "*").join(""),
  validate: (value) => value.length < 6 ? ["password too short"] : [],
})

test("Global test, should be valid", () => {
  // This test should test all types and give no errors
  const item = {
    name: "Burawi",
    id: 300,
    age: "26",
    wallet: "358.78",
    email: "teSt@cc.co",
    acronym: "ess",
    address: "Street Zinky",
    role: "admin",
    groups: ["1", "2", "3"],
    parents: ["daddy", "mommy" ],
    image: "https://google.com",
    password: "123456",
    meta: { creditCard: "5555" },
    children: [
      {name: "Baya", age: 1},
      {name: "Habib", age: 3},
    ],
  };
  const {isValid, coersion, errors} = tatabot.validate(item, schema);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual({
    name: "Burawi",
    id: "300",
    age: 26,
    wallet: 358.78,
    email: "test@cc.co",
    acronym: "ESS",
    address: "street zinky",
    role: "admin",
    groups: [1, 2, 3],
    parents: ["daddy", "mommy" ],
    image: "https://google.com",
    password: "******",
    meta: { creditCard: "5555" },
    children: [
      {name: "Baya", age: 1},
      {name: "Habib", age: 3},
    ],
  });
  // Testing Immutability
  expect(item).toEqual({
    name: "Burawi",
    id: 300,
    age: "26",
    wallet: "358.78",
    email: "teSt@cc.co",
    acronym: "ess",
    address: "Street Zinky",
    role: "admin",
    groups: ["1", "2", "3"],
    parents: ["daddy", "mommy" ],
    image: "https://google.com",
    password: "123456",
    meta: { creditCard: "5555" },
    children: [
      {name: "Baya", age: 1},
      {name: "Habib", age: 3},
    ],
  });
  expect(errors).toHaveLength(0);
});

test("Global test, should be invalid", () => {
  // This test should test all types and give errors for all types
  const item = {
    name: "Burawi",
    id: "300",
    age: -1,
    wallet: "d",
    email: "testcc.co",
    acronym: "ess",
    address: "Street Zinky, 7ay Zahra Sousse",
    role: "unsubed",
    groups: ["Group1", 2 ],
    parents: ["daddy", "mommy", "brother" ],
    image: "hgoogle.com",
    password: "12345",
    meta: { creditCard: "55" },
    children: [
      { age: 1},
      { age: 3},
    ],
  };
  const {isValid, errors} = tatabot.validate(item, schema);
  expect(isValid).toBeFalsy();
  expect(errors).toHaveLength(13);
});

test("Not Giving required data", () => {
  const item = {
    age: "26",
    wallet: "358.78",
    email: "test@cc.co",
    acronym: "ess",
    address: "Street Zinky",
    groups: ["1", "2", "3"],
    parents: ["daddy", "mommy" ]
  };
  const {isValid, errors} = tatabot.validate(item, schema);
  expect(isValid).toBeFalsy();
  expect(errors).toHaveLength(1);
});

test("Not Giving required data, but should be valid", () => {
  const item = {
    age: "26",
    wallet: "358.78",
    email: "test@cc.co",
    acronym: "ess",
    address: "Street Zinky",
    groups: ["1", "2", "3"],
    parents: ["daddy", "mommy" ]
  };
  const {isValid, errors} = tatabot.validate(item, schema, {noRequired: true});
  expect(isValid).toBeTruthy();
  expect(errors).toHaveLength(0);
});

test("Giving additional data, should be removed", () => {
  const item = { name: "Burawi", lastName: "Wady" };
  const {isValid, coersion, errors} = tatabot.validate(item, schema);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual({ name: "Burawi" });
  expect(errors).toHaveLength(0);
});

test("Giving additional data, should be kept", () => {
  const item = { name: "Burawi", lastName: "Wady" };
  const settings = {keepAdditional: true};
  const {isValid, coersion, errors} = tatabot.validate(item, schema, settings);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual(item);
  expect(errors).toHaveLength(0);
});
