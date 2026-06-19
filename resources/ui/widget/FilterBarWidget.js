OOJSPlus.ui.widget.FilterBarWidget = function ( config ) {
	OOJSPlus.ui.widget.FilterBarWidget.parent.call( this, Object.assign( {}, config, {} ) );
	this.filterElements = config.filterElements || [];
	this.noFilterActiveLabel = config.noFilterActiveLabel ||
		mw.message( 'oojsplus-widget-filterbar-show-all' ).text();
	this.allowUnselect = config.allowUnselect || false;
	this.multiSelect = config.multiSelect || false;
	this.selectedOptions = config.selected || [];
	this.visibleFilter = config.visibleFilter || [];
	this.activeFilterElement = null;
	this.expandedVersion = this.filterElements.length >= 7;

	this.$element.addClass( 'oojsplus-filter-bar-widget' );
	this.setupFilter();
};

OO.inheritClass( OOJSPlus.ui.widget.FilterBarWidget, OO.ui.Widget );

OOJSPlus.ui.widget.FilterBarWidget.prototype.setupFilter = function () {
	this.setupNoActiveFilterPill();

	this.$filterCnt = $( '<div>' ).addClass( 'oojsplus-filter-bar-widget-elements' );
	this.$filterCnt.attr( 'role', 'group' );
	this.filterChips = [];
	if ( !this.expandedVersion ) {
		this.addChipElements( this.filterElements );
		return;
	}

	let previewElements = this.filterElements.slice( 0, 3 );
	if ( this.visibleFilter.length > 0 ) {
		previewElements = this.visibleFilter;
	}

	this.addChipElements( previewElements );
	this.setupPopupContent();
	this.$element.append( this.$filterCnt );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.setupNoActiveFilterPill = function () {
	this.noActiveFilterChip = new OOJSPlus.ui.widget.ChipWidget( {
		label: this.noFilterActiveLabel,
		canUnselect: false,
		selected: !this.selectedOptions.length > 0
	} );
	this.noActiveFilterChip.connect( this, {
		select: () => {
			if ( this.activeFilterElement === this.noActiveFilterChip && this.selectedOptions.length === 0 ) {
				return;
			}
			if ( !this.multiSelect ) {
				this.activeFilterElement.unselect();
				this.activeFilterElement = this.noActiveFilterChip;
				if ( this.expandedVersion ) {
					const selectedItem = this.menu.findSelectedItem();
					if ( selectedItem ) {
						this.menu.unselectItem( selectedItem );
					}
				}
			}
			if ( this.multiSelect ) {
				this.selectedOptions = [];
			}
			this.emit( 'clear' );
		}
	} );
	this.activeFilterElement = this.noActiveFilterChip;
	this.$element.append( this.noActiveFilterChip.$element );

	const $separator = $( '<div>' ).addClass( 'oojsplus-filter-bar-separator' );
	this.$element.append( $separator );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.getSelected = function () {
	if ( this.multiSelect ) {
		return this.selectedOptions;
	}
	return this.activeFilterElement;
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.addChipElements = function ( elements ) {
	for ( const element in elements ) {
		const filter = new OOJSPlus.ui.widget.ChipWidget( {
			label: elements[ element ].label,
			name: elements[ element ].data,
			canUnselect: this.allowUnselect,
			selected: elements[ element ].selected ? elements[ element ].selected : false
		} );
		filter.connect( this, {
			select: () => {
				this.selectChip( filter );
				if ( this.expandedVersion ) {
					const item = this.menu.getItemFromLabel( filter.getName() );
					if ( item ) {
						this.menu.selectItem( item );
					}
				}
			},
			unselect: () => {
				this.unselectChip( filter );
			}
		} );
		this.filterChips.push( filter );
		this.$filterCnt.append( filter.$element );
	}

	this.$element.append( this.$filterCnt );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.selectChip = function ( filter ) {
	const filterName = filter.getName();
	if ( this.activeFilterElement === filter || this.selectedOptions.includes( filterName ) ) {
		return;
	}
	if ( !this.multiSelect ) {
		this.activeFilterElement.unselect();
		this.activeFilterElement = filter;
		return this.emit( 'select', filterName );
	}
	this.selectedOptions.push( filterName );
	this.emit( 'select', filterName );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.unselectChip = function ( filter ) {
	if ( this.expandedVersion ) {
		const item = this.menu.getItemFromLabel( filter.getLabel() );
		if ( item ) {
			this.menu.unselectItem( item );
		}
	}
	if ( this.multiSelect ) {
		const index = this.selectedOptions.indexOf( filter.getName() );
		if ( index !== -1 ) {
			this.selectedOptions.splice( index, 1 );
		}
		if ( this.selectedOptions.length > 0 ) {
			return this.emit( 'unselect', filter.getName() );
		}
	} else {
		this.activeFilterElement.unselect();
	}

	this.activeFilterElement = this.noActiveFilterChip;
	this.emit( 'unselect', filter.getName() );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.setElements = function () {
	const optionWidgets = [];
	for ( const element in this.filterElements ) {
		let isSelected = this.filterElements[ element ].selected ?
			this.filterElements[ element ].selected : false;
		if ( !this.selectedOptions.includes( this.filterElements[ element ].data ) ) {
			isSelected = false;
		}
		const option = new OO.ui.MenuOptionWidget( {
			data: this.filterElements[ element ].data,
			label: this.filterElements[ element ].label,
			selected: isSelected
		} );
		optionWidgets.push( option );
	}
	this.menu.addItems( optionWidgets );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.selectOption = function ( item ) {
	if ( !item ) {
		return;
	}
	if ( this.activeFilterElement.getName() === item.data ) {
		return;
	}
	if ( !this.multiSelect ) {
		this.activeFilterElement.unselect();
	}
	const filter = new OOJSPlus.ui.widget.ChipWidget( {
		label: item.data,
		name: item.data,
		selected: true,
		canUnselect: this.allowUnselect || false
	} );
	filter.connect( this, {
		select: () => {
			this.selectChip( filter );
		},
		unselect: () => {
			this.unselectChip( filter );
		}
	} );
	const found = this.filterChips.find( ( chip ) => chip.getName() === item.data );
	if ( found ) {
		found.select();
		return;
	}
	this.filterChips.push( filter );

	this.popupButton.onAction();
	if ( !this.multiSelect ) {
		this.activeFilterElement = filter;
		// Keep always 5 elements visible
		this.$filterCnt.prepend( filter.$element );
		if ( this.filterChips.length > 5 ) {
			const lastChip = this.filterChips.shift();
			lastChip.$element.remove();
		}
		return this.emit( 'select', item.data );
	}
	this.selectedOptions.push( filter.getName() );
	this.$filterCnt.children().last().before( filter.$element );
	this.emit( 'select', item.data );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.setupPopupContent = function () {
	this.$content = $( '<div>' ).addClass( 'oojsplus-filter-bar-widget-popup-content' );
	this.setupSearch();

	this.menu = new OOJSPlus.ui.widget.OutlineSelectWidget();
	this.menu.connect( this, {
		select: 'selectOption'
	} );
	this.setElements();
	this.$content.append( this.menu.$element );

	this.popupButton = new OO.ui.PopupButtonWidget( {
		framed: false,
		label: mw.message( 'oojsplus-widget-filterbar-show-number-label', this.filterElements.length ).text(),
		popup: {
			padded: false,
			align: 'forwards',
			autoFlip: false,
			$content: this.$content
		}
	} );
	this.$filterCnt.append( this.popupButton.$element );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.setupSearch = function () {
	this.searchInput = new OO.ui.SearchInputWidget( {
		label: mw.message( 'oojsplus-widget-filterbar-search-input-label' ).text(),
		invisibleLabel: true,
		placeholder: mw.message( 'oojsplus-widget-filterbar-search-placeholder-label' ).text()
	} );
	this.searchInput.connect( this, {
		change: ( value ) => {
			const query = value.trim().toLowerCase();
			this.menu.getItems().forEach( ( item ) => {
				const label = ( item.getLabel() || '' ).toString().toLowerCase();
				item.toggle( query === '' || label.includes( query ) );
			} );
		}
	} );
	this.$content.append( this.searchInput.$element );
};
