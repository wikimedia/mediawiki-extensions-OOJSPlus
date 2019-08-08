( function( mw, $ ) {
	OOJSPlus.ui.data.column.Column = function ( cfg ) {
		OOJSPlus.ui.data.column.Column.parent.call( this, cfg );

		this.id = cfg.id;
		this.type = cfg.type;
		this.headerText = cfg.headerText || '';
		this.editable = cfg.editable || false;
		this.width = cfg.width || false;
		this.sortable = cfg.sortable === false ? false : true;

		this.sortingDirection = 0;

		this.$element.addClass( 'oojsplus-data-gridWidget-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Column, OO.ui.Widget );

	OOJSPlus.ui.data.column.Column.prototype.getHeader = function() {
		var $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header' );
		if( this.width ) {
			$cell.css( 'width', this.width + 'px' );
		}

		var indicator = '';
		if( this.sortingDirection === 1 ) {
			indicator = 'up';
		} else if( this.sortingDirection === -1 ) {
			indicator = 'down';
		}
		var headerButton = new OO.ui.ButtonWidget( {
			framed: false,
			label: this.headerText,
			indicator: indicator
		} );
		headerButton.$element.on( 'click', { sortBy: this.id }, this.onSort.bind( this ) );
		$cell.append( headerButton.$element );
		return $cell;
	};

	OOJSPlus.ui.data.column.Column.prototype.renderCell = function( value, row ) {
		var $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell' );
		$cell.attr( 'data-column', this.id );
		$cell.attr( 'data-value', value );
		if( this.width ) {
			$cell.css( 'width', this.width + 'px' );
		}
		$cell.append( this.getViewControls( value ).$element );
		return $cell;
	}

	OOJSPlus.ui.data.column.Column.prototype.getViewControls = function( value ) {
	};

	OOJSPlus.ui.data.column.Column.prototype.getEditControls = function( value ) {
	};

	OOJSPlus.ui.data.column.Column.prototype.save = function( $cell ) {};

	OOJSPlus.ui.data.column.Column.prototype.isEditable = function() {
		return this.editable;
	};

	OOJSPlus.ui.data.column.Column.prototype.getType = function() {
		return this.type;
	};

	OOJSPlus.ui.data.column.Column.prototype.onSort = function( e ) {
		var sortBy = e.data.sortBy;
		this.emit( 'columnSort', sortBy );
	};

	OOJSPlus.ui.data.column.Column.prototype.isSortable = function() {
		return this.sortable;
	};

	OOJSPlus.ui.data.column.Column.prototype.isSorter = function() {
		return this.sortingDirection !== 0;
	};

	OOJSPlus.ui.data.column.Column.prototype.getSorter = function( dir ) {
		return this.sortingDirection;
	};

	OOJSPlus.ui.data.column.Column.prototype.setSorter = function( dir ) {
		if( dir !== 0 ) {
			this.sortingDirection = dir;
		} else {
			this.sortingDirection = 0;
		}
	};

	OOJSPlus.ui.data.column.Column.prototype.sort = function( a, b ) {
		if( a === b ) {
			return 0;
		}
		return a > b;
	};


} )( mediaWiki, jQuery );