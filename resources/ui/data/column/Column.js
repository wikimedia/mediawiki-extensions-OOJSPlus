( function ( mw, $ ) {
	/**
	 * Column definition:
	 * dataKey : {
	 * headerText: "Column header text",
	 * type: "text" | "number" | "boolean" | "url" | "user" | "date" | "icon" | "action",
	 * align: "left" | "center" | "right",
	 * // Optional properties:
	 * sticky: true | false, // Only on first column
	 * width: {number},
	 * // If you want to display a different value than the one in the data model, you can specify the "display" property
	 * display: {string},
	 * html: true | false, // Only for type "text", if true, the value is treated as HTML
	 * valueParser: function ( value, row ) {
	 * //return {string} | {OO.ui.Widget} | {OO.ui.HtmlSnippet}
	 * },
	 * urlProperty: {string}, // Only for type "url", data key that holds the URL
	 * onlyShowTrue: true | false, // Only for type "boolean", if true, only show true values, show nothing for false
	 * hidden: true|false, // Hide by default. Default to `false`
	 *
	 * }
	 *
	 * @param {Object} cfg
	 */
	OOJSPlus.ui.data.column.Column = function ( cfg ) {
		OOJSPlus.ui.data.column.Column.parent.call( this, cfg );

		this.align = cfg.align || 'left';
		this.id = cfg.id;
		this.type = cfg.type;
		this.sticky = cfg.sticky || false;
		this.hidden = cfg.hidden || false;
		this.maxLabelLength = cfg.maxLabelLength || false;
		this.resizable = cfg.resizable || false;
		this.hasHeader = false;

		this.headerText = cfg.headerText || '';
		this.invisibleLabel = cfg.invisibleLabel || false;
		this.width = cfg.width || false;
		this.maxWidth = cfg.maxWidth || false;
		this.minWidth = cfg.minWidth || false;

		this.valueParser = cfg.valueParser || null;
		this.display = cfg.display || null;

		if ( this.sticky && !this.width ) {
			throw new Error( 'Sticky columns must have a width set' );
		}

		this.$element.addClass( 'oojsplus-data-gridWidget-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Column, OO.ui.Widget );

	OOJSPlus.ui.data.column.Column.prototype.bindToGrid = function ( grid ) {
		this.grid = grid;
	};

	OOJSPlus.ui.data.column.Column.prototype.getHeader = function ( data ) {
		this.hasHeader = true;
		const $cell = $( '<th>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header' );
		this.setWidth( $cell );
		if ( this.sticky ) {
			$cell.addClass( 'sticky-col' );
		}

		this.headerButton = new OO.ui.LabelWidget( {
			label: this.headerText,
			invisibleLabel: this.invisibleLabel,
			classes: [ 'header-button' ]
		} );
		$cell.append( this.headerButton.$element );

		if ( this.resizable ) {
			const grid = this.grid;
			const columnId = this.id;
			const resizeCfg = {
				handles: 'e',
				helper: 'grid-col-resizable-helper',
				stop: function ( e, ui ) {
					// After resizing, set also the min-width of the cell
					// That is the only way to make the table overflow (and therefore set the correct width)
					$( this ).css( 'min-width', ui.size.width );
					grid && grid.emit( 'stateChange', { size: { [columnId]: ui.size.width } } );
				}
			};
			if ( this.minWidth ) {
				resizeCfg.minWidth = this.minWidth;
			}
			if ( this.maxWidth ) {
				resizeCfg.maxWidth = this.maxWidth;
			}
			$cell.resizable( resizeCfg );
		}
		return $cell;
	};

	OOJSPlus.ui.data.column.Column.prototype.renderCell = function ( value, row ) {
		const $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell' );
		$cell.attr( 'data-column', this.id );
		if ( this.align !== 'left' ) {
			$cell.css( { 'text-align': this.align } );
		}
		$cell.css( 'margin-right', '10px' );
		$cell.append( this.getCellContent( value, row ) );

		if ( this.sticky ) {
			$cell.addClass( 'sticky-col' );
		}

		if ( !this.hasHeader ) {
			this.setWidth( $cell );
		}
		return $cell;
	};

	OOJSPlus.ui.data.column.Column.prototype.getCellContent = function ( value, row ) {
		value = this.getDisplayText( value, row );
		if ( value instanceof OO.ui.Element ) {
			return value.$element;
		} else if ( value instanceof OO.ui.HtmlSnippet ) {
			return value.toString() || '';
		}

		if ( value === null ) {
			// Do not render null cells
			return;
		}
		return this.getViewControls( value, row ).$element;
	};

	OOJSPlus.ui.data.column.Column.prototype.getViewControls = function ( value, row ) { // eslint-disable-line no-unused-vars
		return new OOJSPlus.ui.widget.ExpandableLabelWidget( { label: value || '', maxLength: this.maxLabelLength } );
	};

	OOJSPlus.ui.data.column.Column.prototype.getDisplayText = function ( value, row ) {
		row = row || {};
		if ( this.display && row.hasOwnProperty( this.display ) ) {
			value = row[ this.display ];
		}

		if ( typeof this.valueParser === 'function' ) {
			return this.valueParser.call( this, value, row, this.id ); // eslint-disable-line no-useless-call
		}
		return value;
	};

	OOJSPlus.ui.data.column.Column.prototype.setFilter = function ( value ) {
		if ( value instanceof OOJSPlus.ui.data.filter.Filter ) {
			this.filter = value;
			this.filter.setName( this.headerText );
			this.filter.connect( this, {
				change: 'onFilterChange'
			} );
			return;
		}
		if ( this.filter instanceof OOJSPlus.ui.data.filter.Filter ) {
			if ( !value.hasOwnProperty( 'type' ) || value.type !== this.filter.getType() ) {
				return;
			}
			this.filter.setName( this.headerText );
			this.filter.setValue( value );
		}
	};

	OOJSPlus.ui.data.column.Column.prototype.getType = function () {
		return this.type;
	};

	OOJSPlus.ui.data.column.Column.prototype.setWidth = function ( $item ) {
		if ( this.width ) {
			$item.css( 'width', this.width + 'px' );
			$item.css( 'min-width', this.width + 'px' );
		}
		if ( this.minWidth ) {
			$item.css( 'min-width', this.minWidth + 'px' );
		}
		if ( this.maxWidth ) {
			$item.css( 'max-width', this.maxWidth + 'px' );
		}
	};

	OOJSPlus.ui.data.column.Column.prototype.canChangeVisibility = function () {
		return !this.sticky;
	};

	OOJSPlus.ui.data.column.Column.prototype.getVisibility = function () {
		return this.canChangeVisibility() ? ( this.hidden ? 'hidden' : 'visible' ) : 'visible';
	};
}( mediaWiki, jQuery ) );
