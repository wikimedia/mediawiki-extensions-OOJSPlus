( function () {

	/**
	 *
	 * @example
	 * // A OOJSPlus.ui.widget.GroupedSelectWidget with three options.
	 * const dropdownInput = new OOJSPlus.ui.widget.GroupedSelectWidget( {
	 *     options: [
 	 *        { data: 'a', label: 'First' },
 	 *        { data: 'b', label: 'Second' },
 	 *        { optgroup: 'Group label' },
 	 *        { data: 'c', label: 'First sub-item' }
	 *     ]
	 * } );}
	 */
	OOJSPlus.ui.widget.GroupedSelectWidget = function ( config ) {
		config = config || {};

		OOJSPlus.ui.widget.GroupedSelectWidget.parent.call( this, config );

		this.$element.addClass( 'oojsplus-widget-grouped-listbox-element' );
		this.menu = new OOJSPlus.ui.widget.OutlineSelectWidget();
		this.menu.connect( this, {
			select: ( item ) => {
				this.emit( 'select', item );
			}
		} );

		this.setOptionsData( config.options || [] );
		this.$element.append( this.menu.$element );
	};

	OO.inheritClass( OOJSPlus.ui.widget.GroupedSelectWidget, OO.ui.Widget );

	OOJSPlus.ui.widget.GroupedSelectWidget.prototype.setOptionsData = function ( options ) {
		const optionWidgets = [];
		let previousOptgroup;
		for ( let optIndex = 0; optIndex < options.length; optIndex++ ) {
			const opt = options[ optIndex ];
			let optionWidget;
			if ( opt.optgroup !== undefined ) {
				// Create a <optgroup> menu item.
				optionWidget = this.createMenuSectionOptionWidget( opt.optgroup );
				previousOptgroup = optionWidget;
			} else {
				// Create a normal <option> menu item.
				optionWidget = this.createMenuOptionWidget( opt );
			}
			// Disable the menu option if it is itself disabled or if its parent optgroup is disabled.
			if (
				opt.disabled !== undefined ||
				previousOptgroup instanceof OO.ui.MenuSectionOptionWidget &&
				previousOptgroup.isDisabled()
			) {
				optionWidget.setDisabled( true );
			}
			optionWidgets.push( optionWidget );
		}

		this.menu.addItems( optionWidgets );
	};

	OOJSPlus.ui.widget.GroupedSelectWidget.prototype.createMenuSectionOptionWidget = function ( label ) {
		return new OO.ui.MenuSectionOptionWidget( {
			label: label
		} );
	};

	OOJSPlus.ui.widget.GroupedSelectWidget.prototype.createMenuOptionWidget = function ( opt ) {
		//const optValue = this.cleanUpValue( opt.data );
		return new OOJSPlus.ui.widget.BatchOptionWidget( {
			data: opt.data,
			label: opt.label ? opt.label : opt.data,
			batch: opt.batch ? opt.batch : undefined,
			batchText: opt.batchText ? opt.batchText : '',
			selected: opt.selected || false
		} );
	};

	OOJSPlus.ui.widget.GroupedSelectWidget.prototype.getMenu = function () {
		return this.menu;
	};

}() );