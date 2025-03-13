( function ( mw ) {
	OOJSPlus.formelement.TitleMultiselect = function () {
		OOJSPlus.formelement.TitleMultiselect.parent.call( this );
	};

	OO.inheritClass( OOJSPlus.formelement.TitleMultiselect, mw.ext.forms.formElement.InputFormElement );

	OOJSPlus.formelement.TitleMultiselect.prototype.getElementConfig = function () {
		const config = OOJSPlus.formelement.TitleMultiselect.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	OOJSPlus.formelement.TitleMultiselect.prototype.getType = function () {
		return 'title_multiselect';
	};

	OOJSPlus.formelement.TitleMultiselect.prototype.getWidgets = function () {
		return {
			view: OO.ui.LabelWidget,
			edit: OOJSPlus.ui.widget.TitleMultiselectWidget
		};
	};

	OOJSPlus.formelement.TitleMultiselect.prototype.getDisplayName = function () {
		return mw.message( 'oojsplus-formelement-type-title-multiselect' ).text();
	};

	mw.ext.forms.registry.Type.register( 'title_multiselect', new OOJSPlus.formelement.TitleMultiselect() );

}( mediaWiki ) );
