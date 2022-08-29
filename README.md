# TypeScript Package Repository
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

# Packages

```
@sonr/webauthn
@sonr/validation
```

### Project Structure
the following outlines how each project is layed out within the repository.
```
packages/
├── foo-pkg
│   └── package.json
├── bar-pkg
│   └── package.json
├── baz-pkg
│   └── package.json
└── qux-pkg
    └── package.json
```

## Installing Dependencies (from project root)
We are using [lerna](https://github.com/lerna/lerna) for monorepo management. see documentation for information regarding their docs.
```
- npm install (resolves root level packages)
- npm run bootstrap (resolves dependencies for projects within 'packages/').
- npm run tsc (transpiles typescript for each package)
- npm run bundle (bundles packages for publishing)
- npm publish (publishes all packages)
```

# Development 
Please see individual projects documentation on package specific content

# Field Validator
The field validator helper is located at [Validator](https://github.com/sonr-io/ts-modules/blob/master/packages/sonr-validation/src/validator.ts) 
and the validation rules are located at [Rules](https://github.com/sonr-io/ts-modules/blob/master/packages/sonr-validation/src/validation.ts)

## Usage
The validator helper works by checking if a collection of rules are fulfilled for a given field value, so  you need to declare which rules must be check for each field

Example of field validation for username and password:

```javascript
import { 
    validate, 
    ruleIsRequired, 
    hasAtLeastOneNumber
} from 'utils/fieldsValidation'

// Rules that must be checked for username field
const usernameRules = [
    {
        name: 'isRequired', 
        validate: ruleIsRequired // function that contains rule implementation
    }
]

// Rules that must be checked for password field
const passwordRules = [
    {
        name: 'isRequired', 
        validate: ruleIsRequired
    },
    {
        name: 'hasNumericCharacter',
        validate: hasAtLeastOneNumber
    },
    {
        name: 'hasMinimumCharacters',
        // Custom rule (rules must return a string when not fulfilled or false when fulfilled)
        validate: function (value: string){
            if(value.length < 12) return 'Password should have at least 12 characters.'
            return false
        }
    }
]

// Object that associates fields to rules
const fields = {
    username: {
        rules: usernameRules,
        value: usernameFieldValue, // value filled by user
    },
    password: {
        rules: passwordRules,
        value: passwordFieldValue, // value filled by user
    }
}

// Validate all fields
const { isValid, validationErrors } = validate({ fields })

// Considering the user input for username was "Bob" and the password "12345" isValid will be false because there is at least one rule not fulfilled (one error) and the validationErrors object will look like this:
{
    username: {
        isRequired: false // rule fulfilled (no error)
    },
    password: {
        isRequired: false,
        hasNumericCharacter: false,
        hasMinimumCharacters: 'Password should have at least 12 characters.'
    }
}
```