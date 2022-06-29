( function( mw, $ ) {
	OOJSPlus.ui.data.column.Column = function ( cfg ) {
		OOJSPlus.ui.data.column.Column.parent.call( this, cfg );

		this.id = cfg.id;
		this.type = cfg.type;
		this.headerText = cfg.headerText || '';
		if ( cfg.filter instanceof OOJSPlus.ui.data.filter.Filter ) {
			this.setFilter( cfg.filter );
		} else if ( !$.isEmptyObject( cfg.filter ) ) {
			var filterFactory = new OOJSPlus.ui.data.FilterFactory();
			this.setFilter( filterFactory.makeFilter( cfg.filter ) );
		} else {
			this.filter = null;
		}
		this.width = cfg.width || false;
		this.sortable = cfg.sortable || false;
		if ( cfg.hasOwnProperty( 'sorter' ) && cfg.sorter instanceof OOJSPlus.ui.data.sorter.Sorter ) {
			this.sortable = true;
			this.sorter = cfg.sorter;
		} else if ( this.sortable ) {
			this.sorter = new OOJSPlus.ui.data.sorter.Sorter();
		}
		if ( this.sorter ) {
			this.sortingDirection = null;
		}
		this.valueParser = cfg.valueParser || null;
		this.display = cfg.display || null;
		this.filterButton = null;

		this.$element.addClass( 'oojsplus-data-gridWidget-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Column, OO.ui.Widget );

	OOJSPlus.ui.data.column.Column.prototype.bindToGrid = function( grid ) {
		// STUB - Will be called after the column has been added to the grid.
		// Sometimes columns might need the grid context to set themselves up
	};

	OOJSPlus.ui.data.column.Column.prototype.getHeader = function( data ) {
		var $cell = $( '<th>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header' );
		if( this.width ) {
			$cell.css( 'width', this.width + 'px' );
		}

		this.headerButton = new OO.ui.ButtonWidget( {
			framed: false,
			label: this.headerText,
			classes: [ 'header-button' ]
		} );

		if ( this.sorter ) {
			this.headerButton.connect( this, {
				click: 'toggleSort'
			} );
		}
		$cell.append( this.headerButton.$element );

		if ( this.filter ) {
			$cell.append( this.createFilterLayout( data ).$element );
		}

		return $cell;
	};

	OOJSPlus.ui.data.column.Column.prototype.createFilterLayout = function( data ) {
		this.filterButton = new OO.ui.PopupButtonWidget( {
			icon: 'funnel',
			classes: [ 'filter-button' ],
			framed: false,
			title: mw.message( 'oojsplus-data-grid-filter-label' ).text(),
			$overlay: true,
			popup: {
				head: false,
				$overlay: true,
				autoClose: true,
				$content: this.filter.$element,
				padded: true,
				align: 'force-left',
				autoFlip: false
			}
		} );

		this.filterButton.popup.connect( this, {
			toggle: function( visible ) {
				if ( visible ) {
					this.filter.focus();
				}
			}
		} );

		return this.filterButton;
	};

	OOJSPlus.ui.data.column.Column.prototype.onFilterChange = function( filter, closePopup ) {
		this.emit( 'filter', filter, this.id );
		if ( closePopup ) {
			this.filterButton.getPopup().toggle( false );
		}
	};

	OOJSPlus.ui.data.column.Column.prototype.renderCell = function( value, row ) {
		var $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell' );
		$cell.attr( 'data-column', this.id );
		if( this.width ) {
			$cell.css( 'width', this.width + 'px' );
		}
		$cell.append( this.getCellContent( value, row ) );

		return $cell;
	};

	OOJSPlus.ui.data.column.Column.prototype.getCellContent = function( value, row ) {
		value = this.getDisplayText( value, row );
		if ( value instanceof OO.ui.Element ) {
			return value.$element;
		} else if( value instanceof OO.ui.HtmlSnippet ) {
			return value.toString() || '';
		}

		return this.getViewControls( value, row ).$element;
	};

	OOJSPlus.ui.data.column.Column.prototype.getViewControls = function( value, row ) {
		return new OO.ui.LabelWidget( {
			label: value
		} );
	};

	OOJSPlus.ui.data.column.Column.prototype.getDisplayText = function( value, row ) {
		row = row || {};
		if ( this.display && row.hasOwnProperty( this.display ) ) {
			value = row[this.display];
		}

		if ( typeof this.valueParser === 'function' ) {
			return this.valueParser.call( this, value, row );
		}
		return value;
	};

	OOJSPlus.ui.data.column.Column.prototype.setFilter = function( value ) {
		if ( value instanceof OOJSPlus.ui.data.filter.Filter ) {
			this.filter = value;
			this.filter.connect( this, {
				change: 'onFilterChange'
			} );
			return;
		}
		if ( this.filter instanceof OOJSPlus.ui.data.filter.Filter ) {
			if ( !value.hasOwnProperty( 'type' ) || value.type !== this.filter.getType() ) {
				return;
			}
			this.filter.setValue( value );
		}
	};

	OOJSPlus.ui.data.column.Column.prototype.getType = function() {
		return this.type;
	};

	OOJSPlus.ui.data.column.Column.prototype.toggleSort = function() {
		var directions = [ null, 'ASC', 'DESC' ],
			indicators = [ '', 'up', 'down' ],
			index = directions.indexOf( this.sortingDirection ),
			newIndex = index + 1 === directions.length ? 0 : index + 1,
			indicator = indicators[newIndex];

		this.sortingDirection = directions[newIndex];
		this.headerButton.setIndicator( indicator );
		this.sorter.setDirection( this.sortingDirection );
		this.emit( 'sort', this.sortingDirection === null ? null : this.sorter, this.id );
	};

	OOJSPlus.ui.data.column.Column.prototype.getSorter = function() {
		return this.sorter;
	};

	OOJSPlus.ui.data.column.Column.prototype.setHasActiveFilter = function( active ) {
		if ( !this.filterButton ) {
			return;
		}
		this.filterButton.setFlags( { 'primary': active, 'progressive': active } );
	};


} )( mediaWiki, jQuery );
