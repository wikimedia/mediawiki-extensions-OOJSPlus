OOJSPlus.ui.widget.NamespaceInputWidget = function ( config ) {
	OOJSPlus.ui.mixin.NamespaceOptions.call( this );
	config = config || {};
	config.$overlay = config.$overlay || true;
	config.menu = {
		items: this.getNamespaceOptions( config )
	};
	OOJSPlus.ui.widget.NamespaceInputWidget.parent.call( this, config );

	const selectable = this.getMenu().findFirstSelectableItem();
	if ( selectable ) {
		this.setValue( selectable.getData() );
	}
	this.$element.addClass( 'oojsplus-widget-namespaceInputWidget' );
};

OO.inheritClass( OOJSPlus.ui.widget.NamespaceInputWidget, OO.ui.DropdownWidget );
OO.mixinClass( OOJSPlus.ui.widget.NamespaceInputWidget, OOJSPlus.ui.mixin.NamespaceOptions );

OOJSPlus.ui.widget.NamespaceInputWidget.prototype.setValue = function ( value ) {
	if ( !value ) {
		return;
	}
	value = Number( value );
	this.getMenu().selectItemByData( value );
};

OOJSPlus.ui.widget.NamespaceInputWidget.prototype.getValue = function () {
	const item = this.getMenu().findFirstSelectedItem();
	if ( item ) {
		return item.getData();
	}
	return '';
};
