OOJSPlus.ui.widget.FilterableComboBoxWidget = function ( config ) {
	OOJSPlus.ui.widget.FilterableComboBoxWidget.parent.call( this, config );
};

OO.inheritClass( OOJSPlus.ui.widget.FilterableComboBoxWidget, OO.ui.ComboBoxInputWidget );

OOJSPlus.ui.widget.FilterableComboBoxWidget.prototype.onMenuChoose = function ( item ) {
	this.setValue( item.getLabel() );
};

OOJSPlus.ui.widget.FilterableComboBoxWidget.prototype.setValueByData = function ( data ) {
	const options = this.getMenu().getItems();
	const item = options.find( ( opt ) => opt.data === data );
	if( !item ) {
		this.setValue( '' );
		return;
	}
	this.setValue( item.getLabel() );
};