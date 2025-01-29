<?php

namespace OOJSPlus\Api;

use MediaWiki\Api\ApiQueryAllCategories as Base;

class ApiQueryAllCategories extends Base {

	/**
	 * @inheritDoc
	 */
	public function execute() {
		parent::execute();

		$params = $this->extractRequestParams();
		if ( !$params['contains'] ) {
			return;
		}

		$result = $this->getResult();
		$data = $result->getResultData( [ 'query', $this->getModuleName() ] );

		$result->removeValue( [ 'query', $this->getModuleName() ], null );
		foreach ( $this->fullSearch( $data, $params['contains'] ) as $item ) {
			$result->addValue( [ 'query', $this->getModuleName() ], null, $item );
		}
		$result->addIndexedTagName( [ 'query', $this->getModuleName() ], 'c' );
	}

	/**
	 * @param int $flags
	 * @return array|null[]
	 */
	public function getAllowedParams( $flags = 0 ) {
		return parent::getAllowedParams() + [
			'contains' => null,
		];
	}

	/**
	 * @param array $data
	 * @param string $search
	 * @return array
	 */
	private function fullSearch( $data, $search ) {
		$search = mb_strtolower( $search );
		return array_filter( $data, static function ( $item ) use ( $search ) {
			if ( !is_array( $item ) ) {
				return false;
			}
			return strpos( mb_strtolower( $item['category'] ), $search ) !== false;
		} );
	}
}
