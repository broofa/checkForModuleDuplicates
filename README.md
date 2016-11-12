 Throw an error when require() may have more than one instance of a module in
 it's cache due to the module being required with inconsitent module name
 casing.

## Usage

    npm install --save checkForModuleDuplicates

Check for duplicates (syncchronously):

    require('checkForModuleDuplicates')();

Alternatively, you can check periodically:

    require('checkForModuleDuplicates').autocheck();

## Explanation

If node is running on a filesystem that's case-insensitive (e.g. MacOSX),
require() is case-insensitive.  At least, in how it resolves to file paths.
So require('foo') and require('FOO') will both resolve to the same 'Foo.js'
file.  However require()'s module caching is case-*sensitive*, meaning the
module instances you get back in that case are *different*!

(To make matters worse, require() is case-sensitive for built-in modules.
 require('http') works, but require('Http') throws, thus reinforcing the naive
 assumption that nodes insures modules are created as singletons.)

This is the [intended
behavior](https://nodejs.org/api/modules.html#modules_module_caching_caveats),
by the way.  Unfortunately, it can lead to some really nasty bugs. Nasty,
because it won't be at all obvious what the underlying cause of the problem
is.

For example, I created this module because I wasted 3 hours tracking down a bug
where Sequelize was failing to generate UUIDs.  The cause?  The
Sequelize.UUIDV4 constant I was passing in to Sequelize came from a different
instance of the Sequelize module and, thus, wasn't actually recognized as
`Sequelize.UUIDV4.  The fix was to change `require('Sequelize')` to
`require('sequelize')`. Everything else worked, however... there was no
indication given that I had inadvertently created a completely different
instance of the module.

So... yeah... fuck that.  Never again.
