( function ( mw ) {
	OOJSPlus.formelement.UserGroupMultiselect = function () {
		OOJSPlus.formelement.UserGroupMultiselect.parent.call( this );
	};

	OO.inheritClass( OOJSPlus.formelement.UserGroupMultiselect, mw.ext.forms.formElement.InputFormElement );

	OOJSPlus.formelement.UserGroupMultiselect.prototype.getElementConfig = function () {
		const config = OOJSPlus.formelement.UserGroupMultiselect.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	OOJSPlus.formelement.UserGroupMultiselect.prototype.getType = function () {
		return 'user_group_multiselect';
	};

	OOJSPlus.formelement.UserGroupMultiselect.prototype.getWidgets = function () {
		return {
			view: OOJSPlus.ui.widget.UserGroupMultiselectWidget,
			edit: OOJSPlus.ui.widget.UserGroupMultiselectWidget
		};
	};

	OOJSPlus.formelement.UserGroupMultiselect.prototype.getDisplayName = function () {
		return mw.message( 'oojsplus-formelement-type-user-group-multiselect' ).text();
	};

	mw.ext.forms.registry.Type.register( 'user_group_multiselect', new OOJSPlus.formelement.UserGroupMultiselect() );

}( mediaWiki ) );
