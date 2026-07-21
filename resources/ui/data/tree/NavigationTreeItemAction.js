( function () {
	OOJSPlus.ui.data.NavigationTreeItemAction = function ( cfg ) {
		cfg = cfg || {};
		this.actionName = cfg.actionName || '';
		this.label = cfg.label || '';
		this.invisibleLabel = cfg.invisibleLabel || false;
		this.title = cfg.title || this.label;
		this.icon = cfg.icon || '';
		this.classes = cfg.classes || [];
	};

	OO.initClass( OOJSPlus.ui.data.NavigationTreeItemAction );

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.getName = function () {
		return this.actionName;
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.getLabel = function () {
		return this.label;
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.setLabel = function ( label ) {
		this.label = label;
		if ( !this.title ) {
			this.title = label;
		}
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.getTitle = function () {
		return this.title || this.getLabel();
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.setTitle = function ( title ) {
		this.title = title;
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.getIcon = function () {
		return this.icon;
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.isVisible = function () {
		return true;
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.isDisabled = function () {
		return false;
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.getButtonConfig = function ( itemWidget ) {
		return { // eslint-disable-line mediawiki/class-doc
			framed: false,
			icon: this.getIcon( itemWidget ),
			label: this.getLabel( itemWidget ),
			invisibleLabel: this.invisibleLabel,
			title: this.getTitle( itemWidget ),
			disabled: this.isDisabled( itemWidget ),
			classes: [ 'action-tree-item' ].concat( this.classes || [] ),
			data: this.getName()
		};
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.makeContext = function ( itemWidget, buttonWidget ) {
		const title = itemWidget && itemWidget.buttonCfg && itemWidget.buttonCfg.title ?
			itemWidget.buttonCfg.title : itemWidget.getName();
		let pageName = itemWidget.getName();
		if ( pageName.charAt( 0 ) === ':' ) {
			pageName = pageName.slice( 1 );
		}

		return {
			item: itemWidget.$element[ 0 ],
			itemWidget: itemWidget,
			button: buttonWidget,
			tree: itemWidget.tree,
			pageName: pageName,
			title: title,
			data: itemWidget.buttonCfg
		};
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.createButton = function ( itemWidget ) {
		if ( !this.isVisible( itemWidget ) ) {
			return null;
		}

		const buttonWidget = new OO.ui.ButtonInputWidget( this.getButtonConfig( itemWidget ) );
		buttonWidget.connect( this, {
			click: function () {
				this.onAction( this.makeContext( itemWidget, buttonWidget ) );
			}
		} );

		return buttonWidget;
	};

	OOJSPlus.ui.data.NavigationTreeItemAction.prototype.onAction = function () {
	};

}() );
