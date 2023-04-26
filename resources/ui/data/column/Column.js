( function( mw, $ ) {
	/**
	 * Column definition:
	 * dataKey : {
	 *     headerText: "Column header text",
	 *     type: "text" | "number" | "boolean" | "url" | "user" | "date" | "icon" | "action",
	 *     align: "left" | "center" | "right",
	 *     // Optional properties:
	 *     sortable: true | false,
	 *     filter: {
	 *          type: "text" | "number" | "boolean" | "list" | "user"
	 *     },
	 *     sticky: true | false, // Only on first column
	 *     width: {number},
	 *     // If you want to display a different value than the one in the data model, you can specify the "display" property
	 *     display: {string},
	 *     valueParser: function ( value, row ) {
	 *          //return {string} | {OO.ui.Widget} | {OO.ui.HtmlSnippet}
	 *     },
	 *     urlProperty: {string}, // Only for type "url", data key that holds the URL
	 *     onlyShowTrue: true | false, // Only for type "boolean", if true, only show true values, show nothing for false
	 *     hidden: true|false, // Hide by default. Default to `false`
	 *
	 * }
	 */
	OOJSPlus.ui.data.column.Column = function ( cfg ) {
		OOJSPlus.ui.data.column.Column.parent.call( this, cfg );

		this.align = cfg.align || 'left';
		this.id = cfg.id;
		this.type = cfg.type;
		this.sticky = cfg.sticky || false;
		this.hidden = cfg.hidden || false;
		this.$overlay = cfg.$overlay || true;

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
		this.maxWidth = cfg.maxWidth || this.width;
		this.minWidth = cfg.minWidth || this.width;
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

		if ( this.sticky && !this.width ) {
			throw new Error( 'Sticky columns must have a width set' );
		}

		this.$element.addClass( 'oojsplus-data-gridWidget-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Column, OO.ui.Widget );

	OOJSPlus.ui.data.column.Column.prototype.bindToGrid = function( grid ) {
		// STUB - Will be called after the column has been added to the grid.
		// Sometimes columns might need the grid context to set themselves up
	};

	OOJSPlus.ui.data.column.Column.prototype.getHeader = function( data ) {
		var $cell = $( '<th>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header' );
		this.setWidth( $cell );
		if ( this.sticky ) {
			$cell.addClass( 'sticky-col' );
		}

		this.headerButton = new OO.ui.ButtonWidget( {
			framed: false,
			label: this.headerText,
			classes: [ 'header-button' ]
		} );
		this.headerButton.$element.css( 'margin-right', '20px' );

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
			$overlay: this.$overlay,
			popup: {
				head: false,
				$overlay: this.$overlay,
				autoClose: false,
				$content: this.filter.$element,
				padded: true,
				align: 'force-left',
				autoFlip: false
			}
		} );

		this.filterButton.popup.connect( this, {
			toggle: function( visible ) {
				this.emit( 'filterToggle', this.filterButton, visible );
				if ( visible ) {
					this.filterButton.setIcon( 'close' );
					this.filter.focus();
				} else {
					this.filterButton.setIcon( 'funnel' );
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
		this.setWidth( $cell );
		if ( this.align !== 'left' ) {
			$cell.css( { 'text-align': this.align } );
		}
		$cell.css( 'margin-right', '10px' );
		$cell.append( this.getCellContent( value, row ) );

		if ( this.sticky ) {
			$cell.addClass( 'sticky-col' );
		}
		return $cell;
	};

	OOJSPlus.ui.data.column.Column.prototype.getCellContent = function( value, row ) {
		value = this.getDisplayText( value, row );
		if ( value instanceof OO.ui.Element ) {
			return value.$element;
		} else if( value instanceof OO.ui.HtmlSnippet ) {
			return value.toString() || '';
		}

		if ( value === null ) {
			// Do not render null cells
			return;
		}
		return this.getViewControls( value, row ).$element;
	};

	OOJSPlus.ui.data.column.Column.prototype.getViewControls = function( value, row ) {
		return new OOJSPlus.ui.widget.ExpandableLabelWidget( { label: value, maxLength: 40 } );
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

	OOJSPlus.ui.data.column.Column.prototype.setWidth = function( $item ) {
		if( this.width ) {
			$item.css( 'width', this.width + 'px' );
		}
		if ( this.minWidth ) {
			$item.css( 'min-width', this.minWidth + 'px' );
		}
		if ( this.maxWidth ) {
			$item.css( 'max-width', this.maxWidth + 'px' );
		}
	};

	OOJSPlus.ui.data.column.Column.prototype.canChangeVisibility = function() {
		return !this.sticky;
	};

	OOJSPlus.ui.data.column.Column.prototype.getVisibility = function() {
		return this.canChangeVisibility() ? ( this.hidden ? 'hidden' : 'visible' ) : 'visible';
	};


} )( mediaWiki, jQuery );
