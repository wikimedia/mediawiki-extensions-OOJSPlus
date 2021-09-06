( function ( mw, $ ) {
	mw.ext.forms.formElement.GroupPicker = function() {};

	OO.inheritClass( mw.ext.forms.formElement.GroupPicker, mw.ext.forms.formElement.InputFormElement );

	mw.ext.forms.formElement.GroupPicker.prototype.getElementConfig = function() {
		var config = mw.ext.forms.formElement.GroupPicker.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	mw.ext.forms.formElement.GroupPicker.prototype.getType = function() {
		return "group_picker";
	};

	mw.ext.forms.formElement.GroupPicker.prototype.getWidgets = function() {
		return {
			view: OO.ui.LabelWidget,
			edit: OOJSPlus.ui.widget.GroupInputWidget
		};
	};

	mw.ext.forms.registry.Type.register( "group_picker", new mw.ext.forms.formElement.GroupPicker() );

} )( mediaWiki, jQuery );
