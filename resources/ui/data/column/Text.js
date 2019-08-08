( function( mw, $ ) {
	OOJSPlus.ui.data.column.Text = function ( cfg ) {
		OOJSPlus.ui.data.column.Text.parent.call( this, cfg );

		this.$element.addClass( 'text-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Text, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Text.prototype.renderCell = function( value ) {
		var $cell = OOJSPlus.ui.data.column.Text.parent.prototype.renderCell.apply( this, [ value ] );
		$cell.addClass( 'text-cell' );
		return $cell;
	};

	OOJSPlus.ui.data.column.Text.prototype.getViewControls = function( value ) {
		return new OO.ui.LabelWidget( {
			label: value
		} );
	};

	OOJSPlus.ui.data.column.Text.prototype.getEditControls = function( value ) {
		var input = new OO.ui.TextInputWidget( {
			value: value
		} );
		input.$element.addClass( 'oojsplus-data-edit' );
		return input;
	};

	OOJSPlus.ui.data.column.Text.prototype.getNewValue = function( editWidget ) {
		return editWidget.getValue();
	};

	OOJSPlus.ui.data.column.Text.prototype.sort = function( a, b ) {
		return a.localeCompare( b );
	};

} )();