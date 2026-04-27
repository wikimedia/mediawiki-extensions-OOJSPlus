<?php

namespace OOJSPlus;

use MediaWiki\MediaWikiServices;

class Extension {
	public static function callback() {
		mwsInitComponents();
		$GLOBALS['mwsgFormEngineElementModules'][] = 'ext.oOJSPlus.formelements';
	}

	/**
	 * @return string
	 */
	public static function getWidgetConfig() {
		$config = MediaWikiServices::getInstance()
			->getMainConfig();
		return 'OOJSPlus.ui.widget._config = ' . json_encode( [
			'useSplitTitleOption' => $config->get( 'OOJSPlusUseSplitTitleInputWidgetOptions' ),
		] ) . ';';
	}
}
