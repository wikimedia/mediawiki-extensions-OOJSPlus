OOJSPlus.formelement.Percent = function () {
	OOJSPlus.formelement.Percent.parent.call( this );
};

OO.inheritClass( OOJSPlus.formelement.Percent, mw.ext.forms.formElement.InputFormElement );

OOJSPlus.formelement.Percent.prototype.getElementConfig = function () {
	const config = OOJSPlus.formelement.Percent.parent.prototype.getElementConfigInternal.call( this );
	return this.returnConfig( config );
};

OOJSPlus.formelement.Percent.prototype.getType = function () {
	return 'percent';
};

OOJSPlus.formelement.Percent.prototype.getWidgets = function () {
	return {
		view: OO.ui.LabelWidget,
		edit: OOJSPlus.ui.widget.PercentInputWidget
	};
};

OOJSPlus.formelement.Percent.prototype.getDisplayName = function () {
	return mw.message( 'oojsplus-formelement-type-percent' ).text();
};

mw.ext.forms.registry.Type.register( 'percent', new OOJSPlus.formelement.Percent() );
