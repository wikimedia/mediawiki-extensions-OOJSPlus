( function ( mw, $ ) {
	OOJSPlus.formelement.UserMultiselect = function() {
		OOJSPlus.formelement.UserMultiselect.parent.call( this );
	};

	OO.inheritClass( OOJSPlus.formelement.UserMultiselect, mw.ext.forms.formElement.InputFormElement );

	OOJSPlus.formelement.UserMultiselect.prototype.getElementConfig = function() {
		var config = OOJSPlus.formelement.UserMultiselect.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	OOJSPlus.formelement.UserMultiselect.prototype.getType = function() {
		return "user_multiselect";
	};

	OOJSPlus.formelement.UserMultiselect.prototype.getWidgets = function() {
		// TODO: We should have our own widget for this
		return {
			view: mw.widgets.UsersMultiselectWidget,
			edit: mw.widgets.UsersMultiselectWidget
		};
	};

	OOJSPlus.formelement.UserMultiselect.prototype.getDisplayName = function() {
		return mw.message( 'oojsplus-formelement-type-user-multiselect' ).text();
	};

	mw.ext.forms.registry.Type.register( "user_multiselect", new OOJSPlus.formelement.UserMultiselect() );

} )( mediaWiki, jQuery );
