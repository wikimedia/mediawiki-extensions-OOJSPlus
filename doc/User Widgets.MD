# User Picker
This extension now offers extended user picker functionality. It is a drop-in replacement for the default user picker, and offers the following features:

- Search for users by username or realname
- Values shown as real name, but saved as username
- In dropdown with options, user's realname (if available), username and image are shown

## Usage

Widget class: `OOJSPlus.ui.widget.UserPickerWidget`

```javascript

new OOJSPlus.ui.widget.UserPickerWidget( {
	groups: [ 'sysop' ], // Only show users from sysop group
	excludeGroups: [ 'bot' ], // Exclude users from bot group
	menuItemConfig: { // Config for the dropdown menu items
		showRawUsername: false, // If realname is available, hide username
		showImage: false // Hide user image
	}
} );

```

## Setting value
Picker features internal mechanim that will retrieve all necessary user information from the API.
This means that you can set the value of the picker to a username, and the picker will automatically retrieve the user's
realname and image. If the user's realname is not available, the username will be shown instead.


# UserWidget
This widget is used to display users information in a unified way

## Usage
Widget class: `OOJSPlus.ui.widget.UserWidget`

```javascript
new OOJSPlus.ui.widget.UserWidget( {
	user_name: 'WikiSysop', // User name
	user_real_name: 'Wiki Sysop', // User real name, if avilable, otherwise will be automatically retrieved
	user_image: "<image html>", // If avilable, otherwise will be automatically retrieved
	page_url: 'URL to the user page', // If avilable and if showLink == true, otherwise will be automatically retrieved

	showRawUsername: false, // If realname is available, hide username
	showImage: false, // Hide user image
	showLink: true // Make widget an anchor leading to user page

} );
```
