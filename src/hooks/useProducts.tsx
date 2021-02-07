/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/OfficeManager/products';
import { request } from '../global/types';
import { modifiedCallback, modifiedExtraCallback } from '../utils/function';
import { useActionDispatch } from './useActionDispatch';

const CREATE_SUCCESS_MESSAGE = 'Product was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the product';

const EDIT_SUCCESS_MESSAGE = 'Product was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the product';

const REMOVE_SUCCESS_MESSAGE = 'Product was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the product';

export const useProducts = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();
	const products = useSelector(selectors.selectProducts());

	const getProducts = useActionDispatch(actions.getProducts);
	const createProduct = useActionDispatch(actions.createProduct);
	const editProduct = useActionDispatch(actions.editProduct);
	const removeProduct = useActionDispatch(actions.removeProduct);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getProductsRequest = () => {
		setRecentRequest(types.GET_PRODUCTS);
		getProducts({ callback });
	};

	const createProductRequest = (product) => {
		setRecentRequest(types.CREATE_PRODUCT);
		const clonedProduct = {
			...product,
			allowable_spoilage: (product.allowable_spoilage || 0) / 100,
		};

		createProduct({
			...clonedProduct,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const editProductRequest = (product, extraCallback = null) => {
		setRecentRequest(types.EDIT_PRODUCT);
		const clonedProduct = {
			...product,
			allowable_spoilage: (product.allowable_spoilage || 0) / 100,
		};

		editProduct({
			...clonedProduct,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const removeProductRequest = (id, extraCallback = null) => {
		setRecentRequest(types.REMOVE_PRODUCT);
		removeProduct({
			id,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		products,
		getProducts: getProductsRequest,
		createProduct: createProductRequest,
		editProduct: editProductRequest,
		removeProduct: removeProductRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
