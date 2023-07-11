# @craftercms/jquery

This package is a wrapper for a custom build of the jQuery library. The build includes only the core + events modules of jquery. The selector module
has been excluded from the build, so it is replaced by a rudimentary selector engine based on the browser's `querySelectorAll` method.

The build was performed using the following command:

```bash
grunt custom:-ajax,-css,-deprecated,-dimensions,-effects,-event/trigger,-offset,-wrap,-core/ready,-deferred,-selector
```
For more information about the custom build, please visit the [jQuery documentation](https://github.com/jquery/jquery#modules).
