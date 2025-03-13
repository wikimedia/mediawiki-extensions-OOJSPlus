OOJSPlus.ui.widget.UserMenuOptionWidget = function ( cfg ) {
	cfg = cfg || {};
	cfg.showProfileOnHover = false;
	OOJSPlus.ui.widget.UserMenuOptionWidget.parent.call( this, {} );

	this.userWidget = new OOJSPlus.ui.widget.UserWidget( cfg );
	this.$element.append( this.userWidget.$element );

	this.$element.addClass( 'oojsplus-userPicker-menu-option' );
};

OO.inheritClass( OOJSPlus.ui.widget.UserMenuOptionWidget, OO.ui.MenuOptionWidget );

OOJSPlus.ui.widget.UserMenuOptionWidget.prototype.getDisplayName = function () {
	return this.userWidget.getDisplayName();
};

OOJSPlus.ui.widget.UserMenuOptionWidget.prototype.getUsername = function () {
	return this.userWidget.user.user_name;
};
