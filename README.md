# htmlrl (HTML Render Language)

htmlrl is a minimal, strict HTML template rendering engine for Node.js.
It focuses on **predictable output**, **automatic escaping**, and a
**clear separation between logic and presentation**.

Unlike template engines such as EJS or Pug, htmlrl does not embed JavaScript
inside templates. Instead, it introduces a small, explicit render language
designed to grow incrementally.

> ⚠️ **Project status:** Early-stage MVP.  
> The API and language are intentionally minimal and will expand over time.

---

## Features (MVP)

- Simple variable replacement using `@var`
- Automatic HTML escaping by default
- Immutable render data
- Fail-fast error handling
- Deterministic rendering
- Cache to avoid recompilation at every request
- Full TypeScript support

---

## Installation (via npm)

```bash
npm install htmlrl
```

To the [npm site](https://www.npmjs.com/package/htmlrl) of htmlrl.

---

## Example

### Template (views/index.html)

```html
<h1>@title</h1>
<p>Hello, @name!</p>
```

All html templates must be stored inside or in subdirectories of a central root directory which has to be specified in order to create a library instance.

### TypeScript

```ts
// import library class
import Htmlrl from "htmlrl";

// create library instance
const htmlrl = new Htmlrl({
   // options
   rootDir: pathToViews // absolute path to the root directory which contains the templates
});

// render index.html
const generatedHtml = await htmlrl.renderAsync("index.html", {
    title: "Welcome to my page!",
    name: "John"
});
```

To use the library, you first have to create an instance and pass the mandatory options like `rootDir`.
To render files use the asynchronous function `renderAsync` and pass the filename as a first, and the variables as a second argument.

## Output

The above example evaluates to the following html string:

```html
<h1>Welcome to my page!</h1>
<p>Hello, John!</p>
```

All variables are HTML-escaped automatically.

## Precompilation

`renderAsync` automatically compiles your files at the first call and stores them in a cache for later usage and to avoid costly recompilation.
If you want deterministic performance, especially with larger template files, it is recommended to use `compileAsync` to precompile the
needed templates bevor they are actually used.

Example:

Write this in a suiting place in your source code. It should happen during the initialization phase of your app to avoid overhead later on.

```ts
await htmlrl.compileAsync("index.html");
```

And then again:

```ts
// uses the precompiled cache data
const generatedHtml = await htmlrl.renderAsync("index.html", {
    title: "Welcome to my page!",
    name: "John"
});
```

But this time there is no compiler overhead as it was already compiled bevor.

---

## Security Notice

htmlrl performs **basic HTML escaping only** and is **NOT context-aware**.

This means:

- Variable output is escaped for **HTML text nodes** only.
- The engine does **not** detect whether a variable is rendered inside:
  - HTML attributes
  - URLs
  - JavaScript contexts
  - CSS contexts

### Potentially Unsafe Usage

Example:

```html
<a href="@url">Click</a>
<img src="@src">
<div onclick="@handler"></div>
```

Escaping alone is **not sufficient** in these contexts and may lead to
security vulnerabilities such as XSS.

### Your Responsibility

When using htmlrl, **you must ensure** that:

- All data rendered into attributes or URLs is **explicitly validated**
- Untrusted input is **never rendered into executable contexts**
- You understand the HTML context where a variable is inserted

htmlrl intentionally avoids implicit complex, context-aware escaping to remain
simple, predictable, and explicit.

Future versions may introduce optional mechanisms for safer attribute handling,
but **no automatic guarantees are currently provided**.

---

## Planned Features

- Conditionals
- Loops
- Template partials
- Improved diagnostics

This roadmap reflects intent, not guarantees.

---

## License

This project is licensed under the **MIT License**.
