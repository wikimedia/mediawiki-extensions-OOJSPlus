( function () {
	OOJSPlus.ui.widget.StoreDataInputWidget = function ( config ) {
		config = config || {};
		config.$overlay = config.$overlay || true;

		OOJSPlus.ui.widget.StoreDataInputWidget.parent.call( this, Object.assign( {}, config, { autocomplete: false } ) );

		OO.ui.mixin.LookupElement.call( this, Object.assign( {
			allowSuggestionsWhenEmpty: true,
			menu: {
				filterFromInput: false
			}
		}, config ) );

		this.$element.addClass( 'oojsplus-widget-storeDataInputWidget' );
		this.lookupMenu.$element.addClass( 'oojsplus-widget-storeDataInputWidget-menu' );
		this.queryMinChars = config.queryMinChars || 0;
		this.queryAction = config.queryAction;
		this.additionalQueryParams = config.additionalQueryParams || {};
		this.limit = config.limit || 9999;
		this.labelField = config.labelField;
		this.groupBy = config.groupBy || null;
		this.groupLabelCallback = config.groupLabelCallback || null;

		this.selectedItem = null;
		this.lookupMenu.filterFromInput = false;
	};

	/* Setup */

	OO.inheritClass( OOJSPlus.ui.widget.StoreDataInputWidget, OO.ui.TextInputWidget );
	OO.mixinClass( OOJSPlus.ui.widget.StoreDataInputWidget, OO.ui.mixin.LookupElement );

	/* Methods */

	/**
	 * Handle menu item 'choose' event, updating the text input value to the value of the clicked item.
	 *
	 * @param {OO.ui.MenuOptionWidget} item Selected item
	 */
	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.onLookupMenuChoose = function ( item ) {
		this.closeLookupMenu();
		this.setLookupsDisabled( true );
		this.setValue( item );
		this.setLookupsDisabled( false );
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.getValidity = function () {
		if ( this.dataField ) {
			return OOJSPlus.ui.widget.StoreDataInputWidget.parent.prototype.getValidity.call( this );
		}
		const dfd = $.Deferred();

		if ( !this.required ) {
			dfd.resolve();
		} else {
			if ( this.selectedItem ) {
				dfd.resolve();
			} else {
				dfd.reject();
			}
		}

		return dfd.promise();
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.setValue = function ( item ) {
		if ( item instanceof OO.ui.MenuOptionWidget ) {
			this.selectedItem = item;
			item = item.getLabel();
			if ( this.selectedItem && this.selectedItem.getLabel() === item ) {
				// Chosen item has the same label as what is already typed
				this.emit( 'change', item );
			}
		} else if ( this.selectedItem && this.selectedItem.getLabel() === item ) {
			// On click in the field, it will re-set value. If this value is the same
			// as the already selected item, do nothing.
			return;
		} else {
			this.selectedItem = null;
		}
		return OOJSPlus.ui.widget.StoreDataInputWidget.parent.prototype.setValue.call( this, item );
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.getSelectedItemData = function () {
		if ( this.selectedItem instanceof OO.ui.MenuOptionWidget ) {
			return this.selectedItem.getData();
		}
		return null;
	};

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.focus = function () {
		// Prevent programmatic focus from opening the menu
		this.setLookupsDisabled( true );

		// Parent method
		const retval = OOJSPlus.ui.widget.StoreDataInputWidget.parent.prototype.focus.apply( this, arguments );

		this.setLookupsDisabled( false );

		return retval;
	};

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.getLookupRequest = function () {
		const inputValue = this.value,
			queryData = Object.assign( {
				action: this.queryAction,
				limit: this.limit
			}, this.additionalQueryParams );

		if ( inputValue.trim() !== '' ) {
			queryData.filter = JSON.stringify( [ {
				comparison: 'ct',
				value: inputValue,
				property: this.labelField,
				type: 'string'
			} ] );
		}

		return new mw.Api().get( queryData );
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response.results || {};
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		const items = [];
		let i, dataItem;

		if ( this.groupBy ) {
			const grouped = this.group( data );
			for ( const group in grouped ) {
				if ( !grouped.hasOwnProperty( group ) ) {
					continue;
				}
				items.push( new OO.ui.MenuSectionOptionWidget( {
					label: group
				} ) );
				for ( i = 0; i < grouped[ group ].length; i++ ) {
					dataItem = grouped[ group ][ i ];
					items.push( new OO.ui.MenuOptionWidget( {
						label: dataItem[ this.labelField ],
						data: dataItem
					} ) );
				}
			}
		} else {
			for ( i = 0; i < data.length; i++ ) {
				dataItem = data[ i ];
				items.push( new OO.ui.MenuOptionWidget( {
					label: dataItem[ this.labelField ],
					data: dataItem
				} ) );
			}
		}

		return items;
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.group = function ( data ) {
		const grouped = {};

		for ( let i = 0; i < data.length; i++ ) {
			if ( !data[ i ].hasOwnProperty( this.groupBy ) ) {
				continue;
			}
			const groupLabel = this.getGroupLabel( data[ i ], this.groupLabelCallback );
			if ( !grouped.hasOwnProperty( groupLabel ) ) {
				grouped[ groupLabel ] = [];
			}
			grouped[ groupLabel ].push( data[ i ] );
		}

		return grouped;
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.getGroupLabel = function ( data, labelCallback ) {
		if ( typeof labelCallback !== 'function' ) {
			return data[ this.groupBy ];
		}
		return labelCallback( data[ this.groupBy ], data );
	};

	OOJSPlus.ui.widget.StoreDataInputWidget.prototype.onLookupInputChange = function () {
		const value = this.getValue();
		if ( value.length != 0 && value.length < this.queryMinChars ) { // eslint-disable-line eqeqeq
			return;
		}
		if ( this.lookupInputFocused ) {
			this.populateLookupMenu();
		}
	};

}() );
