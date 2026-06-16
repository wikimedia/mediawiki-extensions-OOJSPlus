OOJSPlus.ui.widget.FilterWidget = function ( config ) {
	config = config || {};

	OOJSPlus.ui.widget.FilterWidget.parent.call( this, config );

	this.mobileView = !!config.mobileView;
	this.ariaLabel = config.ariaLabel || mw.message( 'oojsplus-filter-widget-aria-label' ).text();
	this.batchTextCallback = typeof config.batchTextCallback === 'function' ? config.batchTextCallback : null;
	this.dataParser = typeof config.dataParser === 'function' ? config.dataParser : this.defaultDataParser;

	this.filterData = {};
	this.activeFilter = config.activeFilter || null;

	this.$element.addClass( 'oojsplus-ui-widget-filter-widget' );
};

OO.inheritClass( OOJSPlus.ui.widget.FilterWidget, OO.ui.Widget );

OOJSPlus.ui.widget.FilterWidget.prototype.loadData = function ( filterData, activeFilter ) {
	this.setData( filterData, activeFilter );
};

OOJSPlus.ui.widget.FilterWidget.prototype.setData = function ( filterData, activeFilter ) {
	this.filterData = filterData || {};
	if ( activeFilter !== undefined ) {
		this.activeFilter = activeFilter;
	}

	this.setOptionsData( this.dataParser( this.filterData ) );
};

OOJSPlus.ui.widget.FilterWidget.prototype.setOptionsData = function ( options ) {
	if ( this.mobileView ) {
		this.updateMobileContent( options );
		return;
	}
	this.updateContent( options );
};

OOJSPlus.ui.widget.FilterWidget.prototype.updateContent = function ( options ) {
	if ( !this.selectWidget ) {
		this.selectWidget = new OOJSPlus.ui.widget.GroupedSelectWidget();
		if ( this.ariaLabel ) {
			this.selectWidget.getMenu().$element.attr( 'aria-label', this.ariaLabel );
		}
		this.selectWidget.connect( this, {
			select: 'filterSelected'
		} );
		this.$element.append( this.selectWidget.$element );
	}

	this.selectWidget.getMenu().clearItems();
	this.selectWidget.setOptionsData( options );
	if ( this.activeFilter !== null ) {
		this.selectWidget.getMenu().selectItemByData( this.activeFilter );
	}
};

OOJSPlus.ui.widget.FilterWidget.prototype.updateMobileContent = function ( options ) {
	const mobileOptions = [];

	for ( let i = 0; i < options.length; i++ ) {
		if ( options[ i ].optgroup !== undefined ) {
			mobileOptions.push( new OO.ui.MenuSectionOptionWidget( {
				label: options[ i ].optgroup
			} ) );
			continue;
		}

		mobileOptions.push( new OO.ui.MenuOptionWidget( {
			data: options[ i ].data,
			label: options[ i ].label
		} ) );
	}

	if ( !this.selectWidget ) {
		this.selectWidget = new OO.ui.DropdownWidget( {
			menu: {
				items: mobileOptions
			}
		} );
		if ( this.ariaLabel ) {
			this.selectWidget.getMenu().$element.attr( 'aria-label', this.ariaLabel );
		}
		this.selectWidget.getMenu().connect( this, {
			select: 'filterSelected'
		} );
		this.$element.append( this.selectWidget.$element );
		if ( this.activeFilter !== null ) {
			this.selectWidget.getMenu().selectItemByData( this.activeFilter );
		}
		return;
	}

	this.selectWidget.getMenu().clearItems();
	this.selectWidget.getMenu().addItems( mobileOptions );
	if ( this.activeFilter !== null ) {
		this.selectWidget.getMenu().selectItemByData( this.activeFilter );
	}
};

OOJSPlus.ui.widget.FilterWidget.prototype.filterSelected = function () {
	const selectedItem = this.selectWidget.getMenu().findSelectedItem();
	if ( !selectedItem ) {
		return;
	}

	const selectedData = selectedItem.getData ? selectedItem.getData() : selectedItem.data;
	this.activeFilter = selectedData;

	this.emit( 'selectItem', selectedData, selectedItem );
};

OOJSPlus.ui.widget.FilterWidget.prototype.defaultDataParser = function ( filterData ) {
	if ( Array.isArray( filterData ) ) {
		if ( filterData.length && ( filterData[ 0 ].data !== undefined || filterData[ 0 ].optgroup !== undefined ) ) {
			return filterData;
		}
		return this.optionsFromGroupArray( filterData );
	}

	return this.optionsFromGroupObject( filterData );
};

OOJSPlus.ui.widget.FilterWidget.prototype.optionsFromGroupArray = function ( groups ) {
	const options = [];

	for ( let i = 0; i < groups.length; i++ ) {
		const group = groups[ i ];
		const items = Array.isArray( group.items ) ? group.items : [];
		if ( !items.length ) {
			continue;
		}

		const showGroupLabel = group.showLabel !== undefined ? group.showLabel : group.type !== 'title';
		if ( group.label && showGroupLabel !== false ) {
			options.push( { optgroup: group.label } );
		}

		for ( let j = 0; j < items.length; j++ ) {
			options.push( this.normalizeItemConfig( items[ j ], group.type ) );
		}
	}

	return options;
};

OOJSPlus.ui.widget.FilterWidget.prototype.optionsFromGroupObject = function ( groups ) {
	const options = [];

	for ( const key in groups ) {
		if ( !Object.prototype.hasOwnProperty.call( groups, key ) ) {
			continue;
		}

		const group = groups[ key ];
		const items = Array.isArray( group.items ) ? group.items : [];
		if ( !items.length ) {
			continue;
		}

		const showGroupLabel = group.showLabel !== undefined ? group.showLabel : group.type !== 'title';
		if ( group.label && showGroupLabel ) {
			options.push( { optgroup: group.label } );
		}

		for ( let i = 0; i < items.length; i++ ) {
			options.push( this.normalizeItemConfig( items[ i ], group.type ) );
		}
	}

	return options;
};

OOJSPlus.ui.widget.FilterWidget.prototype.normalizeItemConfig = function ( item, groupType ) {
	const option = { // eslint-disable-line mediawiki/class-doc
		data: item.data !== undefined ? item.data : ( groupType ? groupType + '-' + item.key : item.key ),
		label: item.label !== undefined ? item.label : item.key,
		classes: item.classes !== undefined ? item.classes : [],
		attr: item.attr !== undefined ? item.attr : []
	};

	const batch = item.batch !== undefined ? item.batch : item.count;
	if ( batch !== undefined ) {
		option.batch = batch;
		option.batchText = item.batchText !== undefined ? item.batchText : this.getBatchText( batch );
	}

	return option;
};

OOJSPlus.ui.widget.FilterWidget.prototype.getBatchText = function ( batch ) {
	if ( this.batchTextCallback ) {
		return this.batchTextCallback( batch );
	}
	return mw.message( 'oojsplus-filter-widget-count-aria-label', batch ).text();
};
