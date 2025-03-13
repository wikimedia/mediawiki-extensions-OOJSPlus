( function ( mw ) {
	OOJSPlus.formelement.GroupMultiselect = function () {
		OOJSPlus.formelement.GroupMultiselect.parent.call( this );
	};

	OO.inheritClass( OOJSPlus.formelement.GroupMultiselect, mw.ext.forms.formElement.InputFormElement );

	OOJSPlus.formelement.GroupMultiselect.prototype.getElementConfig = function () {
		const config = OOJSPlus.formelement.GroupMultiselect.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	OOJSPlus.formelement.GroupMultiselect.prototype.getType = function () {
		return 'group_multiselect';
	};

	OOJSPlus.formelement.GroupMultiselect.prototype.getWidgets = function () {
		return {
			view: OO.ui.LabelWidget,
			edit: OOJSPlus.ui.widget.GroupMultiSelectWidget
		};
	};

	OOJSPlus.formelement.GroupMultiselect.prototype.getDisplayName = function () {
		return mw.message( 'oojsplus-formelement-type-group-multiselect' ).text();
	};

	mw.ext.forms.registry.Type.register( 'group_multiselect', new OOJSPlus.formelement.GroupMultiselect() );
}( mediaWiki ) );
