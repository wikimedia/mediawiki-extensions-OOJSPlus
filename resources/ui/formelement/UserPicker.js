( function ( mw, $ ) {
	mw.ext.forms.formElement.UserPicker = function() {};

	OO.inheritClass( mw.ext.forms.formElement.UserPicker, mw.ext.forms.formElement.InputFormElement );

	mw.ext.forms.formElement.UserPicker.prototype.getElementConfig = function() {
		var config = mw.ext.forms.formElement.UserPicker.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	mw.ext.forms.formElement.UserPicker.prototype.getType = function() {
		return "user_picker";
	};

	mw.ext.forms.formElement.UserPicker.prototype.getWidgets = function() {
		return {
			view: OOJSPlus.ui.widget.UserWidget,
			edit: OOJSPlus.ui.widget.UserPickerWidget
		};
	};

	mw.ext.forms.registry.Type.register( "user_picker", new mw.ext.forms.formElement.UserPicker() );

} )( mediaWiki, jQuery );
