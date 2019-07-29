( function( mw, $ ) {
	OOJSPlus.ui.data.column.Boolean = function ( cfg ) {
		OOJSPlus.ui.data.column.Boolean.parent.call( this, cfg );

		this.$element.addClass( 'boolean-column' );
	};

	OO.inheritClass (OOJSPlus.ui.data.column.Boolean, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Boolean.prototype.renderCell = function( value ) {
		var $cell = OOJSPlus.ui.data.column.Text.parent.prototype.renderCell.apply( this, [ value ] );
		$cell.addClass( 'boolean-cell' );
		return $cell;
	};

	OOJSPlus.ui.data.column.Boolean.prototype.getViewControls = function( value ) {
		if( typeof value === 'string' ) {
			value = value === 'true' ? true : false;
		}
		return new OO.ui.IconWidget( {
			icon: value ? 'check' : 'close'
		} );
	};

	OOJSPlus.ui.data.column.Boolean.prototype.getEditControls = function( value ) {
		if( typeof value === 'string' ) {
			value = value === 'true' ? true : false;
		}
		var input = new OO.ui.CheckboxInputWidget( {
			selected: value
		} );
		input.$element.addClass( 'oojsplus-data-edit' );
		return input;
	};

	OOJSPlus.ui.data.column.Boolean.prototype.getNewValue = function( editWidget ) {
		return editWidget.isSelected();
	};

	OOJSPlus.ui.data.column.Boolean.prototype.sort = function( a, b ) {
		if( a === b ) {
			return 0;
		}
		else if( a === true && b === false ) {
			return 1;
		} else {
			return -1;
		}
	};

} )();