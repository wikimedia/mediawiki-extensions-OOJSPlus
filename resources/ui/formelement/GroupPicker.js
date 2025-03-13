( function ( mw ) {
	OOJSPlus.formelement.GroupPicker = function () {
		OOJSPlus.formelement.GroupPicker.parent.call( this );
	};

	OO.inheritClass( OOJSPlus.formelement.GroupPicker, mw.ext.forms.formElement.InputFormElement );

	OOJSPlus.formelement.GroupPicker.prototype.getElementConfig = function () {
		const config = OOJSPlus.formelement.GroupPicker.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	OOJSPlus.formelement.GroupPicker.prototype.getType = function () {
		return 'group_picker';
	};

	OOJSPlus.formelement.GroupPicker.prototype.getWidgets = function () {
		return {
			view: OO.ui.LabelWidget,
			edit: OOJSPlus.ui.widget.GroupInputWidget
		};
	};

	OOJSPlus.formelement.GroupPicker.prototype.getDisplayName = function () {
		return mw.message( 'oojsplus-formelement-type-group-picker' ).text();
	};

	mw.ext.forms.registry.Type.register( 'group_picker', new OOJSPlus.formelement.GroupPicker() );

}( mediaWiki ) );
