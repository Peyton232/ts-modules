# TypeScript Package Repository

# Packages

```
@sonr/webauthn
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
-  npm bootstrap (resolves dependencies for projects within 'packages/').
- npm publish (publishes all packages)

```

# Development 
Please see individual projects documentation on package specific content

