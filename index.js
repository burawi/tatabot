const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const types = {};

const addType = (name, processors) => { types[name] = processors }

addType("additional", {
  coerce: (value, {settings}) => settings.keepAdditional ? value : undefined,
  validate: () => [],
})

addType("required", {
  coerce: value => value,
  validate: (value, {key}) => value ? [] : [`${key} is required`],
})

addType("string", {
  coerce: (value, options) => {
    return `${value}`;
  },
  validate: (value, {key, propOptions}) => {
    const {minLength, maxLength} = propOptions;
    const errors = [];
    if(minLength && value.length < minLength) 
      errors.push(`${key} should have at least ${minLength} chars`)
    if(maxLength && value.length > maxLength) 
      errors.push(`${key} should have at most ${maxLength} chars`)
    return errors;
  }
})

addType("uppercase", {
  coerce: (value, options) => {
    const stringCoerce = types.string.coerce(value, options);
    return `${stringCoerce}`.toUpperCase();
  },
  validate: (value, options) => types.string.validate(value, options),
})

addType("lowercase", {
  coerce: (value, options) => {
    const stringCoerce = types.string.coerce(value, options);
    return `${stringCoerce}`.toLowerCase();
  },
  validate: (value, options) => types.string.validate(value, options),
})

addType("integer", {
  coerce: (value, {propOptions}) => {
    const {blockFloat} = propOptions;
    const parsed = parseInt(value);
    // if floats are blocked and value is a strict int coerce value
    if(blockFloat && +value === parsed) return parsed;
    // if floats are blocked and value is not a strict int does not coerce
    if(blockFloat) return value;
    // if floats are bot blocked just coerce without check
    return parsed;
  },
  validate: (value, {key, propOptions, settings}) => {
    const {min, max, blockFloat} = propOptions;
    const errors = [];
    if(blockFloat && +value !== parseInt(value))
      return [`${key} should be a strict integer`]
    if(isNaN(value)) errors.push(`${key} not valid integer`)
    if(min !== undefined && value < min) 
      errors.push(`${key} should be greater than ${min}`)
    if(max !== undefined && value > max) 
      errors.push(`${key} should be less than ${max}`)
    return errors;
  }
})

addType("float", {
  coerce: value => parseFloat(value),
  validate: (value, {key, propOptions}) => {
    const {min, max} = propOptions;
    const errors = [];
    if(isNaN(value)) errors.push(`${key} not valid float`)
    if(min !== undefined && value.length < min) 
      errors.push(`${key} should be greater than ${min} items`)
    if(max !== undefined && value.length > max) 
      errors.push(`${key} should be less than ${max} items`)
    return errors;
  }
})

addType("email", {
  coerce: (value, options) => {
    return types.lowercase.coerce(value,options)
  },
  validate: (value, {key}) => {
    const errors = [];
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/;
    if(!re.test(value)) errors.push(`${key} not valid email`);
    return errors;
  }
})

addType("url", {
  coerce: (value, options) => {
    return types.lowercase.coerce(value,options)
  },
  validate: (value, {key}) => {
    const errors = [];
    const re = /^(ftp|http|https):\/\/[^ "]+$/;
    if(!re.test(value)) errors.push(`${key} not valid url`);
    return errors;
  }
})

addType("enum", {
  coerce: value => value,
  validate: (value, {key, propOptions}) => {
    const {values} = propOptions;
    const errors = [];
    if(!values.includes(value))
      errors.push(`This value of ${key} is not allowed`)
    return errors;
  }
})

addType("date", {
  coerce: (value, {propOptions}) => {
    const {format} = propOptions;
    const parsed = dayjs(value, format);
    if(parsed.isValid()) return parsed.toDate();
    return value;
  },
  validate: (value, {key, propOptions}) => {
    const {format, before, after} = propOptions;
    const errors = [];
    const parsed = dayjs(value);
    if(!parsed.isValid()) return [`${key} is not a valid date`];
    if(before && !parsed.isBefore(dayjs(before()))) 
      errors.push(`${key} should be before ${before()}`)
    if(after && !parsed.isAfter(dayjs(after()))) 
      errors.push(`${key} should be after ${after()}`)
    return errors;
  }
})

addType("object", {
  coerce: (value, {propOptions, settings}) => {
    const normedSchema = normalizeSchema(value, propOptions.schema, settings);
    return coerce({...value}, normedSchema, settings);
  },
  validate: (value, {propOptions, settings}) => {
    const normedSchema = normalizeSchema(value, propOptions.schema, settings);
    const errors = getErrors(value, normedSchema, settings);
    return errors;
  }
})

addType("array", {
  coerce: (value, {propOptions, settings}) => {
    if(!propOptions.itemOptions) return value;
    const itemSchema = {value: propOptions.itemOptions};
    const clone = [...value];
    const coerced = clone.map(item => {
      const itemValue = {value: item};
      const normedSchema = normalizeSchema(itemValue, itemSchema, settings);
      const coercedItem = coerce(itemValue, normedSchema, settings)
      return coercedItem.value;
    });
    return coerced;
  },
  validate: (value, {key, propOptions, settings}) => {
    const {minItems = 0, maxItems} = propOptions;
    const errors = [];
    if(!Array.isArray(value)) return [`${key} is not an array`];
    if(value.length < minItems) 
      errors.push(`${key} should have at least ${minItems}`)
    if(maxItems && value.length > maxItems) 
      errors.push(`${key} should have at most ${maxItems}`)
    if(!propOptions.itemOptions) return errors;
    const itemSchema = {value: propOptions.itemOptions};
    const itemsErrors = value.map(item => {
      const itemValue = {value: item};
      const normedSchema = normalizeSchema(itemValue, itemSchema, settings);
      return getErrors(itemValue, normedSchema, settings)
    }).flat();
    errors.push(...itemsErrors)
    return errors;
  }
})

const getCoercionReducer = (inputObj, schema, settings) => (restOfObj, key) => {
  const {type, ...options} = schema[key];
  const inputVal = inputObj[key];
  if(inputVal === undefined) return restOfObj; 
  const processOptions = {propOptions: options, key, settings}
  const coerce = type => types[type].coerce(inputVal, processOptions)
  const coercedVal = type.reduce((lastCoerce, type) => coerce(type), inputVal)
  return {...restOfObj, ...(coercedVal === undefined ? {} : {[key]: coercedVal}) }
}

const getValidationMap = (inputObj, schema, settings) => (key) => {
  const {type, ...options} = schema[key];
  const inputVal = inputObj[key];
  if(inputVal === undefined && !type.includes("required")) return [];
  const processOptions = {propOptions: options, key, settings}
  const validate = type => types[type].validate(inputVal, processOptions)
  const reducer = (errors, type) => ([...errors, ...validate(type)]);
  const errors = type.reduce(reducer, [])
  return errors;
}

const normalizeProp = (schema, rawKey, settings) => {
  const isSmartRequired = rawKey.startsWith("*");
  const key = isSmartRequired ? rawKey.replace("*", "") : rawKey;
  const pretype = isSmartRequired && !settings.noRequired ? ["required"] : [];
  const options = schema[rawKey] || "additional";
  const isStringy = typeof options === "string"; 
  const isArray = Array.isArray(options);
  const normed = isStringy || isArray ? {type: options} : {...options};
  if(typeof normed.type === "string") normed.type = [normed.type];
  normed.type = [...normed.type, ...pretype]
  return {[key]: normed};
}

const normalizeSchema = (item, schema, settings) => {
  const itemKeys = Object.keys(item);
  const schemaKeys = Object.keys(schema)
  const keys = [...itemKeys, ...schemaKeys].filter((v,i,a) => a.indexOf(v) === i);
  const normalized = keys.reduce((otherProps, key) => ({
    ...otherProps,
    ...normalizeProp(schema, key, settings),
  }), {})
  return normalized;
}

const coerce = (item, schema, settings) => {
  const coercionReducer = getCoercionReducer(item, schema, settings);
  const coersion = Object.keys(schema).reduce(coercionReducer, {});
  return coersion;
}

const getErrors = (item, schema, settings) => {
  const validationMap = getValidationMap(item, schema, settings);
  const errors = Object.keys(schema).map(validationMap).flat();
  return errors;
}

const validate = (item, schema, settings = {}) => {
  
  const normalizedSchema = normalizeSchema(item, schema, settings)

  const coersion = coerce(item, normalizedSchema, settings)
  const errors = getErrors(coersion, normalizedSchema, settings);
  const isValid = errors.length === 0;

  return {isValid, coersion, errors}
}

module.exports = {validate, addType};
