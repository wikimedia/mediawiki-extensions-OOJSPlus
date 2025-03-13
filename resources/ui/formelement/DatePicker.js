( function ( mw ) {
	OOJSPlus.formelement.DatePicker = function () {
		OOJSPlus.formelement.DatePicker.parent.call( this );
	};

	OO.inheritClass( OOJSPlus.formelement.DatePicker, mw.ext.forms.formElement.InputFormElement );

	OOJSPlus.formelement.DatePicker.prototype.getElementConfig = function () {
		// TODO: Custom configs
		const config = OOJSPlus.formelement.DatePicker.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	OOJSPlus.formelement.DatePicker.prototype.getType = function () {
		return 'date_picker';
	};

	OOJSPlus.formelement.DatePicker.prototype.getWidgets = function () {
		return {
			view: OO.ui.LabelWidget,
			edit: mw.widgets.DateInputWidget
		};
	};

	OOJSPlus.formelement.DatePicker.prototype.getDisplayName = function () {
		return mw.message( 'oojsplus-formelement-type-date-picker' ).text();
	};

	mw.ext.forms.registry.Type.register( 'date_picker', new OOJSPlus.formelement.DatePicker() );

}( mediaWiki ) );
