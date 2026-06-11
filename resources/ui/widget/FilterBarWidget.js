OOJSPlus.ui.widget.FilterBarWidget = function ( config ) {
	OOJSPlus.ui.widget.FilterBarWidget.parent.call( this, Object.assign( {}, config, {} ) );
	this.filterElements = config.filterElements || [];
	this.noFilterActiveLabel = config.noFilterActiveLabel ||
		mw.message( 'oojsplus-widget-filterbar-show-all' ).text();
	this.activeFilterElement = null;
	this.expandedVersion = this.filterElements.length >= 7;

	this.$element.addClass( 'oojsplus-filter-bar-widget' );
	this.setupFilter();
};

OO.inheritClass( OOJSPlus.ui.widget.FilterBarWidget, OO.ui.Widget );

OOJSPlus.ui.widget.FilterBarWidget.prototype.setupFilter = function () {
	this.setupNoActiveFilterPill();
	// TODO container needs aria
	this.$filterCnt = $( '<div>' ).addClass( 'oojsplus-filter-bar-widget-elements' );
	this.$filterCnt.attr( 'role', 'group' );
	this.filterChips = [];
	if ( !this.expandedVersion ) {
		this.addChipElements( this.filterElements );
		return;
	}
	const previewElements = this.filterElements.slice( 0, 3 );
	this.addChipElements( previewElements );
	this.setupPopupContent();
	this.$element.append( this.$filterCnt );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.setupNoActiveFilterPill = function () {
	this.noActiveFilterChip = new OOJSPlus.ui.widget.ChipWidget( {
		label: this.noFilterActiveLabel,
		selected: true
	} );
	this.noActiveFilterChip.connect( this, {
		select: () => {
			if ( this.activeFilterElement === this.noActiveFilterChip ) {
				return;
			}
			this.activeFilterElement.unselect();
			this.activeFilterElement = this.noActiveFilterChip;
			if ( this.expandedVersion ) {
				const selectedItem = this.menu.findSelectedItem();
				if ( selectedItem ) {
					this.menu.unselectItem( selectedItem );
				}
			}
			this.emit( 'clear' );
		}
	} );
	this.activeFilterElement = this.noActiveFilterChip;
	this.$element.append( this.noActiveFilterChip.$element );

	const $separator = $( '<div>' ).addClass( 'oojsplus-filter-bar-separator' );
	this.$element.append( $separator );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.addChipElements = function ( elements ) {
	for ( const element in elements ) {
		const filter = new OOJSPlus.ui.widget.ChipWidget( {
			label: elements[ element ],
			name: elements[ element ],
			selected: false
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
			}
		} );
		this.filterChips.push( filter );
		this.$filterCnt.append( filter.$element );
	}

	this.$element.append( this.$filterCnt );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.selectChip = function ( filter ) {
	if ( this.activeFilterElement === filter ) {
		return;
	}
	this.activeFilterElement.unselect();
	this.activeFilterElement = filter;
	this.emit( 'select', filter.getName() );
};

OOJSPlus.ui.widget.FilterBarWidget.prototype.setElements = function () {
	const optionWidgets = [];
	for ( const element in this.filterElements ) {
		const option = new OO.ui.MenuOptionWidget( {
			data: this.filterElements[ element ],
			label: this.filterElements[ element ]
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
	this.activeFilterElement.unselect();
	const filter = new OOJSPlus.ui.widget.ChipWidget( {
		label: item.data,
		name: item.data,
		selected: true
	} );
	filter.connect( this, {
		select: () => {
			this.selectChip( filter );
		}
	} );
	const found = this.filterChips.find( ( chip ) => chip.getName() === item.data );
	if ( found ) {
		found.select();
		return;
	}
	this.filterChips.push( filter );
	this.$filterCnt.prepend( filter.$element );
	this.popupButton.onAction();
	this.activeFilterElement = filter;
	// Keep always 5 elements visible
	if ( this.filterChips.length > 5 ) {
		const lastChip = this.filterChips.shift();
		lastChip.$element.remove();
	}
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
