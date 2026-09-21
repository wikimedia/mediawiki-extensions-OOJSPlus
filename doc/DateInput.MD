# Date input
Date picker based on the browser's native date input (`<input type="date">`). It is a lightweight
replacement for `mw.widgets.DateInputWidget`: no popup/overlay handling is needed, since the calendar
is provided by the browser.

## Usage

Widget class: `OOJSPlus.ui.widget.DateInputWidget`
ResourceLoader module: `ext.oOJSPlus.widgets`

The widget extends `OO.ui.TextInputWidget`, so all its config options, methods and events are available.

```javascript

new OOJSPlus.ui.widget.DateInputWidget( {
	required: true,
	placeholder: true // Show "No date selected" while empty, or pass a custom string
} );

```

## Value
The value is always in `YYYY-MM-DD` format (e.g. `2026-09-21`), both for `getValue()` and `setValue()`,
regardless of the format that is displayed to the user. An empty string means no date is set.

## Placeholder
Browsers ignore the `placeholder` attribute on date inputs and show the date format instead
(e.g. `dd.mm.yyyy`). When the `placeholder` option is set, the widget hides the native format hint
and shows the placeholder text (in the usual placeholder color) until:

- a date has been picked, or
- the user starts to enter a date via keyboard

Pass `true` to use the default message `oojsplus-date-input-placeholder` ("No date selected"),
or a string for a custom text.

## Localization
The displayed date format (e.g. `dd.mm.yyyy` vs. `mm/dd/yyyy`) and the language of the calendar
popup (month and weekday names, buttons) are determined by the **browser / operating system language**,
not by the language the user set in the wiki preferences. This is standard browser behaviour for native
date inputs and cannot be controlled from the page (the `lang` attribute, CSS and JS have no effect).

Example: a user with a German browser will see `tt.mm.jjjj` and a German calendar, even if the wiki
interface language is set to English.

Everything rendered by the wiki itself, such as field labels and the placeholder text, follows the
user's wiki language as usual. The value format (`YYYY-MM-DD`) is not affected by any of this.
