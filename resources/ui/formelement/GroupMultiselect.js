( function ( mw, $ ) {
	mw.ext.forms.formElement.GroupMultiselect = function() {};

	OO.inheritClass( mw.ext.forms.formElement.GroupMultiselect, mw.ext.forms.formElement.InputFormElement );

	mw.ext.forms.formElement.GroupMultiselect.prototype.getElementConfig = function() {
		var config = mw.ext.forms.formElement.GroupMultiselect.parent.prototype.getElementConfigInternal.call( this );
		return this.returnConfig( config );
	};

	mw.ext.forms.formElement.GroupMultiselect.prototype.getType = function() {
		return "group_multiselect";
	};

	mw.ext.forms.formElement.GroupMultiselect.prototype.getWidgets = function() {
		return {
			view: OO.ui.LabelWidget,
			edit: OOJSPlus.ui.widget.GroupMultiSelectWidget
		};
	};

	mw.ext.forms.registry.Type.register( "group_multiselect", new mw.ext.forms.formElement.GroupMultiselect() );

} )( mediaWiki, jQuery );
