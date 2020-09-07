const tatabot = require("./index.js");
const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

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

test("Giving float instead of int, should return error", () => {
  const item = { age: "1.3" };
  const strict = { ...schema, age: { type: "integer", blockFloat: true }}
  const settings = { noRequired: true };
  const {isValid, coersion, errors} = tatabot.validate(item, strict, settings);
  expect(isValid).toBeFalsy();
  expect(errors).toHaveLength(1);
});

test("Giving float instead of int, should be valid", () => {
  const item = { age: "1.3" };
  const strict = { ...schema, age: { type: "integer" }}
  const settings = { noRequired: true };
  const {isValid, coersion, errors} = tatabot.validate(item, strict, settings);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual({ age: 1 });
  expect(errors).toHaveLength(0);
});

test("Giving date without format, should be valid", () => {
  const item = { createdAt: new Date() };
  const schema = { createdAt: "date" };
  const {isValid, coersion, errors} = tatabot.validate(item, schema);
  expect(errors).toHaveLength(0);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual({ createdAt: item.createdAt });
});

test("Giving date with format, should be valid", () => {
  const item = { createdAt: "20-06-2018" }
  const dateSchema = { createdAt: {type: "date", format: "DD-MM-YYYY"}};
  const {isValid, coersion, errors} = tatabot.validate(item, dateSchema);
  expect(errors).toHaveLength(0);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual({
    createdAt: dayjs("20-06-2018", "DD-MM-YYYY").toDate()
  });
});

test("Giving date with before, should be valid", () => {
  const item = { createdAt: "20-06-2018" }
  const dateSchema = { createdAt: {
    type: "date",
    format: "DD-MM-YYYY",
    before: () => dayjs("20-20-2020", "DD-MM-YYYY")
  }};
  const {isValid, coersion, errors} = tatabot.validate(item, dateSchema);
  expect(errors).toHaveLength(0);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual({
    createdAt: dayjs("20-06-2018", "DD-MM-YYYY").toDate()
  });
});

test("Giving date with before, should fail", () => {
  const item = { createdAt: "20-06-2018" }
  const dateSchema = { createdAt: {
    type: "date",
    format: "DD-MM-YYYY",
    before: () => dayjs("20-05-2018", "DD-MM-YYYY")
  }};
  const {isValid, coersion, errors} = tatabot.validate(item, dateSchema);
  expect(errors).toHaveLength(1);
  expect(isValid).toBeFalsy();
  expect(coersion).toEqual({
    createdAt: dayjs("20-06-2018", "DD-MM-YYYY").toDate()
  });
});

test("Giving date with after, should be valid", () => {
  const item = { createdAt: "20-06-2018" }
  const dateSchema = { createdAt: {
    type: "date",
    format: "DD-MM-YYYY",
    after: () => dayjs("20-05-2018", "DD-MM-YYYY")
  }};
  const {isValid, coersion, errors} = tatabot.validate(item, dateSchema);
  expect(errors).toHaveLength(0);
  expect(isValid).toBeTruthy();
  expect(coersion).toEqual({
    createdAt: dayjs("20-06-2018", "DD-MM-YYYY").toDate()
  });
});

test("Giving date with after, should fail", () => {
  const item = { createdAt: "20-06-2018" }
  const dateSchema = { createdAt: {
    type: "date",
    format: "DD-MM-YYYY",
    after: () => dayjs("20-20-2020", "DD-MM-YYYY")
  }};
  const {isValid, coersion, errors} = tatabot.validate(item, dateSchema);
  expect(errors).toHaveLength(1);
  expect(isValid).toBeFalsy();
  expect(coersion).toEqual({
    createdAt: dayjs("20-06-2018", "DD-MM-YYYY").toDate()
  });
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
