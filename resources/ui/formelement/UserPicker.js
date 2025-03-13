( function ( mw ) {
	OOJSPlus.formelement.UserPicker = function () {
		OOJSPlus.formelement.UserPicker.parent.call( this );
	};

	OO.inheritClass( OOJSPlus.formelement.UserPicker, mw.ext.forms.formElement.InputFormElement );

	OOJSPlus.formelement.UserPicker.prototype.getElementConfig = function () {
		const config = OOJSPlus.formelement.UserPicker.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	OOJSPlus.formelement.UserPicker.prototype.getType = function () {
		return 'user_picker';
	};

	OOJSPlus.formelement.UserPicker.prototype.getWidgets = function () {
		return {
			view: OOJSPlus.ui.widget.UserWidget,
			edit: OOJSPlus.ui.widget.UserPickerWidget
		};
	};

	OOJSPlus.formelement.UserPicker.prototype.getDisplayName = function () {
		return mw.message( 'oojsplus-formelement-type-user-picker' ).text();
	};

	mw.ext.forms.registry.Type.register( 'user_picker', new OOJSPlus.formelement.UserPicker() );

}( mediaWiki ) );
